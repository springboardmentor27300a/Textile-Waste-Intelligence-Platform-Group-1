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
    if has_contaminants:
        recyclability = max(0, recyclability - 25)

    # 2. Condition Score
    cond_lower = condition.lower()
    if cond_lower == "clean" or cond_lower == "recyclable":
        condition_score = 90
    elif cond_lower == "damaged":
        condition_score = 60
    elif cond_lower == "wet":
        condition_score = 40
    elif cond_lower == "contaminated":
        condition_score = 20
    else:
        condition_score = 50

    # 3. Reuse Potential
    if has_contaminants:
        reuse_potential = 20
    elif cond_lower == "clean":
        reuse_potential = 85
    elif cond_lower == "damaged":
        reuse_potential = 50
    else:
        reuse_potential = 40

    # 4. Environmental Benefit
    # High for natural fibers/clean condition, low for contaminated/synthetic blends
    if has_contaminants:
        env_benefit = 30
    elif cond_lower == "clean":
        env_benefit = 95
    else:
        env_benefit = 70

    # 5. Processing Feasibility
    # Clean mono-materials are high feasibility, wet/contaminated or mixed blends are low
    if has_contaminants:
        process_feasibility = 30
    elif cond_lower == "clean":
        process_feasibility = 90
    else:
        process_feasibility = 60

    # Calculate weighted index
    score = int(round(
        0.35 * recyclability +
        0.20 * condition_score +
        0.20 * reuse_potential +
        0.15 * env_benefit +
        0.10 * process_feasibility
    ))
    
    # Cap score boundaries
    score = min(100, max(0, score))
    
    category = get_circularity_category(score)
    
    metrics = {
        "recyclability": recyclability,
        "condition": condition_score,
        "reuse_potential": reuse_potential,
        "environmental_benefit": env_benefit,
        "processing_feasibility": process_feasibility
    }
    
    return score, category, metrics
