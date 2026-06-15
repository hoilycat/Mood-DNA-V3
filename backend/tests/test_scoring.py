"""dna_match_score 가중 거리 채점 로직 테스트.

순수 함수만 import 하므로 cv2/rembg 등 무거운 의존성 없이 실행된다.
실행: backend 디렉터리에서 `python -m pytest`
"""
from app.services.scoring import DNA_MATCH_WEIGHTS, dna_match_score


def test_perfect_match_returns_100():
    # 밝기 타깃 55(0~100) ↔ 실측 140.25(0~255) → 정규화 시 55로 정확히 일치
    target = {"brightness": 55, "complexity": 35, "saliency": 50, "symmetry": 98, "space": 70}
    actual = {"brightness": 140.25, "complexity": 35, "saliency": 50, "symmetry": 98, "space": 70}
    assert dna_match_score(target, actual) == 100.0


def test_empty_target_returns_zero():
    actual = {"brightness": 120, "complexity": 35, "saliency": 50, "symmetry": 98, "space": 70}
    assert dna_match_score({}, actual) == 0.0


def test_no_overlapping_keys_returns_zero():
    # 비교할 공통 지표가 하나도 없으면 0
    assert dna_match_score({"foo": 50}, {"bar": 50}) == 0.0


def test_far_mismatch_scores_lower_than_close():
    target = {"complexity": 50, "space": 50}
    close = {"complexity": 55, "space": 45}
    far = {"complexity": 95, "space": 10}
    assert dna_match_score(target, close) > dna_match_score(target, far)


def test_brightness_is_normalized_from_255_scale():
    # 실측 brightness 255(원시 최대) → 100으로 정규화 → 타깃 100과 일치해야 100점
    assert dna_match_score({"brightness": 100}, {"brightness": 255}) == 100.0
    # 실측 brightness 0 → 0, 타깃 100과는 100점 차이 → 0점
    assert dna_match_score({"brightness": 100}, {"brightness": 0}) == 0.0


def test_only_overlapping_keys_are_compared():
    # 타깃에 없는 지표(contrast)는 실측에 있어도 점수에 영향 없음
    target = {"complexity": 40}
    with_extra = {"complexity": 40, "contrast": 0, "saliency": 100}
    assert dna_match_score(target, with_extra) == 100.0


def test_non_numeric_values_are_skipped():
    # 숫자가 아닌 값은 건너뛴다. complexity만 유효 → 완전 일치 100점
    target = {"complexity": 40, "space": "n/a"}
    actual = {"complexity": 40, "space": None}
    assert dna_match_score(target, actual) == 100.0


def test_higher_weight_metric_penalized_more():
    # complexity(가중치 1.2)가 typo_score(0.7)보다 같은 오차에서 더 크게 감점되어야 함
    assert DNA_MATCH_WEIGHTS["complexity"] > DNA_MATCH_WEIGHTS["typo_score"]
    target = {"complexity": 50, "typo_score": 50}
    off_complexity = {"complexity": 70, "typo_score": 50}  # complexity만 20 어긋남
    off_typo = {"complexity": 50, "typo_score": 70}        # typo만 20 어긋남
    assert dna_match_score(target, off_complexity) < dna_match_score(target, off_typo)


def test_score_never_negative():
    target = {"complexity": 0, "space": 0}
    actual = {"complexity": 100, "space": 100}
    assert dna_match_score(target, actual) >= 0.0
