"""
Milestone 3: Sustainability Intelligence & Recommendations
============================================================

Three transparent, formula-based engines that sit on top of the Milestone 2
Material Classification + Waste Classification output:

  7. Sustainability Intelligence Engine
       - carbon footprint estimation
       - waste diversion analysis
       - circular economy analysis
       - resource recovery estimation
       - sustainability benchmarking

  8. Environmental Impact Assessment Engine
       - CO2 savings estimation
       - water savings estimation
       - landfill reduction analysis
       - resource conservation estimation
       - sustainability reporting

  9. Waste Scoring Engine
       - recyclability score
       - reuse score
       - sustainability score
       - material recovery score
       - overall circularity score (weighted model, see below)

As with the Milestone 2 engines, this is a documented, auditable reference
model (published-style per-kilogram impact factors + a weighted scoring
formula) rather than a black box or a verified life-cycle-assessment (LCA)
dataset -- appropriate scope for "sustainability intelligence operational"
without requiring a licensed LCA database. The output shape is stable so a
real LCA data source could replace `_CO2_FACTORS` / `_WATER_FACTORS` later
without touching the routes layer.

Weighted Circularity Scoring Model
-----------------------------------
    Circularity Score =
        Material Recyclability   35%
        Material Condition       20%
        Reuse Potential          20%
        Environmental Benefit    15%
        Processing Feasibility   10%

Circularity Categories (score out of 100):
    >= 85  Excellent Recovery Potential
    >= 70  High Recovery Potential
    >= 50  Moderate Recovery Potential
    >= 30  Limited Recovery Potential
    <  30  Disposal Recommended
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Reference impact factors (per kg of virgin fiber production).
# Approximate, published-style figures used purely as a transparent teaching
# baseline -- NOT a substitute for a verified life-cycle assessment.
# ---------------------------------------------------------------------------

_CO2_FACTORS_KG_PER_KG = {          # kg CO2e avoided per kg, if virgin production is displaced
    "Cotton": 5.5,
    "Polyester": 9.5,
    "Wool": 20.0,
    "Silk": 12.0,
    "Linen": 3.0,
    "Denim": 8.0,
    "Nylon": 7.0,
    "Rayon": 4.0,
    "Acrylic": 6.0,
    "Mixed Fabrics": 6.5,
}

_WATER_FACTORS_L_PER_KG = {         # liters of water avoided per kg, if virgin production is displaced
    "Cotton": 2700.0,
    "Polyester": 60.0,
    "Wool": 500.0,
    "Silk": 300.0,
    "Linen": 250.0,
    "Denim": 3000.0,
    "Nylon": 50.0,
    "Rayon": 400.0,
    "Acrylic": 70.0,
    "Mixed Fabrics": 500.0,
}

# Fraction of the virgin-production impact realistically avoided by routing
# an item down each waste-category pathway instead of landfill + new virgin
# production ("processing credit").
_PROCESSING_CREDIT_BY_CATEGORY = {
    "Recyclable": 0.80,
    "Reusable": 0.95,
    "Repairable": 0.85,
    "Upcyclable": 0.70,
    "Compostable": 0.40,
    "Hazardous Textile Waste": 0.05,
}

# Static "industry average" circularity-score baseline used purely for the
# sustainability-benchmarking step (illustrative reference point, not a
# published statistic).
_INDUSTRY_BENCHMARK_SCORE = 55.0

_REUSE_POTENTIAL_NUMERIC = {"High": 90.0, "Medium": 60.0, "Low": 30.0}

CIRCULARITY_CATEGORIES = (
    "Excellent Recovery Potential",
    "High Recovery Potential",
    "Moderate Recovery Potential",
    "Limited Recovery Potential",
    "Disposal Recommended",
)


def _clip(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _condition_modifier(quality_score: float) -> float:
    """Damaged/low-quality items realistically achieve less recovery than
    their category alone suggests, so scale credit by material condition."""
    return 0.5 + 0.5 * quality_score


# ---------------------------------------------------------------------------
# 8. Environmental Impact Assessment Engine
# ---------------------------------------------------------------------------

def estimate_co2_savings(material: str, quantity_kg: float, waste_category: str, quality_score: float) -> dict:
    """CO2 savings estimation."""
    factor = _CO2_FACTORS_KG_PER_KG.get(material, 6.5)
    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    modifier = _condition_modifier(quality_score)
    co2_saved_kg = round(quantity_kg * factor * credit * modifier, 2)
    return {
        "co2_factor_kg_per_kg": factor,
        "co2_saved_kg": co2_saved_kg,
        "co2_saved_kg_per_kg_processed": round(factor * credit * modifier, 2),
    }


def estimate_water_savings(material: str, quantity_kg: float, waste_category: str, quality_score: float) -> dict:
    """Water savings estimation."""
    factor = _WATER_FACTORS_L_PER_KG.get(material, 500.0)
    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    modifier = _condition_modifier(quality_score)
    water_saved_l = round(quantity_kg * factor * credit * modifier, 1)
    return {
        "water_factor_l_per_kg": factor,
        "water_saved_liters": water_saved_l,
        "water_saved_liters_per_kg_processed": round(factor * credit * modifier, 1),
    }


def analyze_landfill_reduction(quantity_kg: float, waste_category: str) -> dict:
    """Landfill reduction analysis (part of Environmental Impact Assessment
    Engine) -- how much mass is diverted away from landfill by this
    pathway, and how that compares to a "sent to landfill" baseline."""
    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    diverted_kg = round(quantity_kg * credit, 2)
    diversion_rate_pct = round(credit * 100, 1)

    if diversion_rate_pct >= 80:
        diversion_level = "High Diversion"
    elif diversion_rate_pct >= 50:
        diversion_level = "Moderate Diversion"
    elif diversion_rate_pct >= 20:
        diversion_level = "Low Diversion"
    else:
        diversion_level = "Minimal Diversion"

    return {
        "landfill_diverted_kg": diverted_kg,
        "diversion_rate_pct": diversion_rate_pct,
        "diversion_level": diversion_level,
    }


def estimate_resource_conservation(material: str, quantity_kg: float, waste_category: str, quality_score: float) -> dict:
    """Resource conservation estimation -- raw (virgin) fiber input and an
    approximate energy saving avoided by not producing new material."""
    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    modifier = _condition_modifier(quality_score)
    raw_material_conserved_kg = round(quantity_kg * credit * modifier, 2)
    # Rough energy proxy: ~1.2 kg CO2e corresponds to ~1 kWh for typical grid
    # mix assumptions -- used only to give a second, relatable unit.
    co2 = estimate_co2_savings(material, quantity_kg, waste_category, quality_score)["co2_saved_kg"]
    energy_conserved_kwh = round(co2 / 1.2, 1)
    return {
        "raw_material_conserved_kg": raw_material_conserved_kg,
        "energy_conserved_kwh": energy_conserved_kwh,
    }


def generate_sustainability_report(material: str, waste_category: str, quantity_kg: float, impact: dict) -> str:
    """Sustainability reporting -- a short, human-readable summary paragraph
    stitching the environmental-impact figures together."""
    return (
        f"Processing {quantity_kg:g} kg of {material} through the '{waste_category}' pathway "
        f"is estimated to avoid approximately {impact['co2_saved_kg']} kg of CO2e emissions and "
        f"{impact['water_saved_liters']:,.0f} liters of water compared to producing the equivalent "
        f"amount of virgin material, while diverting {impact['landfill_diverted_kg']} kg "
        f"({impact['diversion_rate_pct']}%) away from landfill."
    )


# ---------------------------------------------------------------------------
# 7. Sustainability Intelligence Engine
# ---------------------------------------------------------------------------

def analyze_circular_economy(waste_category: str, recyclability_score: float, reuse_potential: str) -> dict:
    """Circular economy analysis -- describes where in the circular loop
    this item sits and the recommended circular pathway."""
    loop_stage_by_category = {
        "Reusable": "Reuse Loop (shortest loop -- item re-enters use directly)",
        "Repairable": "Repair Loop (restore, then re-enters the reuse loop)",
        "Recyclable": "Material Recycling Loop (fiber recovered for new production)",
        "Upcyclable": "Upcycling Loop (converted into a higher/adjacent-value product)",
        "Compostable": "Biological Loop (returns nutrients via industrial composting)",
        "Hazardous Textile Waste": "Linear/Disposal Path (loop broken -- requires isolation)",
    }
    return {
        "circular_loop_stage": loop_stage_by_category.get(waste_category, "Unclassified"),
        "loop_closed": waste_category not in ("Hazardous Textile Waste",),
        "recyclability_score": recyclability_score,
        "reuse_potential": reuse_potential,
    }


# ---------------------------------------------------------------------------
# Recycling Recommendation Workflow Engine
# ---------------------------------------------------------------------------

_WORKFLOW_STEPS_BY_CATEGORY = {
    "Reusable": [
        ("Quality check & clean", "Inspect for wear, launder/sanitize before it re-enters circulation."),
        ("Route to reuse channel", "List through resale, donation, or a reuse/thrift partner."),
        ("Track hand-off", "Log the outbound reuse transaction for circularity reporting."),
    ],
    "Repairable": [
        ("Assess repair type", "Identify the fix needed (stitching, patching, hardware replacement)."),
        ("Route to repair partner", "Send to an in-house or third-party repair/mending service."),
        ("Return to reuse stream", "Once repaired, re-enter the Reuse Loop workflow."),
    ],
    "Recyclable": [
        ("Sort by fiber type", "Group by the predicted material so batches stay single-fiber where possible."),
        ("Bale & label", "Bale the sorted material and label with material + weight for the recycler."),
        ("Route to material recycler", "Hand off to a fiber-recycling partner for mechanical/chemical recycling."),
    ],
    "Upcyclable": [
        ("Evaluate design potential", "Flag distinctive fabric/pattern for upcycled product design."),
        ("Route to upcycling partner", "Send to an upcycling studio or maker network."),
        ("Track output product", "Log the new product created from the upcycled material."),
    ],
    "Compostable": [
        ("Remove non-compostable trims", "Strip zippers, buttons, and synthetic threads before composting."),
        ("Route to industrial composting", "Hand off to a certified industrial composting facility."),
        ("Log compost yield", "Record diverted weight for landfill-reduction reporting."),
    ],
    "Hazardous Textile Waste": [
        ("Isolate & label", "Separate immediately and label per hazardous-waste handling rules."),
        ("Route to certified handler", "Hand off only to a certified hazardous-waste disposal partner."),
        ("Document compliance", "File the disposal record required for regulatory compliance."),
    ],
}

_PARTNER_TYPE_BY_CATEGORY = {
    "Reusable": "Resale / donation / reuse network",
    "Repairable": "Repair & mending service",
    "Recyclable": "Fiber / material recycler",
    "Upcyclable": "Upcycling studio / maker network",
    "Compostable": "Certified industrial composting facility",
    "Hazardous Textile Waste": "Certified hazardous-waste handler",
}


def generate_recommendation_workflow(
    waste_category: str, material: str, circularity_score: float,
    damage_detected: bool, contamination_detected: bool,
) -> dict:
    """Recycling recommendation workflow -- an ordered, actionable set of
    next steps for this specific item (not just a category label), plus the
    type of partner it should be routed to and a handling priority."""

    steps_source = _WORKFLOW_STEPS_BY_CATEGORY.get(
        waste_category, _WORKFLOW_STEPS_BY_CATEGORY["Recyclable"]
    )
    steps = [
        {"step": i + 1, "title": title, "detail": detail}
        for i, (title, detail) in enumerate(steps_source)
    ]

    if waste_category == "Hazardous Textile Waste" or contamination_detected:
        priority = "High"
    elif damage_detected or circularity_score < 50:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "recommended_pathway": waste_category,
        "suggested_partner_type": _PARTNER_TYPE_BY_CATEGORY.get(waste_category, "General recycler"),
        "priority": priority,
        "steps": steps,
    }


def estimate_resource_recovery(recyclability_score: float, waste_category: str, quantity_kg: float) -> dict:
    """Resource recovery estimation -- how much of the input mass can
    realistically be recovered as usable material/fiber."""
    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    recovery_efficiency_pct = round(_clip(recyclability_score * (0.5 + 0.5 * credit)), 1)
    recoverable_material_kg = round(quantity_kg * (recovery_efficiency_pct / 100.0), 2)
    return {
        "recovery_efficiency_pct": recovery_efficiency_pct,
        "recoverable_material_kg": recoverable_material_kg,
    }


def benchmark_sustainability(circularity_score: float) -> dict:
    """Sustainability benchmarking -- compares the computed circularity
    score against a static reference "industry average" baseline."""
    delta = round(circularity_score - _INDUSTRY_BENCHMARK_SCORE, 1)
    if delta > 5:
        label = "Above industry benchmark"
    elif delta < -5:
        label = "Below industry benchmark"
    else:
        label = "At industry benchmark"
    return {
        "benchmark_baseline_score": _INDUSTRY_BENCHMARK_SCORE,
        "benchmark_delta": delta,
        "benchmark_label": label,
    }


# ---------------------------------------------------------------------------
# 9. Waste Scoring Engine (weighted circularity model)
# ---------------------------------------------------------------------------

def _circularity_category(score: float) -> str:
    if score >= 85:
        return "Excellent Recovery Potential"
    if score >= 70:
        return "High Recovery Potential"
    if score >= 50:
        return "Moderate Recovery Potential"
    if score >= 30:
        return "Limited Recovery Potential"
    return "Disposal Recommended"


def compute_waste_scores(
    *,
    material: str,
    quantity_kg: float,
    waste_category: str,
    recyclability_score: float,
    quality_score: float,
    reuse_potential: str,
    damage_score: float,
    contamination_score: float,
) -> dict:
    """Runs all three Milestone 3 engines and rolls everything up into the
    Waste Scoring Engine's five headline scores + the weighted overall
    circularity score / category."""

    co2 = estimate_co2_savings(material, quantity_kg, waste_category, quality_score)
    water = estimate_water_savings(material, quantity_kg, waste_category, quality_score)
    landfill = analyze_landfill_reduction(quantity_kg, waste_category)
    resources = estimate_resource_conservation(material, quantity_kg, waste_category, quality_score)
    circular_economy = analyze_circular_economy(waste_category, recyclability_score, reuse_potential)
    recovery = estimate_resource_recovery(recyclability_score, waste_category, quantity_kg)
    impact = {**co2, **water, **landfill, **resources}
    report_text = generate_sustainability_report(material, waste_category, quantity_kg, impact)

    # ---- Waste Scoring Engine: five component scores (0-100 each) ----
    material_condition_score = round(_clip(quality_score * 100), 1)
    reuse_score = round(_clip(_REUSE_POTENTIAL_NUMERIC.get(reuse_potential, 50.0)), 1)

    credit = _PROCESSING_CREDIT_BY_CATEGORY.get(waste_category, 0.3)
    modifier = _condition_modifier(quality_score)
    environmental_benefit_score = round(_clip(100 * credit * modifier), 1)

    processing_feasibility_score = round(
        _clip(100 - (damage_score * 50 + contamination_score * 50)), 1
    )

    sustainability_score = round(
        _clip(
            0.4 * environmental_benefit_score
            + 0.3 * material_condition_score
            + 0.3 * processing_feasibility_score
        ),
        1,
    )

    material_recovery_score = recovery["recovery_efficiency_pct"]

    # ---- Overall weighted Circularity Score ----
    circularity_score = round(
        _clip(
            0.35 * recyclability_score
            + 0.20 * material_condition_score
            + 0.20 * reuse_score
            + 0.15 * environmental_benefit_score
            + 0.10 * processing_feasibility_score
        ),
        1,
    )
    circularity_category = _circularity_category(circularity_score)

    benchmark = benchmark_sustainability(circularity_score)
    workflow = generate_recommendation_workflow(
        waste_category=waste_category,
        material=material,
        circularity_score=circularity_score,
        damage_detected=damage_score >= 0.5,
        contamination_detected=contamination_score >= 0.5,
    )

    return {
        # Environmental Impact Assessment Engine
        "co2_saved_kg": co2["co2_saved_kg"],
        "water_saved_liters": water["water_saved_liters"],
        "landfill_diverted_kg": landfill["landfill_diverted_kg"],
        "diversion_rate_pct": landfill["diversion_rate_pct"],
        "diversion_level": landfill["diversion_level"],
        "raw_material_conserved_kg": resources["raw_material_conserved_kg"],
        "energy_conserved_kwh": resources["energy_conserved_kwh"],
        "report_text": report_text,

        # Sustainability Intelligence Engine
        "circular_loop_stage": circular_economy["circular_loop_stage"],
        "loop_closed": circular_economy["loop_closed"],
        "recoverable_material_kg": recovery["recoverable_material_kg"],
        "recovery_efficiency_pct": recovery["recovery_efficiency_pct"],
        "benchmark_baseline_score": benchmark["benchmark_baseline_score"],
        "benchmark_delta": benchmark["benchmark_delta"],
        "benchmark_label": benchmark["benchmark_label"],

        # Recycling Recommendation Workflow
        "recommended_pathway": workflow["recommended_pathway"],
        "suggested_partner_type": workflow["suggested_partner_type"],
        "recommendation_priority": workflow["priority"],
        "recommendation_steps": workflow["steps"],

        # Waste Scoring Engine
        "recyclability_score": round(recyclability_score, 1),
        "material_condition_score": material_condition_score,
        "reuse_score": reuse_score,
        "environmental_benefit_score": environmental_benefit_score,
        "processing_feasibility_score": processing_feasibility_score,
        "sustainability_score": sustainability_score,
        "material_recovery_score": material_recovery_score,
        "circularity_score": circularity_score,
        "circularity_category": circularity_category,

        "quantity_kg": quantity_kg,
        "material": material,
        "waste_category": waste_category,
    }


SCORING_WEIGHTS = {
    "material_recyclability": 0.35,
    "material_condition": 0.20,
    "reuse_potential": 0.20,
    "environmental_benefit": 0.15,
    "processing_feasibility": 0.10,
}
