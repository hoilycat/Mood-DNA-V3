from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from rembg import remove
import json
from dotenv import load_dotenv

from app.services.analyzer import (
    analyze_text_with_ocr,
    get_graphics_only_image,
    calculate_brightness,
    extract_color_dna,
    calculate_complexity,
    calculate_saliency,
    calculate_symmetry,
    calculate_space_ratio,
    calculate_contrast,
    calculate_composition,
    calculate_aspect_ratio,
    calculate_effective_color_count,
    calculate_typography_ratio,
    calculate_saturation_ratio,
    calculate_color_harmony_score,
    calculate_roundness,
    calculate_straightness,
    calculate_smoothness,
)
from app.services.ai_consultant import consult_design, compare_designs, consult_batch_audition
from app.services.yie_client import query_yie
from app.services.google_search import get_reference_images
from .database import engine, Base, get_db, ensure_history_columns
from .models import DesignHistory

app = FastAPI()
load_dotenv()
Base.metadata.create_all(bind=engine) # 테이블 생성
ensure_history_columns(engine) # 기존 DB에 새 컬럼 추가 (경량 마이그레이션)

# CORS 설정 (개발 서버만 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"]
)


# ──────────────────────────────────────────────
# 공용 파이프라인 헬퍼
# ──────────────────────────────────────────────

def parse_json_form(raw: str, field: str) -> dict:
    """폼 필드의 JSON 파싱 — 잘못된 입력은 500 대신 400으로 응답"""
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=400, detail=f"'{field}' 필드가 올바른 JSON 형식이 아닙니다.")


# 무드 DNA 9개 지표별 가중치. 합산 후 정규화하므로 절대값보다 '상대 비율'이 중요.
# 구조적 무드를 좌우하는 핵심 지표(복잡도·여백)에 더 큰 가중치를 둔다.
DNA_MATCH_WEIGHTS = {
    "brightness": 1.0,
    "complexity": 1.2,
    "saliency": 1.0,
    "symmetry": 1.0,
    "space": 1.1,
    "contrast": 0.8,
    "composition": 0.8,
    "typo_score": 0.7,
    "harmony_score": 0.9,
}


def dna_match_score(target: dict, actual: dict) -> float:
    """타깃 DNA와 실측 지표 간 가중 거리 → 0~100 일치도 점수.

    - 타깃에 존재하는 지표만 비교한다 (프리셋마다 정의된 지표 수가 다름).
    - 밝기는 0~255 스케일이므로 0~100으로 정규화한 뒤 비교한다.
    - 가중 평균 거리를 100에서 빼서, 타깃과 가까울수록 높은 점수가 되도록 한다.
    """
    total_weight = 0.0
    weighted_diff = 0.0
    for key, weight in DNA_MATCH_WEIGHTS.items():
        if key not in target or key not in actual:
            continue
        try:
            target_val = float(target[key])
            actual_val = float(actual[key])
        except (TypeError, ValueError):
            continue
        if key == "brightness":
            actual_val = actual_val / 255 * 100  # 0~255 → 0~100 정규화
        weighted_diff += weight * abs(target_val - actual_val)
        total_weight += weight

    if total_weight == 0:
        return 0.0
    return round(max(100 - weighted_diff / total_weight, 0.0), 1)

def compute_metrics(image_bytes: bytes, remove_bg: bool):
    """배경 제거 + OCR + 16개 시각 지표 계산. (빠른 단계 — AI 호출 없음)"""
    analyze_bytes = image_bytes
    if remove_bg:
        try:
            analyze_bytes = remove(image_bytes)
        except Exception as e:
            print(f"배경 제거 실패: {e}")

    ocr_result = analyze_text_with_ocr(analyze_bytes)

    # 글자가 있다면 글자를 지운 '순수 그래픽 이미지'로 복잡도 계산
    # (폰트 외곽선 때문에 복잡도가 100으로 튀는 것을 방지)
    if ocr_result["has_text"]:
        graphics_only_bytes = get_graphics_only_image(analyze_bytes, ocr_result["raw_results"])
        complexity_score = calculate_complexity(graphics_only_bytes)
    else:
        complexity_score = calculate_complexity(analyze_bytes)

    metrics = {
        "brightness": calculate_brightness(analyze_bytes),
        "complexity": complexity_score,
        "saliency": calculate_saliency(analyze_bytes),
        "symmetry": calculate_symmetry(analyze_bytes),
        "space": calculate_space_ratio(analyze_bytes),
        # extract_color_dna 내부에서 배경 제거를 또 하지 않도록 remove_bg_internally=False
        "colors": extract_color_dna(analyze_bytes, k=10, remove_bg_internally=False),
        "contrast": calculate_contrast(analyze_bytes),
        "composition": calculate_composition(analyze_bytes),
        "aspect_ratio": calculate_aspect_ratio(analyze_bytes),
        "color_count": calculate_effective_color_count(analyze_bytes),
        "typo_score": calculate_typography_ratio(analyze_bytes),
        "saturation_score": calculate_saturation_ratio(analyze_bytes),
        "harmony_score": calculate_color_harmony_score(analyze_bytes),
        "roundness": calculate_roundness(analyze_bytes),
        "straightness": calculate_straightness(analyze_bytes),
        "smoothness": calculate_smoothness(analyze_bytes),
    }
    return metrics, ocr_result["text_content"]


async def run_critique(image_bytes: bytes, metrics: dict, ocr_text: str,
                       target_dict: dict, context_dict: dict, db: Session):
    """YIE → AI 비평 → 레퍼런스 검색 → DB 저장. (느린 단계)"""
    # 1. YIE GraphRAG 논문 근거 수집 (요청당 1회만 호출)
    yie_result = None
    try:
        yie_question = (
            f"업종 '{context_dict.get('industry', '')}', "
            f"목표 무드 '{context_dict.get('mainMood', '')} - {context_dict.get('subMood', '')}' 디자인에 대해 "
            f"밝기 {metrics['brightness']:.0f}, 복잡도 {metrics['complexity']:.0f}, 대비 {metrics['contrast']:.0f}, "
            f"여백 {metrics['space']:.0f}, 색상 조화도 {metrics['harmony_score']:.0f} 수치를 가진 "
            f"디자인의 강점과 개선 방향을 디자인 학술 논문 기반으로 비평해줘."
        )
        yie_result = await query_yie(
            "design", "디자인 비평", yie_question,
            context={
                "industry": context_dict.get("industry"),
                "mainMood": context_dict.get("mainMood"),
                "brightness": metrics["brightness"],
                "complexity": metrics["complexity"],
                "contrast": metrics["contrast"],
                "harmony": metrics["harmony_score"],
                "space": metrics["space"],
            },
        )
    except Exception as yie_err:
        print(f"[YIE] 오류: {yie_err}")

    # 2. AI 컨설턴트 비평 (YIE 근거를 프롬프트에 주입)
    ai_feedback = consult_design(
        image_bytes, metrics, target_dict, context_dict, ocr_text,
        yie_result=yie_result,
    )

    # 3. 레퍼런스 이미지 검색
    keywords = ai_feedback.get("design_keywords", [])
    category = ai_feedback.get("category", "")
    reference_images = await get_reference_images(keywords, category)

    # 4. DB에 기록 저장
    try:
        new_record = DesignHistory(
            industry=context_dict.get("industry", ""),
            category=category,
            total_score=ai_feedback.get("total_score"),
            brightness=metrics["brightness"],
            complexity=metrics["complexity"],
            saliency=metrics["saliency"],
            symmetry=metrics["symmetry"],
            space=metrics["space"],
            colors=",".join(metrics["colors"]),
            metrics=json.dumps(metrics, ensure_ascii=False),
            description=json.dumps(ai_feedback, ensure_ascii=False), # 한글 깨짐 방지
        )
        db.add(new_record)
        db.commit()
    except Exception as db_err:
        db.rollback()
        print(f"[DB] 히스토리 저장 실패: {db_err}")

    return {
        **ai_feedback,
        "reference_images": reference_images,
        "yie_critique": yie_result,
    }


# ──────────────────────────────────────────────
# 엔드포인트
# ──────────────────────────────────────────────

@app.post("/analyze-metrics")
async def analyze_metrics(
    file: UploadFile = File(...),
    remove_bg: bool = Form(True),
):
    """1단계: 시각 지표만 빠르게 반환 (AI 호출 없음)"""
    image_bytes = await file.read()
    metrics, ocr_text = compute_metrics(image_bytes, remove_bg)
    return {**metrics, "ocr_text": ocr_text}


@app.post("/analyze-critique")
async def analyze_critique(
    file: UploadFile = File(...),
    metrics: str = Form(...),
    ocr_text: str = Form(""),
    target_dna: str = Form(...),
    brand_context: str = Form(...),
    db: Session = Depends(get_db),
):
    """2단계: 1단계 지표를 받아 AI 비평 + YIE + 레퍼런스 반환"""
    image_bytes = await file.read()
    metrics_dict = parse_json_form(metrics, "metrics")
    target_dict = parse_json_form(target_dna, "target_dna")
    context_dict = parse_json_form(brand_context, "brand_context")
    return await run_critique(image_bytes, metrics_dict, ocr_text, target_dict, context_dict, db)


@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    remove_bg: bool = Form(True),
    target_dna: str = Form('{"brightness":50,"complexity":50,"saliency":50,"symmetry":50,"space":50}'),
    brand_context: str = Form(...),
    db: Session = Depends(get_db)
):
    """기존 단일 호출 (지표 + AI 비평 한 번에, 호환용)"""
    image_bytes = await file.read()
    target_dict = parse_json_form(target_dna, "target_dna")
    context_dict = parse_json_form(brand_context, "brand_context")

    metrics, ocr_text = compute_metrics(image_bytes, remove_bg)
    critique = await run_critique(image_bytes, metrics, ocr_text, target_dict, context_dict, db)

    return {**critique, **metrics}


@app.get("/history")
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """최근 분석 기록 조회 (히스토리 아카이빙)"""
    records = (
        db.query(DesignHistory)
        .order_by(DesignHistory.id.desc())
        .limit(limit)
        .all()
    )
    result = []
    for r in records:
        try:
            feedback = json.loads(r.description) if r.description else {}
        except (json.JSONDecodeError, TypeError):
            feedback = {}
        try:
            full_metrics = json.loads(r.metrics) if r.metrics else {}
        except (json.JSONDecodeError, TypeError):
            full_metrics = {}
        result.append({
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "industry": r.industry or "",
            "category": r.category or "",
            "total_score": r.total_score,
            "brightness": r.brightness,
            "complexity": r.complexity,
            "saliency": r.saliency,
            "symmetry": r.symmetry,
            "space": r.space,
            "colors": r.colors.split(",") if r.colors else [],
            "metrics": full_metrics,
            "mood": feedback.get("mood", ""),
            "advice": feedback.get("advice", ""),
        })
    return result


@app.post("/compare")
async def compare_images(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    target_dna: str = Form('{"brightness":50,"complexity":50,"saliency":50,"symmetry":50,"space":50}'),
    brand_context: str = Form(...)
):
    img1_bytes = await file1.read()
    img2_bytes = await file2.read()

    # 1. 배경 제거 후 수치 분석 (로직 통일, /analyze와 동일하게 실패 시 원본 사용)
    a_bytes, b_bytes = img1_bytes, img2_bytes
    try:
        a_bytes = remove(img1_bytes)
        b_bytes = remove(img2_bytes)
    except Exception as e:
        print(f"배경 제거 실패: {e}")

    #텍스트 데이터 파싱
    target_dict = parse_json_form(target_dna, "target_dna")
    context_dict = parse_json_form(brand_context, "brand_context")

    stats1 = {
        "brightness": calculate_brightness(a_bytes),
        "complexity": calculate_complexity(a_bytes),
        "saliency": calculate_saliency(a_bytes),
        "symmetry": calculate_symmetry(a_bytes),
        "space": calculate_space_ratio(a_bytes),
        "colors": extract_color_dna(a_bytes, remove_bg_internally=False)
    }
    stats2 = {
        "brightness": calculate_brightness(b_bytes),
        "complexity": calculate_complexity(b_bytes),
        "saliency": calculate_saliency(b_bytes),
        "symmetry": calculate_symmetry(b_bytes),
        "space": calculate_space_ratio(b_bytes),
        "colors": extract_color_dna(b_bytes, remove_bg_internally=False)
    }

    # 2. Target DNA 일치도 점수 (배치 오디션과 동일한 가중 거리 공식)
    score1 = dna_match_score(target_dict, stats1)
    score2 = dna_match_score(target_dict, stats2)

    # 3. AI 비교 분석
    comparison = compare_designs(img1_bytes, img2_bytes, stats1, stats2, target_dict)

    return {
        "comparison": comparison,
        "stats1": stats1,
        "stats2": stats2,
        "score1": score1,
        "score2": score2
    }


@app.post("/analyze-batch")
async def analyze_batch(
    files: List[UploadFile] = File(...),
    target_dna: str = Form(...),
    brand_context: str = Form(...),
    remove_bg: bool = Form(True),
    db: Session = Depends(get_db)
):
    target_dict = parse_json_form(target_dna, "target_dna")
    context_dict = parse_json_form(brand_context, "brand_context")

    batch_results = []

    for file in files:
        # 1. 파일 읽기
        image_bytes = await file.read()

        # 2. 분석 — 단일 분석과 동일한 파이프라인으로 9개 지표 전부 산출
        metrics, _ = compute_metrics(image_bytes, remove_bg)

        # 3. 점수 계산 — 9개 지표 가중 거리 기반 DNA 일치도
        score = dna_match_score(target_dict, metrics)

        batch_results.append({
            "filename": file.filename,
            "score": score,
            # consult_batch_audition 이 res['dna'] 에서 수치를 읽으므로 'dna' 키로 전달
            "dna": metrics,
        })

    # 4. 점수순 정렬
    sorted_results = sorted(batch_results, key=lambda x: x['score'], reverse=True)

    # 5. AI에게 전체 리포트 요청 (오디션 심사평)
    master_report = consult_batch_audition(sorted_results, target_dict, context_dict)

    return {
        "ranking": sorted_results,
        "master_report": master_report
    }
