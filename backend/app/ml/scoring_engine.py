MATERIAL_RECYCLABILITY = {
    "COTTON": 90,
    "POLYESTER": 85,
    "DENIM": 88,
    "WOOL": 80,
    "SILK": 70,
    "RAYON": 65,
    "ACRYLIC": 55,
    "BLENDED": 50,
    "UNKNOWN": 40,
}


MATERIAL_PROCESSING = {
    "COTTON": 85,
    "POLYESTER": 80,
    "DENIM": 85,
    "WOOL": 75,
    "SILK": 65,
    "RAYON": 60,
    "ACRYLIC": 55,
    "BLENDED": 45,
    "UNKNOWN": 40,
}


MATERIAL_ENVIRONMENTAL = {
    "COTTON": 90,
    "POLYESTER": 75,
    "DENIM": 88,
    "WOOL": 85,
    "SILK": 80,
    "RAYON": 70,
    "ACRYLIC": 55,
    "BLENDED": 65,
    "UNKNOWN": 40,
}


def calculate_condition_score(condition: str) -> float:
    condition = (condition or "UNKNOWN").upper()

    return {
        "EXCELLENT": 100,
        "GOOD": 90,
        "FAIR": 70,
        "DAMAGED": 45,
        "POOR": 30,
        "UNKNOWN": 50,
    }.get(condition, 50)


def calculate_reuse_potential(
    material: str,
    condition: str,
) -> float:

    condition_score = calculate_condition_score(
        condition
    )

    material = (material or "UNKNOWN").upper()

    material_bonus = {
        "COTTON": 5,
        "DENIM": 8,
        "WOOL": 5,
        "SILK": 10,
        "LINEN": 7,
        "POLYESTER": 0,
        "RAYON": -5,
        "ACRYLIC": -10,
        "BLENDED": -5,
        "UNKNOWN": 0,
    }.get(material, 0)

    score = condition_score + material_bonus

    return max(0, min(100, round(score, 2)))


def determine_waste_category(
    condition: str,
    recyclability: float,
    reuse_potential: float,
) -> str:

    condition = (condition or "UNKNOWN").upper()

    if condition == "POOR" and recyclability < 40:
        return "HAZARDOUS_TEXTILE_WASTE"

    if reuse_potential >= 85:
        return "REUSABLE"

    if condition in {"DAMAGED", "POOR"} and reuse_potential >= 60:
        return "UPCYCLABLE"

    if condition in {"DAMAGED", "POOR"}:
        return "RECYCLABLE"

    if recyclability >= 70:
        return "RECYCLABLE"

    return "REPAIRABLE"


def calculate_waste_assessment(
    material: str,
    condition: str,
):

    material = (material or "UNKNOWN").upper()

    recyclability = MATERIAL_RECYCLABILITY.get(
        material,
        MATERIAL_RECYCLABILITY["UNKNOWN"],
    )

    condition_score = calculate_condition_score(
        condition
    )

    reuse_potential = calculate_reuse_potential(
        material,
        condition,
    )

    environmental_benefit = MATERIAL_ENVIRONMENTAL.get(
        material,
        MATERIAL_ENVIRONMENTAL["UNKNOWN"],
    )

    processing_feasibility = MATERIAL_PROCESSING.get(
        material,
        MATERIAL_PROCESSING["UNKNOWN"],
    )

    circularity = (
        recyclability * 0.35
        + condition_score * 0.20
        + reuse_potential * 0.20
        + environmental_benefit * 0.15
        + processing_feasibility * 0.10
    )

    waste_category = determine_waste_category(
        condition,
        recyclability,
        reuse_potential,
    )

    return {
        "recyclability_score": round(
            recyclability,
            2,
        ),
        "condition_score": round(
            condition_score,
            2,
        ),
        "reuse_potential_score": round(
            reuse_potential,
            2,
        ),
        "environmental_benefit_score": round(
            environmental_benefit,
            2,
        ),
        "processing_feasibility_score": round(
            processing_feasibility,
            2,
        ),
        "circularity_score": round(
            circularity,
            2,
        ),
        "waste_category": waste_category,
    }