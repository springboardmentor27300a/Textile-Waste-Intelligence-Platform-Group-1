"""
Sustainability Intelligence Engine (Milestone 3).

Two things live here:
1. A recycling recommendation workflow - maps a batch's category and fabric
   type to a specific pathway (fiber recycling, mechanical recycling,
   chemical recycling, fabric reuse, upcycling, donation, or industrial
   recovery), matching the pathway list in the project brief.
2. An environmental impact estimator - CO2 and water "saved" by diverting
   a batch from landfill/virgin-material production, and a landfill
   diversion figure.

HONESTY NOTE ON THE NUMBERS, stated plainly: the CO2/water figures below
are illustrative reference estimates, built from commonly-cited textile
lifecycle ranges (e.g. cotton's often-cited ~2,700L per kg from water
footprint literature; wool's high footprint from livestock-related
studies). They are industry-average approximations for a fibre TYPE, not
measurements of this specific batch's actual production history - no
system could know a specific batch's real supply chain from a photo and a
weight. Treat these as directionally useful for prioritization and
reporting, not as certified figures for a formal carbon audit. If your
organization has verified figures from a specific study, swap the
ENV_FACTORS table below for those.
"""
from dataclasses import dataclass, field
from .models import FabricType, WasteCategory, WasteCondition

# kg CO2e avoided and litres of water avoided per kg of textile diverted
# from landfill and from needing virgin-material replacement production.
ENV_FACTORS = {
    FabricType.COTTON:    {"co2_per_kg": 5.9,  "water_per_kg": 2700},
    FabricType.LINEN:     {"co2_per_kg": 3.8,  "water_per_kg": 1000},
    FabricType.DENIM:     {"co2_per_kg": 6.5,  "water_per_kg": 3000},
    FabricType.WOOL:      {"co2_per_kg": 20.0, "water_per_kg": 5000},
    FabricType.SILK:      {"co2_per_kg": 12.0, "water_per_kg": 3500},
    FabricType.POLYESTER: {"co2_per_kg": 5.5,  "water_per_kg": 60},
    FabricType.NYLON:     {"co2_per_kg": 7.0,  "water_per_kg": 70},
    FabricType.RAYON:     {"co2_per_kg": 4.0,  "water_per_kg": 800},
    FabricType.ACRYLIC:   {"co2_per_kg": 6.0,  "water_per_kg": 90},
    FabricType.MIXED:     {"co2_per_kg": 5.0,  "water_per_kg": 900},
    FabricType.UNKNOWN:   {"co2_per_kg": 4.5,  "water_per_kg": 800},
}

# how much of a batch actually gets diverted from landfill/virgin production
# by each category - hazardous waste can't be credited as "diverted" at all
DIVERSION_CREDIT = {
    WasteCategory.RECYCLABLE: 0.90,
    WasteCategory.REUSABLE: 1.00,      # full garment reused = full replacement of a new one
    WasteCategory.UPCYCLABLE: 0.70,
    WasteCategory.REPAIRABLE: 0.85,
    WasteCategory.COMPOSTABLE: 0.50,   # returns to soil, but doesn't offset new-fibre production the way reuse does
    WasteCategory.HAZARDOUS: 0.0,
    WasteCategory.UNCLASSIFIED: 0.0,
}

# Recycling Recommendation Workflow - maps category + fabric type to a
# specific pathway from the brief's option list.
NATURAL_FIBRES = {FabricType.COTTON, FabricType.LINEN, FabricType.DENIM, FabricType.WOOL, FabricType.SILK}


def recommend_pathway(category: WasteCategory, fabric_type: FabricType, condition: WasteCondition) -> tuple[str, list[str]]:
    if category == WasteCategory.RECYCLABLE:
        if fabric_type in NATURAL_FIBRES:
            return "Mechanical Recycling", ["Fiber Recycling", "Industrial Recovery"]
        return "Chemical Recycling", ["Fiber Recycling", "Industrial Recovery"]

    if category == WasteCategory.REUSABLE:
        return "Donation", ["Fabric Reuse"]

    if category == WasteCategory.UPCYCLABLE:
        return "Upcycling", ["Fabric Reuse", "Donation"]

    if category == WasteCategory.REPAIRABLE:
        return "Fabric Reuse", ["Donation"]

    if category == WasteCategory.COMPOSTABLE:
        return "Industrial Recovery", []

    if category == WasteCategory.HAZARDOUS:
        return "Industrial Recovery", []

    return "Fiber Recycling", ["Mechanical Recycling", "Industrial Recovery"]


@dataclass
class SustainabilityAssessment:
    recommended_pathway: str
    pathway_options: list[str]
    co2_saved_kg: float
    water_saved_liters: float
    landfill_diverted_kg: float
    recyclability_component: float
    condition_component: float
    reuse_component: float
    environmental_component: float
    feasibility_component: float
    circularity_score: float
    circularity_category: str
    rationale: str


def compute_circularity_score(
    fabric_type: FabricType,
    condition: WasteCondition,
    category: WasteCategory,
    recyclability_score: float = 70.0
) -> tuple[float, float, float, float, float, float, str]:
    """
    Weighted Scoring Model per specification:
    - Material Recyclability: 35%
    - Material Condition: 20%
    - Reuse Potential: 20%
    - Environmental Benefit: 15%
    - Processing Feasibility: 10%
    """
    # Material Recyclability (35%)
    mat_recyclability = recyclability_score if recyclability_score is not None else 70.0

    # Material Condition (20%)
    condition_weights = {
        WasteCondition.NEW_SURPLUS: 100.0,
        WasteCondition.LIGHTLY_WORN: 85.0,
        WasteCondition.WORN: 65.0,
        WasteCondition.DAMAGED: 40.0,
        WasteCondition.CONTAMINATED: 15.0,
    }
    mat_condition = condition_weights.get(condition, 60.0)

    # Reuse Potential (20%)
    reuse_weights = {
        WasteCategory.REUSABLE: 100.0,
        WasteCategory.UPCYCLABLE: 85.0,
        WasteCategory.REPAIRABLE: 75.0,
        WasteCategory.RECYCLABLE: 55.0,
        WasteCategory.COMPOSTABLE: 40.0,
        WasteCategory.HAZARDOUS: 0.0,
        WasteCategory.UNCLASSIFIED: 30.0,
    }
    reuse_potential = reuse_weights.get(category, 50.0)

    # Environmental Benefit (15%)
    env_factors = ENV_FACTORS.get(fabric_type, ENV_FACTORS[FabricType.UNKNOWN])
    co2_val = env_factors["co2_per_kg"]
    env_benefit = min((co2_val / 20.0) * 100.0, 100.0)

    # Processing Feasibility (10%)
    feasibility_map = {
        FabricType.COTTON: 95.0,
        FabricType.DENIM: 90.0,
        FabricType.LINEN: 85.0,
        FabricType.WOOL: 80.0,
        FabricType.POLYESTER: 85.0,
        FabricType.NYLON: 80.0,
        FabricType.SILK: 70.0,
        FabricType.RAYON: 75.0,
        FabricType.ACRYLIC: 70.0,
        FabricType.MIXED: 45.0,
        FabricType.UNKNOWN: 40.0,
    }
    proc_feasibility = feasibility_map.get(fabric_type, 60.0)

    # Weighted Circularity Score calculation
    score = (
        0.35 * mat_recyclability +
        0.20 * mat_condition +
        0.20 * reuse_potential +
        0.15 * env_benefit +
        0.10 * proc_feasibility
    )
    score = round(score, 1)

    # Circularity Category determination
    if score >= 85.0:
        circ_category = "Excellent Recovery Potential"
    elif score >= 70.0:
        circ_category = "High Recovery Potential"
    elif score >= 50.0:
        circ_category = "Moderate Recovery Potential"
    elif score >= 30.0:
        circ_category = "Limited Recovery Potential"
    else:
        circ_category = "Disposal Recommended"

    return (
        round(mat_recyclability, 1),
        round(mat_condition, 1),
        round(reuse_potential, 1),
        round(env_benefit, 1),
        round(proc_feasibility, 1),
        score,
        circ_category,
    )


def assess_sustainability(
    fabric_type: FabricType,
    condition: WasteCondition,
    category: WasteCategory,
    quantity_kg: float,
    recyclability_score: float = 70.0
) -> SustainabilityAssessment:
    pathway, options = recommend_pathway(category, fabric_type, condition)

    factors = ENV_FACTORS.get(fabric_type, ENV_FACTORS[FabricType.UNKNOWN])
    credit = DIVERSION_CREDIT.get(category, 0.0)

    co2_saved = round(quantity_kg * factors["co2_per_kg"] * credit, 2)
    water_saved = round(quantity_kg * factors["water_per_kg"] * credit, 1)
    landfill_diverted = round(quantity_kg * credit, 2)

    mat_rec, mat_cond, reuse_pot, env_ben, proc_feas, circ_score, circ_cat = compute_circularity_score(
        fabric_type, condition, category, recyclability_score
    )

    if credit == 0:
        rationale = (
            f"Category '{category.value}' isn't credited as diverted from landfill, so no "
            "environmental savings are estimated for this batch."
        )
    else:
        rationale = (
            f"{quantity_kg}kg of {fabric_type.value}, routed as {category.value} "
            f"({credit * 100:.0f}% diversion credit), recommended pathway: {pathway}. "
            f"Overall Circularity Score: {circ_score} ({circ_cat}). "
            f"Avoided emissions: {co2_saved} kg CO2e, Water saved: {water_saved} L."
        )

    return SustainabilityAssessment(
        recommended_pathway=pathway,
        pathway_options=options,
        co2_saved_kg=co2_saved,
        water_saved_liters=water_saved,
        landfill_diverted_kg=landfill_diverted,
        recyclability_component=mat_rec,
        condition_component=mat_cond,
        reuse_component=reuse_pot,
        environmental_component=env_ben,
        feasibility_component=proc_feas,
        circularity_score=circ_score,
        circularity_category=circ_cat,
        rationale=rationale,
    )

