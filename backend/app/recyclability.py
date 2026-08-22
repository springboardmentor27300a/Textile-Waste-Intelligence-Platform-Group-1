"""
Waste categorization / recyclability assessment (Milestone 2). A
transparent, rule-based expert system - not a black box. The declared
fabric type (human-entered) drives the score, adjusted by condition and
real image-derived contamination/damage signals.
"""
from dataclasses import dataclass
from .models import FabricType, WasteCategory, WasteCondition
from .vision import ImageFeatures

FIBRE_BASELINE = {
    FabricType.COTTON: 78, FabricType.LINEN: 80, FabricType.DENIM: 74,
    FabricType.WOOL: 68, FabricType.SILK: 60, FabricType.POLYESTER: 65,
    FabricType.NYLON: 62, FabricType.ACRYLIC: 55, FabricType.RAYON: 58,
    FabricType.MIXED: 35, FabricType.UNKNOWN: 40,
}

CONDITION_ADJUSTMENT = {
    WasteCondition.NEW_SURPLUS: 15, WasteCondition.LIGHTLY_WORN: 8,
    WasteCondition.WORN: 0, WasteCondition.DAMAGED: -18, WasteCondition.CONTAMINATED: -30,
}


@dataclass
class ClassificationResult:
    predicted_fabric_type: FabricType
    fabric_confidence: float
    classification_method: str
    recommended_category: WasteCategory
    recyclability_score: float
    rationale: str


def classify(declared_fabric_type: FabricType, condition: WasteCondition, features: ImageFeatures) -> ClassificationResult:
    reasons = []
    score = FIBRE_BASELINE.get(declared_fabric_type, 40)
    reasons.append(f"Base recyclability for {declared_fabric_type.value}: {FIBRE_BASELINE.get(declared_fabric_type, 40)}/100.")

    condition_adj = CONDITION_ADJUSTMENT.get(condition, 0)
    score += condition_adj
    reasons.append(f"Condition '{condition.value}' adjusts score by {condition_adj:+d}.")

    contamination_penalty = round(features.contamination_score * 35)
    if contamination_penalty > 0:
        score -= contamination_penalty
        reasons.append(f"Image shows {features.contamination_score * 100:.0f}% likely contamination - score reduced by {contamination_penalty}.")

    damage_penalty = round(features.damage_score * 25)
    if damage_penalty > 0:
        score -= damage_penalty
        reasons.append(f"Image shows {features.damage_score * 100:.0f}% likely damage/tearing - score reduced by {damage_penalty}.")

    score = max(0, min(100, round(score)))

    if features.contamination_score > 0.6:
        category = WasteCategory.HAZARDOUS
        reasons.append("Contamination level is high enough to route as hazardous textile waste rather than standard recycling.")
    elif score >= 70:
        category = WasteCategory.RECYCLABLE
    elif score >= 55:
        category = WasteCategory.REUSABLE if condition in (WasteCondition.NEW_SURPLUS, WasteCondition.LIGHTLY_WORN) else WasteCategory.UPCYCLABLE
    elif score >= 35:
        category = WasteCategory.REPAIRABLE if features.damage_score < 0.5 else WasteCategory.UPCYCLABLE
    elif declared_fabric_type in (FabricType.COTTON, FabricType.LINEN) and score >= 20:
        category = WasteCategory.COMPOSTABLE
        reasons.append(f"{declared_fabric_type.value} is a natural fibre, so low-scoring batches are routed to compostable rather than disposal.")
    else:
        category = WasteCategory.COMPOSTABLE if declared_fabric_type in (FabricType.COTTON, FabricType.LINEN) else WasteCategory.REPAIRABLE

    return ClassificationResult(
        predicted_fabric_type=declared_fabric_type, fabric_confidence=1.0,
        classification_method="user_declared", recommended_category=category,
        recyclability_score=float(score), rationale=" ".join(reasons),
    )
