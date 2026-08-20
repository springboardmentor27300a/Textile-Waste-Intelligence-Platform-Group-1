from typing import Dict, Any, Tuple

def get_circularity_category(score: int) -> str:
    """
    Map circularity score (0-100) to qualitative recovery categories.
    """
    if score >= 85:
        return "Excellent Recovery Potential"
    elif score >= 70:
        return "High Recovery Potential"
    elif score >= 55:
        return "Moderate Recovery Potential"
    elif score >= 35:
        return "Limited Recovery Potential"
    else:
        return "Disposal Recommended"

def calculate_circularity_score(
    recyclability_rate: float,
    condition: str,
    has_contaminants: bool
) -> Tuple[int, str, Dict[str, int]]:
    """
    Calculate Circularity Score based on weighted formula:
    Circularity Score = 0.35 * Recyclability + 0.20 * Condition + 0.20 * Reuse Potential + 0.15 * Environmental Benefit + 0.10 * Processing Feasibility
    """
    # 1. Recyclability Rating (0-100)
    recyclability = int(recyclability_rate * 100)

    # 2. Condition Score
    cond_lower = condition.lower()
    if cond_lower == "clean" or cond_lower == "recyclable":
        condition_score = 95
    elif cond_lower == "damaged" or cond_lower == "repairable":
        condition_score = 65
    elif cond_lower == "wet":
        condition_score = 40
    elif cond_lower == "contaminated" or cond_lower == "non-textile" or cond_lower == "contaminated waste heap":
        condition_score = 25
    else:
        condition_score = 50

    # 3. Reuse Potential
    if has_contaminants or "contaminat" in cond_lower:
        reuse_potential = 25
    elif cond_lower == "clean":
        reuse_potential = 92
    elif cond_lower == "damaged":
        reuse_potential = 55
    else:
        reuse_potential = 45

    # 4. Environmental Benefit
    if has_contaminants or "contaminat" in cond_lower:
        env_benefit = 25
    elif cond_lower == "clean":
        env_benefit = 95
    elif cond_lower == "damaged":
        env_benefit = 65
    else:
        env_benefit = 50

    # 5. Processing Feasibility
    if has_contaminants or "contaminat" in cond_lower:
        proc_feasibility = 30
    elif cond_lower == "clean":
        proc_feasibility = 95
    elif cond_lower == "damaged":
        proc_feasibility = 65
    else:
        proc_feasibility = 50

    # Weighted Sum Formula
    weighted_score = (
        0.35 * recyclability +
        0.20 * condition_score +
        0.20 * reuse_potential +
        0.15 * env_benefit +
        0.10 * proc_feasibility
    )

    circularity_score = max(0, min(100, int(round(weighted_score))))
    circularity_category = get_circularity_category(circularity_score)

    metrics = {
        "recyclability_rating": recyclability,
        "condition_score": condition_score,
        "reuse_potential": reuse_potential,
        "environmental_benefit": env_benefit,
        "processing_feasibility": proc_feasibility,
    }

    return circularity_score, circularity_category, metrics
