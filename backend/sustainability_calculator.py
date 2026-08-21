from __future__ import annotations

from typing import Any, Dict, Optional

SUPPORTED_FABRICS = ["Abaca", "Cotton", "Hessian", "Linen", "Silk", "Wool"]

CIRCULARITY_RANGES = [
    (80, 100, "Excellent Recovery Potential"),
    (65, 79.99, "High Recovery Potential"),
    (50, 64.99, "Moderate Recovery Potential"),
    (30, 49.99, "Limited Recovery Potential"),
    (0, 29.99, "Disposal Recommended"),
]

RESOURCE_CONSERVATION_RANGES = [
    (80, 100, "Excellent Resource Conservation"),
    (65, 79.99, "High Resource Conservation"),
    (50, 64.99, "Moderate Resource Conservation"),
    (30, 49.99, "Low Resource Conservation"),
    (0, 29.99, "Very Low Resource Conservation"),
]

MATERIAL_REFERENCE_FACTORS = {
    "Abaca": {
        "recyclability_base": 74,
        "reuse_base": 70,
        "sustainability_base": 78,
        "recovery_base": 72,
        "co2_savings_kg": 4.0,
        "water_savings_liters": 2600,
        "landfill_reduction_percent": 82,
        "resource_conservation_score": 82,
    },
    "Cotton": {
        "recyclability_base": 86,
        "reuse_base": 78,
        "sustainability_base": 84,
        "recovery_base": 80,
        "co2_savings_kg": 5.2,
        "water_savings_liters": 3500,
        "landfill_reduction_percent": 90,
        "resource_conservation_score": 88,
    },
    "Hessian": {
        "recyclability_base": 76,
        "reuse_base": 72,
        "sustainability_base": 76,
        "recovery_base": 74,
        "co2_savings_kg": 3.6,
        "water_savings_liters": 2400,
        "landfill_reduction_percent": 80,
        "resource_conservation_score": 80,
    },
    "Linen": {
        "recyclability_base": 82,
        "reuse_base": 74,
        "sustainability_base": 82,
        "recovery_base": 78,
        "co2_savings_kg": 4.6,
        "water_savings_liters": 3000,
        "landfill_reduction_percent": 88,
        "resource_conservation_score": 86,
    },
    "Silk": {
        "recyclability_base": 72,
        "reuse_base": 64,
        "sustainability_base": 74,
        "recovery_base": 68,
        "co2_savings_kg": 4.1,
        "water_savings_liters": 4100,
        "landfill_reduction_percent": 84,
        "resource_conservation_score": 83,
    },
    "Wool": {
        "recyclability_base": 70,
        "reuse_base": 66,
        "sustainability_base": 72,
        "recovery_base": 66,
        "co2_savings_kg": 3.9,
        "water_savings_liters": 3200,
        "landfill_reduction_percent": 86,
        "resource_conservation_score": 84,
    },
}


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def get_circularity_category(score: float) -> str:
    score_value = float(score)
    for minimum, maximum, label in CIRCULARITY_RANGES:
        if minimum <= score_value <= maximum:
            return label
    return "Disposal Recommended"


def get_waste_category_from_circularity(score: float | str | None) -> str:
    if score is None:
        return "Disposal Recommended"
    if isinstance(score, str):
        category = score
    else:
        category = get_circularity_category(score)
    if category.startswith("Excellent"):
        return "Reusable"
    if category.startswith("High"):
        return "Recyclable"
    if category.startswith("Moderate"):
        return "Recovery Priority"
    return "Disposal Recommended"


def get_resource_conservation_category(score: float | str | None) -> str:
    if score is None:
        return "Very Low Resource Conservation"
    if isinstance(score, str):
        category = score
    else:
        score_value = float(score)
        for minimum, maximum, label in RESOURCE_CONSERVATION_RANGES:
            if minimum <= score_value <= maximum:
                return label
        return "Very Low Resource Conservation"
    return category


def analyze_sustainability(
    fabric_type: str,
    defect_status: str,
    fabric_confidence: Optional[float] = None,
    defect_confidence: Optional[float] = None,
    waste_condition: Optional[str] = None,
    recyclability: Optional[float] = None,
    reuse_potential: Optional[float] = None,
) -> Dict[str, Any]:
    fabric_name = fabric_type if fabric_type in MATERIAL_REFERENCE_FACTORS else "Cotton"
    factors = MATERIAL_REFERENCE_FACTORS[fabric_name]

    fabric_confidence_value = float(fabric_confidence or 85.0) / 100.0
    defect_confidence_value = float(defect_confidence or 80.0) / 100.0

    has_defect = str(defect_status).lower() == "defect"
    condition_label = (waste_condition or "Good" if waste_condition else "Good").strip().lower()

    if has_defect:
        material_condition_score = round(_clamp(68 - (defect_confidence_value * 25), 25, 88), 1)
        defect_penalty = 12 + (defect_confidence_value * 10)
        reuse_gain = -8
        processing_boost = -3
    else:
        material_condition_score = round(_clamp(84 + (fabric_confidence_value * 12), 75, 98), 1)
        defect_penalty = 0
        reuse_gain = 8
        processing_boost = 3

    if condition_label in {"poor", "damaged", "degraded"}:
        material_condition_score = round(max(20, material_condition_score - 10), 1)
        defect_penalty += 6
        reuse_gain -= 4
        processing_boost -= 4
    elif condition_label in {"good", "clean", "usable"}:
        material_condition_score = round(min(98, material_condition_score + 4), 1)
        reuse_gain += 2
        processing_boost += 1

    recyclability_score = round(
        _clamp(
            factors["recyclability_base"]
            + (fabric_confidence_value * 8)
            - defect_penalty
            + (4 if condition_label in {"good", "clean", "usable"} else 0),
            0,
            100,
        ),
        1,
    )

    reuse_score = round(
        _clamp(
            factors["reuse_base"]
            + (fabric_confidence_value * 5)
            + reuse_gain
            + (5 if condition_label in {"good", "clean", "usable"} else 0),
            0,
            100,
        ),
        1,
    )

    material_recovery_score = round(
        _clamp(
            factors["recovery_base"] + (material_condition_score * 0.12) + (recyclability_score * 0.04) - (6 if has_defect else 0),
            0,
            100,
        ),
        1,
    )

    environmental_benefit_score = round(
        _clamp(
            60 + (material_condition_score * 0.25) + (recyclability_score * 0.1) + (4 if not has_defect else 0),
            0,
            100,
        ),
        1,
    )

    processing_feasibility_score = round(
        _clamp(
            70 + (fabric_confidence_value * 12) + processing_boost - (6 if has_defect else 0),
            0,
            100,
        ),
        1,
    )

    sustainability_score = round(
        _clamp(
            (
                recyclability_score * 0.25
                + reuse_score * 0.25
                + material_condition_score * 0.2
                + environmental_benefit_score * 0.15
                + processing_feasibility_score * 0.1
                + factors["sustainability_base"] * 0.05
            ),
            0,
            100,
        ),
        1,
    )

    circularity_score = round(
        (recyclability_score * 0.35)
        + (material_condition_score * 0.20)
        + (reuse_score * 0.20)
        + (environmental_benefit_score * 0.15)
        + (processing_feasibility_score * 0.10),
        1,
    )

    co2_savings_kg = round(
        factors["co2_savings_kg"] * (1.0 + (fabric_confidence_value * 0.08)) * (0.88 if has_defect else 1.0),
        2,
    )
    water_savings_liters = round(
        factors["water_savings_liters"] * (1.0 + (fabric_confidence_value * 0.05)) * (0.90 if has_defect else 1.0),
        1,
    )
    landfill_reduction_percent = round(
        _clamp(
            factors["landfill_reduction_percent"]
            + (material_condition_score - 70) * 0.5
            + (8 if not has_defect else 0),
            0,
            100,
        ),
        1,
    )

    resource_conservation_score = round(
        _clamp(
            (recyclability_score * 0.30)
            + (reuse_score * 0.25)
            + (material_recovery_score * 0.25)
            + (landfill_reduction_percent * 0.10)
            + (processing_feasibility_score * 0.10),
            0,
            100,
        ),
        1,
    )

    resource_conservation_category = get_resource_conservation_category(resource_conservation_score)

    if recyclability is not None:
        recyclability_score = round(_clamp(recyclability, 0, 100), 1)
    if reuse_potential is not None:
        reuse_score = round(_clamp(reuse_potential, 0, 100), 1)

    circularity_category = get_circularity_category(circularity_score)
    waste_category = get_waste_category_from_circularity(circularity_category)
    resource_conservation_category = get_resource_conservation_category(resource_conservation_score)

    recommendations = build_recommendations(
        fabric_type=fabric_name,
        defect_status=defect_status,
        circularity_score=circularity_score,
        recyclability_score=recyclability_score,
        reuse_score=reuse_score,
        environmental_benefit_score=environmental_benefit_score,
        processing_feasibility_score=processing_feasibility_score,
    )

    return {
        "fabric_type": fabric_name,
        "waste_category": waste_category,
        "scores": {
            "recyclability_score": recyclability_score,
            "reuse_score": reuse_score,
            "sustainability_score": sustainability_score,
            "material_recovery_score": material_recovery_score,
            "material_condition_score": material_condition_score,
            "environmental_benefit_score": environmental_benefit_score,
            "processing_feasibility_score": processing_feasibility_score,
            "circularity_score": circularity_score,
        },
        "circularity_category": circularity_category,
        "environmental_impact": {
            "co2_savings_kg": co2_savings_kg,
            "water_savings_liters": water_savings_liters,
            "landfill_reduction_percent": landfill_reduction_percent,
            "resource_conservation_score": resource_conservation_score,
            "resource_conservation_category": resource_conservation_category,
        },
        "recommendations": recommendations,
        "reference_factors": {
            "materials": MATERIAL_REFERENCE_FACTORS,
            "notes": "Deterministic project estimates based on fabric-specific reference factors and textile condition; suitable for decision support rather than laboratory measurement.",
        },
    }


def build_recommendations(
    fabric_type: str,
    defect_status: str,
    circularity_score: float,
    recyclability_score: float,
    reuse_score: float,
    environmental_benefit_score: float,
    processing_feasibility_score: float,
) -> list[dict[str, Any]]:
    defect_is_present = str(defect_status).lower() == "defect"
    recommendations: list[dict[str, Any]] = []

    if reuse_score >= 80 and not defect_is_present:
        recommendations.append(
            {
                "rank": 1,
                "name": "Direct Reuse",
                "confidence": 94,
                "environmental_benefit": "Excellent",
                "carbon_reduction": "High",
                "cost_effectiveness": "Very High",
                "reasoning": f"{fabric_type} in good condition has strong reuse value and minimal recovery effort.",
            }
        )
    elif reuse_score >= 70 and not defect_is_present:
        recommendations.append(
            {
                "rank": 1,
                "name": "Repair and Reuse",
                "confidence": 90,
                "environmental_benefit": "High",
                "carbon_reduction": "Medium-High",
                "cost_effectiveness": "High",
                "reasoning": f"{fabric_type} can be restored and reused with modest intervention.",
            }
        )
    elif recyclability_score >= 80:
        recommendations.append(
            {
                "rank": 1,
                "name": "Mechanical Recycling",
                "confidence": 92,
                "environmental_benefit": "High",
                "carbon_reduction": "High",
                "cost_effectiveness": "High",
                "reasoning": f"{fabric_type} is suitable for fiber recovery through established mechanical processing.",
            }
        )
    elif recyclability_score >= 60:
        recommendations.append(
            {
                "rank": 1,
                "name": "Chemical Recycling",
                "confidence": 86,
                "environmental_benefit": "Medium-High",
                "carbon_reduction": "Medium",
                "cost_effectiveness": "Medium",
                "reasoning": f"{fabric_type} may require more intensive processing but still holds recovery value.",
            }
        )
    else:
        recommendations.append(
            {
                "rank": 1,
                "name": "Disposal only",
                "confidence": 80,
                "environmental_benefit": "Low",
                "carbon_reduction": "Low",
                "cost_effectiveness": "Low",
                "reasoning": f"{fabric_type} is not well suited to current recovery routes under the current condition profile.",
            }
        )

    if circularity_score >= 70:
        recommendations.append(
            {
                "rank": 2,
                "name": "Upcycling",
                "confidence": 83,
                "environmental_benefit": "High",
                "carbon_reduction": "Medium",
                "cost_effectiveness": "Medium",
                "reasoning": "The material has strong circular value and can be repurposed into higher-value products.",
            }
        )
    elif recyclability_score >= 70:
        recommendations.append(
            {
                "rank": 2,
                "name": "Fiber Recovery",
                "confidence": 81,
                "environmental_benefit": "High",
                "carbon_reduction": "Medium-High",
                "cost_effectiveness": "Medium",
                "reasoning": "The textile can be routed into material reclamation streams to recover useful fiber content.",
            }
        )
    else:
        recommendations.append(
            {
                "rank": 2,
                "name": "Industrial Recovery",
                "confidence": 76,
                "environmental_benefit": "Medium",
                "carbon_reduction": "Low-Medium",
                "cost_effectiveness": "Medium",
                "reasoning": "A controlled industrial stream may still recover some residual value despite limited circularity.",
            }
        )

    if defect_is_present and circularity_score >= 40:
        recommendations.append(
            {
                "rank": 3,
                "name": "Donation",
                "confidence": 74,
                "environmental_benefit": "Medium",
                "carbon_reduction": "Medium",
                "cost_effectiveness": "High",
                "reasoning": "Even with visible defects, the textile may still support reuse in second-life channels.",
            }
        )
    elif processing_feasibility_score >= 75:
        recommendations.append(
            {
                "rank": 3,
                "name": "Industrial Recovery",
                "confidence": 78,
                "environmental_benefit": "Medium-High",
                "carbon_reduction": "Medium",
                "cost_effectiveness": "Medium",
                "reasoning": "Processing feasibility is good enough to justify a coordinated recovery route.",
            }
        )

    recommendations.sort(key=lambda item: item["rank"])
    for index, item in enumerate(recommendations, start=1):
        item["rank"] = index
    return recommendations
