"""무드 DNA 일치도 점수 계산 (순수 함수 — 무거운 의존성 없음)."""

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
