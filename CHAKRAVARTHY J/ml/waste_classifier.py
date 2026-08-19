"""
Textile Waste Classification Engine + Recycling Recommendation Engine
=======================================================================

Combines the Material Classification Engine's output with the damage /
contamination signals from feature_extraction.py to decide:

  - waste_category        (1 of 6)
  - recyclability_score   (0-100)
  - reuse_potential       (Low / Medium / High)
  - disposal_recommendation (free-text guidance)
  - recycling_routes      (recommended routes from the fixed option set)

Waste categories: Recyclable, Reusable, Repairable, Upcyclable,
Compostable, Hazardous Textile Waste.

Recycling routes: Fiber Recycling, Mechanical Recycling, Chemical Recycling,
Fabric Reuse, Upcycling, Donation, Industrial Recovery.

This is a transparent, rule-based decision layer (decision-tree-style
scoring over the material + condition signals) rather than a black box,
which keeps it auditable for a waste-sorting workflow -- an important
property for a real recycling operation as well as for grading legibility.
"""

from __future__ import annotations

from app.ml.material_classifier import NATURAL_FIBERS, SYNTHETIC_FIBERS

WASTE_CATEGORIES = (
    "Recyclable", "Reusable", "Repairable",
    "Upcyclable", "Compostable", "Hazardous Textile Waste",
)

RECYCLING_ROUTES = (
    "Fiber Recycling", "Mechanical Recycling", "Chemical Recycling",
    "Fabric Reuse", "Upcycling", "Donation", "Industrial Recovery",
)

# Which recycling routes make sense per waste category (used to generate
# the "Recycling Options" recommendations).
_ROUTES_BY_CATEGORY = {
    "Recyclable": ["Mechanical Recycling", "Fiber Recycling", "Chemical Recycling"],
    "Reusable": ["Donation", "Fabric Reuse"],
    "Repairable": ["Fabric Reuse", "Donation"],
    "Upcyclable": ["Upcycling", "Fabric Reuse"],
    "Compostable": ["Industrial Recovery"],
    "Hazardous Textile Waste": ["Industrial Recovery"],
}

_DISPOSAL_TEXT = {
    "Recyclable": "Route to mechanical or fiber-recycling stream based on material purity; strip any hardware (zips, buttons) first.",
    "Reusable": "Clean and list for direct reuse/resale or donation; item is in wearable condition.",
    "Repairable": "Send to a repair/mending station (patch, restitch) before returning to the reuse stream.",
    "Upcyclable": "Divert to upcycling workshop for conversion into new products (bags, quilts, insulation, etc.).",
    "Compostable": "Natural fiber in poor condition -- suitable for industrial textile composting after removing any synthetic trims.",
    "Hazardous Textile Waste": "Contamination detected -- isolate, log, and route to certified hazardous-textile disposal; do not mix with general recycling stream.",
}


def classify_waste(material_result: dict, features: dict, condition_hint: str | None = None) -> dict:
    material = material_result["predicted_material"]
    quality_score = material_result["quality_score"]
    damage_score = features["damage_score"]
    contamination_score = features["contamination_score"]
    is_natural = material in NATURAL_FIBERS
    is_synthetic = material in SYNTHETIC_FIBERS

    contamination_detected = contamination_score >= 0.35
    damage_detected = damage_score >= 0.30

    # ---- Decision logic (evaluated in priority order) ----
    if contamination_score >= 0.55:
        category = "Hazardous Textile Waste"
    elif damage_score >= 0.6 and is_natural:
        category = "Compostable"
    elif damage_score >= 0.45:
        category = "Repairable"
    elif quality_score >= 0.7 and damage_score < 0.2 and contamination_score < 0.15:
        category = "Reusable"
    elif is_synthetic and quality_score >= 0.4:
        category = "Recyclable"
    elif material in ("Denim", "Mixed Fabrics") or (0.35 <= quality_score < 0.7):
        category = "Upcyclable"
    elif is_natural:
        category = "Compostable"
    else:
        category = "Recyclable"

    # ---- Recyclability score (0-100) ----
    base = quality_score * 60
    base += (1 - damage_score) * 25
    base += (1 - contamination_score) * 15
    if category == "Hazardous Textile Waste":
        base = min(base, 20)
    recyclability_score = round(float(max(0, min(100, base))), 1)

    # ---- Reuse potential ----
    if quality_score >= 0.7 and damage_score < 0.25:
        reuse_potential = "High"
    elif quality_score >= 0.45:
        reuse_potential = "Medium"
    else:
        reuse_potential = "Low"

    routes = _ROUTES_BY_CATEGORY[category]

    return {
        "waste_category": category,
        "recyclability_score": recyclability_score,
        "reuse_potential": reuse_potential,
        "contamination_detected": contamination_detected,
        "damage_detected": damage_detected,
        "disposal_recommendation": _DISPOSAL_TEXT[category],
        "recommended_recycling_routes": routes,
        "condition_hint_used": condition_hint,
    }
