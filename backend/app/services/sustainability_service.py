"""
Sustainability Intelligence Engine — Service Layer (Milestone 3)

All business logic for computing sustainability metrics lives here.
Routers must NOT perform any calculations — they delegate entirely
to the functions exposed in this module.

────────────────────────────────────────────────────────────────────
Architecture
────────────────────────────────────────────────────────────────────

Coefficients / configuration
    All coefficients are stored in plain Python dicts at the top of
    this file so they can be replaced by ML-driven look-ups or loaded
    from a database / config file without touching calculation logic.

Pure helper functions
    calculate_co2_saved()
    calculate_water_saved()
    calculate_landfill_diverted()
    calculate_resource_recovery()
    calculate_circularity()
    calculate_sustainability_score()

    Each function is stateless, independently testable, and accepts
    only primitive arguments (no ORM objects).

Orchestrator
    calculate_and_save()
        Fetches the inventory item, resolves the waste category via
        the waste_classifier, calls all helpers, persists the result,
        and returns a SustainabilityMetric ORM instance.

Retrieval helpers
    get_metric_by_inventory_id()
    get_all_metrics()
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.sustainability_metric import SustainabilityMetric
from app.models.inventory import Inventory
from app.services import waste_classifier

logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════════════════════════
# 1. CONFIGURABLE SUSTAINABILITY COEFFICIENTS
#    Replace values here — or load from DB / env — without touching
#    any calculation logic below.
# ════════════════════════════════════════════════════════════════════

# kg of CO₂ saved per kg of textile recycled (instead of virgin production)
# Sources: Ellen MacArthur Foundation, WRAP textile sustainability data
CO2_COEFFICIENTS: dict[str, float] = {
    "Cotton":       2.5,   # virgin cotton is water/chemical intensive
    "Polyester":    5.5,   # petroleum-derived — high embodied carbon
    "Wool":         3.0,   # methane from livestock + processing
    "Silk":         4.0,   # energy-intensive rearing & processing
    "Denim":        3.2,   # cotton-based + dyeing energy
    "Nylon":        7.2,   # highest embodied carbon of synthetics
    "Rayon":        2.0,   # cellulose-based — lower footprint
    "Linen":        1.5,   # flax crop has low carbon footprint
    "Acrylic":      6.0,   # petroleum-based polymer
    "Mixed Fabric": 4.0,   # blended average
}

# Litres of water saved per kg of textile recycled
# Sources: WWF, WRAP, Textile Exchange water-use benchmarks
WATER_FACTORS: dict[str, float] = {
    "Cotton":       70.0,  # ~10,000 L to grow 1 kg raw cotton
    "Polyester":    50.0,  # water for cooling & dyeing
    "Wool":         100.0, # sheep water consumption + processing
    "Silk":         90.0,  # silkworm rearing & degumming
    "Denim":        65.0,  # cotton + heavy dyeing
    "Nylon":        40.0,  # synthetic — less process water
    "Rayon":        55.0,  # pulp processing water
    "Linen":        30.0,  # flax is drought-tolerant
    "Acrylic":      45.0,  # polymerisation water
    "Mixed Fabric": 60.0,  # blended average
}

# Recovery rate (fraction of weight recoverable) per waste category
RECOVERY_RATES: dict[str, float] = {
    "Recyclable":  0.90,
    "Reusable":    0.80,
    "Repairable":  0.75,
    "Upcyclable":  0.85,
    "Compostable": 0.70,
    "Hazardous":   0.20,  # specialist handling — low material recovery
}

# Base landfill diversion percentage per waste category (%)
LANDFILL_DIVERSION_BASE: dict[str, float] = {
    "Recyclable":  92.0,
    "Reusable":    88.0,
    "Repairable":  80.0,
    "Upcyclable":  85.0,
    "Compostable": 78.0,
    "Hazardous":   40.0,  # partial — some hazardous fractions go to controlled landfill
}

# Circularity thresholds (recovery_fraction × recyclability_weight)
# Score < LOW_THRESHOLD  → "Low"
# Score < HIGH_THRESHOLD → "Medium"
# Score ≥ HIGH_THRESHOLD → "High"
CIRCULARITY_LOW_THRESHOLD: float = 0.50
CIRCULARITY_HIGH_THRESHOLD: float = 0.75

# Recyclability weight per category (for circularity calculation)
CATEGORY_RECYCLABILITY_WEIGHT: dict[str, float] = {
    "Recyclable":  1.00,
    "Reusable":    0.90,
    "Repairable":  0.75,
    "Upcyclable":  0.85,
    "Compostable": 0.70,
    "Hazardous":   0.10,
}

# Weighted scoring configuration
# Weights must sum to 1.0
SCORE_WEIGHTS: dict[str, float] = {
    "co2":      0.30,
    "water":    0.25,
    "recovery": 0.25,
    "landfill": 0.20,
}

# Normalisation upper bounds for CO₂ and water (used to convert raw values → 0–1)
# These represent "excellent" reference values at a reasonable weight (10 kg Polyester)
SCORE_MAX_CO2: float = 72.0    # Nylon, 10 kg → 72 kg CO₂
SCORE_MAX_WATER: float = 1000.0  # Wool, 10 kg → 1 000 L


# ════════════════════════════════════════════════════════════════════
# 2. PURE CALCULATION HELPERS
# ════════════════════════════════════════════════════════════════════

def calculate_co2_saved(weight_kg: float, material_type: str) -> float:
    """
    Estimate kg of CO₂ emissions avoided by recycling ``weight_kg``
    of the given textile material instead of producing it from virgin sources.

    Parameters
    ----------
    weight_kg    : Weight of the textile batch in kilograms.
    material_type: Canonical material name (e.g. "Cotton").

    Returns
    -------
    float  — kg CO₂ saved, rounded to 2 decimal places.
    """
    coefficient = CO2_COEFFICIENTS.get(material_type, CO2_COEFFICIENTS["Mixed Fabric"])
    return round(weight_kg * coefficient, 2)


def calculate_water_saved(weight_kg: float, material_type: str) -> float:
    """
    Estimate litres of water saved by recycling ``weight_kg`` of textile
    instead of producing virgin material.

    Parameters
    ----------
    weight_kg    : Weight of the textile batch in kilograms.
    material_type: Canonical material name (e.g. "Cotton").

    Returns
    -------
    float  — litres of water saved, rounded to 2 decimal places.
    """
    factor = WATER_FACTORS.get(material_type, WATER_FACTORS["Mixed Fabric"])
    return round(weight_kg * factor, 2)


def calculate_landfill_diverted(waste_category: str) -> float:
    """
    Return the estimated percentage of material weight that is diverted
    away from landfill based on the waste category's typical diversion rate.

    Rather than requiring a "total batch weight" (which is unknown at single-
    item level), we use industry-standard base rates per waste category. This
    can be upgraded to a dynamic calculation when batch-level data is available.

    Parameters
    ----------
    waste_category: Waste classification (e.g. "Recyclable").

    Returns
    -------
    float  — diversion percentage 0–100, rounded to 2 decimal places.
    """
    base = LANDFILL_DIVERSION_BASE.get(waste_category, 70.0)
    return round(base, 2)


def calculate_resource_recovery(weight_kg: float, waste_category: str) -> float:
    """
    Estimate the mass of textile material that can be physically recovered
    (recycled fibre, reused garments, upcycled components, etc.).

    Parameters
    ----------
    weight_kg     : Weight of the textile batch in kilograms.
    waste_category: Waste classification (e.g. "Recyclable").

    Returns
    -------
    float  — kg of recoverable material, rounded to 2 decimal places.
    """
    rate = RECOVERY_RATES.get(waste_category, 0.70)
    return round(weight_kg * rate, 2)


def calculate_circularity(
    waste_category: str,
    resource_recovery_kg: float,
    weight_kg: float,
) -> str:
    """
    Compute a qualitative circular economy contribution label.

    The circularity score combines:
    - The recovery fraction (resource_recovery_kg / weight_kg)
    - The category recyclability weight (see CATEGORY_RECYCLABILITY_WEIGHT)

    Returns
    -------
    str — "Low", "Medium", or "High"
    """
    if weight_kg <= 0:
        return "Low"

    recovery_fraction = resource_recovery_kg / weight_kg
    recyclability_weight = CATEGORY_RECYCLABILITY_WEIGHT.get(waste_category, 0.50)
    composite = recovery_fraction * recyclability_weight

    if composite >= CIRCULARITY_HIGH_THRESHOLD:
        return "High"
    elif composite >= CIRCULARITY_LOW_THRESHOLD:
        return "Medium"
    else:
        return "Low"


def calculate_sustainability_score(
    co2_saved: float,
    water_saved: float,
    resource_recovery_kg: float,
    weight_kg: float,
    landfill_diverted: float,
) -> float:
    """
    Compute a composite sustainability score in the range 0–100.

    Formula (weighted sum of normalised KPIs)
    ------------------------------------------
    score = (
        w_co2      × clamp(co2_saved      / MAX_CO2,   0, 1) +
        w_water    × clamp(water_saved    / MAX_WATER, 0, 1) +
        w_recovery × (resource_recovery_kg / weight_kg)       +
        w_landfill × (landfill_diverted   / 100)
    ) × 100

    All weights are defined in SCORE_WEIGHTS and must sum to 1.0.

    Parameters
    ----------
    co2_saved            : kg CO₂ saved.
    water_saved          : Litres of water saved.
    resource_recovery_kg : kg of material recovered.
    weight_kg            : Total batch weight in kg.
    landfill_diverted    : Diversion percentage (0–100).

    Returns
    -------
    float — score clamped to [0, 100], rounded to 2 decimal places.
    """
    if weight_kg <= 0:
        return 0.0

    def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
        return max(lo, min(hi, value))

    co2_norm      = clamp(co2_saved / SCORE_MAX_CO2)
    water_norm    = clamp(water_saved / SCORE_MAX_WATER)
    recovery_norm = clamp(resource_recovery_kg / weight_kg)
    landfill_norm = clamp(landfill_diverted / 100.0)

    raw_score = (
        SCORE_WEIGHTS["co2"]      * co2_norm
        + SCORE_WEIGHTS["water"]    * water_norm
        + SCORE_WEIGHTS["recovery"] * recovery_norm
        + SCORE_WEIGHTS["landfill"] * landfill_norm
    ) * 100.0

    return round(clamp(raw_score, 0.0, 100.0), 2)


# ════════════════════════════════════════════════════════════════════
# 3. ORCHESTRATOR — calculate_and_save()
# ════════════════════════════════════════════════════════════════════

def calculate_and_save(
    inventory_id: int,
    db: Session,
) -> SustainabilityMetric:
    """
    Main entry point for the Sustainability Intelligence Engine.

    Steps
    -----
    1. Fetch the Inventory record (raises ValueError if not found).
    2. Validate weight_kg > 0.
    3. Resolve the waste category via waste_classifier.classify().
    4. Call all pure calculation helpers.
    5. Persist a new SustainabilityMetric row (or update existing).
    6. Return the ORM instance.

    Parameters
    ----------
    inventory_id : Primary key of the inventory item to analyse.
    db           : Active SQLAlchemy session (injected by FastAPI).

    Returns
    -------
    SustainabilityMetric — the freshly created/updated ORM instance.

    Raises
    ------
    ValueError  — inventory not found, invalid weight, or unknown material.
    RuntimeError — unexpected calculation failure.
    """
    # ── Step 1: Fetch inventory ───────────────────────────────────────────────
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if inventory is None:
        raise ValueError(f"Inventory item with id={inventory_id} not found.")

    # ── Step 2: Validate weight ────────────────────────────────────────────────
    weight_kg: float = inventory.quantity_kg
    if weight_kg <= 0:
        raise ValueError(
            f"Inventory item #{inventory_id} has invalid weight: {weight_kg} kg. "
            "Weight must be greater than 0."
        )

    material_type: str = inventory.material_type

    # ── Step 3: Resolve waste category ───────────────────────────────────────
    try:
        waste_result = waste_classifier.classify(material_type)
        waste_category: str = waste_result["category"]
    except ValueError as exc:
        raise ValueError(
            f"Could not classify material '{material_type}': {exc}"
        ) from exc

    # ── Step 4: Run all calculations ──────────────────────────────────────────
    try:
        co2_saved          = calculate_co2_saved(weight_kg, material_type)
        water_saved        = calculate_water_saved(weight_kg, material_type)
        landfill_diverted  = calculate_landfill_diverted(waste_category)
        resource_recovery  = calculate_resource_recovery(weight_kg, waste_category)
        circularity_score  = calculate_circularity(waste_category, resource_recovery, weight_kg)
        sustainability_score = calculate_sustainability_score(
            co2_saved=co2_saved,
            water_saved=water_saved,
            resource_recovery_kg=resource_recovery,
            weight_kg=weight_kg,
            landfill_diverted=landfill_diverted,
        )
    except Exception as exc:
        logger.exception("Unexpected error during sustainability calculation.")
        raise RuntimeError(f"Calculation failed: {exc}") from exc

    # ── Step 5: Upsert (one record per inventory item) ────────────────────────
    existing = (
        db.query(SustainabilityMetric)
        .filter(SustainabilityMetric.inventory_id == inventory_id)
        .first()
    )

    if existing:
        # Update in-place — recalculation requested
        existing.material_type       = material_type
        existing.waste_category      = waste_category
        existing.weight_kg           = weight_kg
        existing.co2_saved           = co2_saved
        existing.water_saved         = water_saved
        existing.landfill_diverted   = landfill_diverted
        existing.resource_recovery   = resource_recovery
        existing.circularity_score   = circularity_score
        existing.sustainability_score = sustainability_score
        metric = existing
    else:
        metric = SustainabilityMetric(
            inventory_id         = inventory_id,
            material_type        = material_type,
            waste_category       = waste_category,
            weight_kg            = weight_kg,
            co2_saved            = co2_saved,
            water_saved          = water_saved,
            landfill_diverted    = landfill_diverted,
            resource_recovery    = resource_recovery,
            circularity_score    = circularity_score,
            sustainability_score = sustainability_score,
        )
        db.add(metric)

    db.commit()
    db.refresh(metric)

    logger.info(
        "Sustainability metric saved: inventory_id=%s material=%s score=%.2f",
        inventory_id, material_type, sustainability_score,
    )
    return metric


# ════════════════════════════════════════════════════════════════════
# 4. RETRIEVAL HELPERS
# ════════════════════════════════════════════════════════════════════

def get_metric_by_inventory_id(
    inventory_id: int,
    db: Session,
) -> Optional[SustainabilityMetric]:
    """
    Retrieve the stored sustainability metric for a given inventory item.

    Returns None if no metric has been calculated yet for this inventory_id.
    """
    return (
        db.query(SustainabilityMetric)
        .filter(SustainabilityMetric.inventory_id == inventory_id)
        .first()
    )


def get_all_metrics(db: Session) -> List[SustainabilityMetric]:
    """
    Return all sustainability metrics ordered by most recently created.
    """
    return (
        db.query(SustainabilityMetric)
        .order_by(SustainabilityMetric.created_at.desc())
        .all()
    )
