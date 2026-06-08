
# 🧬 Mood-DNA 변천사 — v1 → v2 → v3
 
> **"감각을 데이터로, 아이디어를 구조로."**  
> 이미지 색상 추출 스크립트에서 논문 기반 AI 디자인 비평 시스템으로 진화한 기록.
 
---
 
## 한눈에 보는 진화 요약
 
| 항목 | v1 | v2 | v3 |
|---|---|---|---|
| **아키텍처** | Python + Streamlit 단일 파일 | FastAPI 백엔드 + React 프론트엔드 분리 | 동일 (YIE 연동 추가) |
| **분석 지표 수** | 4개 (색상·복잡도·대칭·무드) | **15개+** (대폭 확장) | 동일 + YIE 비평 |
| **AI 엔진** | 룰 기반 텍스트 생성 (로컬) | **Gemini API** (+ Groq·Ollama 폴백) | 동일 + **YIE GraphRAG** |
| **레퍼런스 검색** | Unsplash API | **SerpApi** (Pinterest·Dribbble·Behance) | 동일 |
| **데이터 저장** | 없음 | **SQLite DB** (디자인 히스토리) | 동일 |
| **분석 모드** | 단일 / A·B 비교 | 단일 / 비교 / **배치 오디션** | 동일 |
| **배경 제거** | 없음 | **rembg** 자동 배경 제거 | 동일 |
| **OCR** | 없음 | **EasyOCR** (텍스트 감지 후 그래픽 분리) | 동일 |
| **논문 기반 비평** | 없음 | 없음 (기획만) | **YIE GraphRAG 실제 연동** |
| **커밋 수** | 15개 | 40개+ | 10개 (v2 클론 기반) |
 
---
 
## v1 — 아이디어의 씨앗 (Python Streamlit)
 
> **"이미지의 DNA를 뽑아낼 수 있을까?"** — 단일 파일 프로토타입
 
### 탄생 배경
 
디자인 이미지에서 색상과 구조적 특성을 뽑아내 "분석"해주는 도구를 만들고 싶었습니다. Python 스크립트 하나(`app.py`)와 Streamlit으로 빠르게 증명했습니다. 레포 이름엔 references/ 폴더에 직접 수집한 레퍼런스 이미지 **42장**이 들어있습니다 — 아직 자동 검색이 없던 시절의 흔적입니다.
 
### 핵심 구조
 
```
v1/
├── app.py              # 전체 로직 + UI (단일 파일)
├── requirements.txt    # streamlit, opencv, scikit-learn, reportlab, matplotlib
└── references/         # 직접 수집한 레퍼런스 이미지 42장
```
 
### v1이 이미 구현한 것들
 
v2·v3가 계승하는 알고리즘 핵심이 여기서 완성됐습니다.
 
**이미지 분석 엔진**
- **OpenCV 엣지 검출** — Canny 알고리즘으로 윤곽선 밀도를 계산해 시각적 복잡도 수치화
- **레이아웃 대칭도** — 이미지를 좌우로 분할해 픽셀 합계 차이로 균형 점수 산출
- **K-Means 컬러 팔레트** — 5개 주요 색상 클러스터 추출 및 비율 시각화
- **색상 무드 분류** — HSV 색공간 기반 무드 태깅 (Energetic, Trust & Professional, Luxury, Minimal 등)
- **색온도 판별** — Warm / Cool 분류
**비즈니스 기능**
- **A/B 비교 모드** — 두 시안을 나란히 분석해 복잡도 기준 판정
- **PDF 리포트 생성** — reportlab으로 원본/엣지 이미지, 컬러 팔레트, AI 코멘트를 A4에 구성
- **Unsplash 레퍼런스 검색** — 분석된 무드와 복잡도를 검색어로 변환해 실시간 이미지 추천
**AI 컨설팅 (룰 기반)**
v1의 "AI"는 실제 LLM이 아니다. 복잡도·대칭도·색온도 수치를 조건문으로 분기해 미리 짜놓은 문장을 조립하는 방식이었습니다. "AI 전문 디자인 컨설팅 리포트"라는 이름을 달고 있었지만 본질은 정교한 if-else였다.
 
### v1의 한계
- **단일 모드**: 이미지 업로드 → 분석 → 끝. 히스토리 저장 없음
- **분석 지표 4종**: 복잡도·대칭·색상·무드만. 여백·채도·대비·텍스트 감지 전혀 없음
- **룰 기반 AI**: 실제 LLM 연동 없이 조건문으로 텍스트 생성
- **Streamlit 한계**: 배포 어려움, 실시간 인터랙션 부족, 모바일 대응 불가
- **로컬 레퍼런스**: 자동 검색 없이 직접 수집한 42장에 의존
---
 
## v2 — 완전한 재건축 (FastAPI + React 풀스택)
 
> **"제대로 된 분석 플랫폼"** — 아키텍처 분리, 분석 지표 15개로 폭발적 확장
 
### 가장 큰 변화: 아키텍처 분리
 
단일 Python 스크립트를 **FastAPI 백엔드 + React 프론트엔드** 구조로 완전히 해체하고 재조립했습니다. 둘을 `concurrently`로 동시에 실행하는 개발 환경 스크립트도 갖췄습니다.
 
```
v2/
├── backend/
│   └── app/
│       ├── main.py          # FastAPI 엔드포인트 (/analyze, /compare, /analyze-batch)
│       ├── models.py        # SQLAlchemy DB 스키마 (DesignHistory)
│       ├── database.py      # SQLite 연결 (mood_dna.db)
│       └── services/
│           ├── analyzer.py      # 분석 엔진 (15개+ 지표)
│           ├── ai_consultant.py # Gemini + Groq + Ollama 폴백 체인
│           └── google_search.py # SerpApi 레퍼런스 검색
└── frontend/
    └── src/
        ├── App.tsx          # 단일 파일 UI (위저드 + 대시보드)
        └── lib/utils.ts
```
 
### 분석 지표 4 → 15개 확장
 
v2에서 분석 엔진(`analyzer.py`)이 폭발적으로 성장했습니다. 지표별로 별도 함수를 갖고, 각각 로고 모드(BGRA 투명 배경)와 일반 이미지 모드를 구분해서 처리합니다.
 
| 지표 | 설명 | v1 |
|---|---|---|
| `brightness` | 지각적 밝기 (Luminance 공식) | ✅ |
| `complexity` | 엣지 밀도 기반 시각 복잡도 | ✅ |
| `symmetry` | 좌우 대칭도 | ✅ |
| `space` | 여백 비율 (네거티브 스페이스) | ✅ |
| `saliency` | 시각적 집중도 (Spectral Residual) | ❌ 신규 |
| `contrast` | 명암 대비 | ❌ 신규 |
| `composition` | 3분할 구도 안정성 | ❌ 신규 |
| `aspect_ratio` | 종횡비 | ❌ 신규 |
| `color_count` | 유효 색상 수 (노이즈 제외) | ❌ 신규 |
| `typo_score` | 타이포그래피 비중 | ❌ 신규 |
| `saturation_ratio` | 평균 채도 | ❌ 신규 |
| `harmony_score` | 색채 조화도 (Hue 분산) | ❌ 신규 |
| `roundness` | 원형도 / 곡률 | ❌ 신규 |
| `straightness` | 직선 비중 (Hough Lines) | ❌ 신규 |
| `smoothness` | 표면 매끄러움 (Laplacian) | ❌ 신규 |
 
### EasyOCR + 그래픽 분리 로직
 
v2의 가장 독창적인 구현. 이미지 내 텍스트를 **EasyOCR로 감지하고**, 감지된 텍스트 영역을 흰색으로 덮어버린 '순수 그래픽 이미지'를 별도로 생성해 복잡도를 계산합니다. 텍스트 윤곽선 때문에 복잡도가 100이 튀어나오는 문제를 해결한 것.
 
### 실제 AI 엔진 (Gemini + 폴백 체인)
 
v1의 룰 기반을 버리고 **Google Gemini**를 실제로 연동했습니다. 할당량 초과를 대비한 3단계 폴백 체인이 있습니다.
 
```
1순위: Gemini (gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-pro)
       ↓ 할당량 초과 or 오류
2순위: Groq (Llama 3.3 70B)
       ↓ 실패
3순위: Ollama 로컬 (Exaone 3.5 / llama3.2-vision)
```
 
### 배경 제거 (rembg)
 
v2에서 `rembg` 라이브러리를 도입해 분석 전 자동으로 배경을 제거합니다. 로고처럼 투명 배경이 필요한 디자인과 포스터처럼 배경이 있는 디자인을 구분해 각각 다른 방식으로 지표를 계산합니다.
 
### 디자인 히스토리 DB
 
SQLite + SQLAlchemy로 분석 기록을 저장합니다. `DesignHistory` 테이블에 밝기·복잡도·대칭·여백·색상·AI 피드백이 쌓인다. v1에는 없던 아카이빙 개념.
 
### 배치 오디션 (`/analyze-batch`)
 
여러 시안을 한 번에 업로드하면 Target DNA와의 유사도를 계산해 순위를 매기고, AI가 오디션 심사위원처럼 마스터 리포트를 작성합니다. v1의 A/B 2개 비교에서 N개 배치 비교로 도약.
 
### Step-by-step 위저드
 
프론트엔드에 4단계 설계 의도 입력 흐름을 구현했습니다.
```
Step 1: 업종 선택  
Step 2: 분위기 태그 선택  
Step 3: Target DNA 설정 (목표 수치 조정)  
Step 4: 이미지 업로드 및 분석 실행
```
 
### SerpApi 레퍼런스 검색
 
v1의 Unsplash API를 버리고 **SerpApi**로 Google 이미지 검색을 대체했습니다. 검색 대상도 일반 이미지가 아닌 `pinterest.com`, `dribbble.com`, `behance.net`으로 타겟팅해 실무 레퍼런스를 큐레이션합니다.
 
### v2에서 기획만 하고 못 만든 것
 
README의 Roadmap에 **LlamaIndex 기반 Hybrid GraphRAG** 시스템 통합이 `👈 Current Focus`로 표시되어 있지만 실제 코드에는 없습니다. Neo4j 지식 그래프, 벡터 DB, 디자인 온톨로지 — 이것들은 v3가 실현합니다.
 
---
 
## v3 — 논문이 말하다 (YIE GraphRAG 연동)
 
> **"추측이 아닌 근거"** — 계획으로만 있던 GraphRAG가 실제 코드 3줄로 실현
 
### v3의 시작
 
v2 레포를 그대로 클론해서 출발했습니다 (첫 커밋: `"chore: init mood-dna-v3 (cloned from v2, YIE integration branch)"`). v2의 모든 기능을 이어받고 YIE 연동에만 집중.
 
### 핵심 변화: yie_client.py 추가 + main.py 3줄
 
v3에서 새로 생긴 파일은 단 하나 — `backend/app/services/yie_client.py`.
 
```python
# yie_client.py — 전체 코드
async def query_yie(domain: str, task: str, question: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "http://localhost:8000/rag/query",
            json={"domain": domain, "task": task, "question": question, "context": {}},
        )
        return response.json()
```
 
그리고 `main.py`에 단 3줄이 추가됐습니다:
 
```python
question = f"{ai_feedback.get('mood', '')} 디자인. 키워드: {', '.join(ai_feedback.get('design_keywords', []))}"
yie_critique = await query_yie("design", "critique", question)
# ...
"yie_critique": yie_critique  # 응답에 추가
```
 
이것이 v2와 v3의 백엔드 차이 전부다. 단순하지만, 그 뒤에는 **1,043개 디자인 논문 청크**를 담은 Neo4j 지식 그래프가 있습니다.
 
### YIE 연동 아키텍처
 
```
Mood-DNA v3 ──(HTTP POST)──▶ YIE localhost:8000/rag/query (domain=design)
                                        │
                               Neo4j GraphRAG
                               111개 논문 노드
                               7개 허브 태그 (브랜드·시각·주의·선호·처리유창성)
                               SIMILAR_TO 의미 네트워크
                                        │
                               EXAONE 3.5 LLM
                                        │
                               Chunk ID + 출처 명시 비평 카드
```
 
### 프론트엔드: YIE 비평 카드
 
`App.tsx`에 `result?.yie_critique`가 있을 때만 렌더링되는 카드 섹션이 추가됐습니다.
 
```tsx
{result?.yie_critique && (
  <section className="critique-card">
    <p>{result.yie_critique.sections.recommendation ?? result.yie_critique.answer}</p>
    <small>YIE GraphRAG · 디자인 학술 논문 기반</small>
  </section>
)}
```
 
API가 없으면 카드가 안 뜨는 방식 — 연결 실패 시에도 앱이 깨지지 않는 방어적 설계.
 
### 사라진 것들
 
v2에 있던 `assets/` 폴더 (데모 webp, 스크린샷 3장)가 v3에서 제거됐습니다. v2에 있던 `code_gather.py`도 "Remove code gathering script" 커밋으로 삭제. 방향이 '데모 자료 관리'보다 'AI 연동 완성'으로 이동.
 
### requirements.txt의 변화
 
v2 requirements.txt는 비어있고, v3 requirements.txt에는 `httpx` 한 줄만 추가됐습니다 — YIE 클라이언트가 쓰는 HTTP 라이브러리 하나가 두 버전의 차이를 상징합니다.
 
---
 
## 버전 간 DNA 계승도
 
```
v1 (Python Streamlit)
│
│  ✅ 계승: OpenCV 분석 엔진, K-Means 컬러, 대칭도, A/B 비교
│  ❌ 폐기: Streamlit UI, 룰 기반 AI, Unsplash, 직접 수집 레퍼런스
│  ➕ 추가: —
│
▼
v2 (FastAPI + React)
│
│  ✅ 계승: 모든 분석 알고리즘 (Python으로 강화)
│  ❌ 폐기: 단일 파일 구조, Unsplash
│  ➕ 추가: 15개 지표, EasyOCR, rembg, Gemini AI, SerpApi, SQLite, 배치 오디션, 위저드
│  📋 기획: LlamaIndex GraphRAG (미구현)
│
▼
v3 (FastAPI + React + YIE)
│
│  ✅ 계승: v2 전체 (클론 기반 시작)
│  ➕ 추가: yie_client.py, YIE GraphRAG 실 연동, 논문 근거 비평 카드
```
 
---
 
## 핵심 기술의 세대별 진화
 
### 이미지 분석 엔진
 
| 세대 | 처리 방식 | 로고/일반 구분 |
|---|---|---|
| v1 | OpenCV BGR, 단순 엣지 계산 | ❌ |
| v2 | OpenCV BGRA, 투명도 마스킹, EasyOCR 분리 | ✅ |
| v3 | 동일 | ✅ |
 
### AI 비평 엔진
 
| 세대 | 방식 | 근거 |
|---|---|---|
| v1 | 룰 기반 조건문 (if-else) | 없음 |
| v2 | Gemini LLM + 폴백 체인 | LLM 추론 (논문 없음) |
| v3 | Gemini + **YIE GraphRAG** | **1,043개 디자인 논문 청크** |
 
### 레퍼런스 추천
 
| 세대 | 소스 | 방식 |
|---|---|---|
| v1 | Unsplash API + 직접 수집 42장 | 색상·복잡도 기반 키워드 검색 |
| v2 | SerpApi → Pinterest·Dribbble·Behance | AI 추출 디자인 키워드 검색 |
| v3 | 동일 | 동일 |
 
---
 
## 마치며
 
Mood-DNA는 "이미지에서 색상을 뽑으면 뭔가 의미가 생기지 않을까"라는 질문에서 출발했습니다. v1은 그 가설을 Python 스크립트 하나로 검증했고, v2는 실제 분석 플랫폼의 형태를 갖췄습니다. v3는 AI가 "논문에 따르면"이라고 말할 수 있게 됐습니다.
 
Cof/fee와 마찬가지로, v3는 v2에서 클론해서 시작했습니다. 그리고 가장 중요한 변화는 새 파일 하나(yie_client.py)와 기존 파일에 추가된 세 줄로 이루어졌습니다. 코드의 양이 아니라 연결의 질이 버전을 가릅니다.
 
---
 
*분석 기준일: 2026-06-06*  
*Designed & Developed by 김서영*
