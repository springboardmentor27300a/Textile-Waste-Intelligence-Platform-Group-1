"""
Recyclability Assessor Service — Milestone 2, Step 3

Computes a deterministic recyclability score (0–100) and recovery status
for a textile item given its material type, physical condition, and
contamination level.

Design mirrors material_classifier.py and waste_classifier.py:
  - Deterministic: same inputs always produce the same score.
  - Pluggable: replace assess() body with real model inference when ready.
  - Public interface:
      assess(material, condition, contamination)
          -> { score: int, status: str }

Score interpretation:
  80–100  →  "Highly Recyclable"
  60–79   →  "Recyclable"
  40–59   →  "Partially Recyclable"
  20–39   →  "Low Recyclability"
   0–19   →  "Not Recyclable"
"""

from typing import Dict

# ── Valid input values (mirror the schema comments) ───────────────────────────

VALID_CONDITIONS = {"excellent", "good", "fair", "poor", "unusable"}
VALID_CONTAMINATIONS = {"none", "low", "medium", "high"}

# ── Material base scores ──────────────────────────────────────────────────────
# Natural fibres score higher (more recyclable/compostable).
# Synthetics score lower; blended fabrics are hardest to recover.
MATERIAL_BASE_SCORE: Dict[str, int] = {
    "Cotton":       85,
    "Wool":         80,
    "Linen":        82,
    "Silk":         75,
    "Rayon":        68,
    "Denim":        65,
    "Polyester":    55,
    "Nylon":        50,
    "Acrylic":      42,
    "Mixed Fabric": 35,
}

# ── Condition adjustment (applied to base score) ──────────────────────────────
CONDITION_DELTA: Dict[str, int] = {
    "excellent": +10,
    "good":        0,
    "fair":       -10,
    "poor":       -20,
    "unusable":   -35,
}

# ── Contamination adjustment ──────────────────────────────────────────────────
CONTAMINATION_DELTA: Dict[str, int] = {
    "none":    0,
    "low":    -5,
    "medium": -15,
    "high":   -30,
}

# ── Score → human-readable status ────────────────────────────────────────────
def _score_to_status(score: int) -> str:
    if score >= 80:
        return "Highly Recyclable"
    if score >= 60:
        return "Recyclable"
    if score >= 40:
        return "Partially Recyclable"
    if score >= 20:
        return "Low Recyclability"
    return "Not Recyclable"


# ── Assessor Interface ────────────────────────────────────────────────────────

def assess(material: str, condition: str, contamination: str) -> Dict[str, object]:
    """
    Compute a recyclability score for a textile item.

    Args:
        material:      Material name (case-insensitive).
                       Recognised values: Cotton, Polyester, Wool, Silk,
                       Denim, Nylon, Rayon, Linen, Acrylic, Mixed Fabric.
        condition:     Physical condition of the textile.
                       Allowed: ``excellent`` | ``good`` | ``fair``
                                | ``poor`` | ``unusable``
        contamination: Level of chemical/biological contamination.
                       Allowed: ``none`` | ``low`` | ``medium`` | ``high``

    Returns:
        dict with keys:
          - score  (int): recyclability score 0–100 (clamped)
          - status (str): human-readable recovery status

    Raises:
        ValueError: if any input value is not recognised.

    Note:
        Score = material_base + condition_delta + contamination_delta,
        then clamped to [0, 100].  Replace this function body with real
        model inference when ready.
    """
    # ── Normalise inputs ──────────────────────────────────────────────────────
    material_key   = material.strip()
    condition_key  = condition.lower().strip()
    contam_key     = contamination.lower().strip()

    # ── Validate ──────────────────────────────────────────────────────────────
    # Material lookup — case-insensitive
    canonical_material = next(
        (m for m in MATERIAL_BASE_SCORE if m.lower() == material_key.lower()),
        None,
    )
    if canonical_material is None:
        raise ValueError(
            f"Unknown material '{material}'. "
            f"Recognised: {list(MATERIAL_BASE_SCORE.keys())}"
        )

    if condition_key not in VALID_CONDITIONS:
        raise ValueError(
            f"Invalid condition '{condition}'. "
            f"Allowed: {sorted(VALID_CONDITIONS)}"
        )

    if contam_key not in VALID_CONTAMINATIONS:
        raise ValueError(
            f"Invalid contamination '{contamination}'. "
            f"Allowed: {sorted(VALID_CONTAMINATIONS)}"
        )

    # ── Score calculation ─────────────────────────────────────────────────────
    base   = MATERIAL_BASE_SCORE[canonical_material]
    delta  = CONDITION_DELTA[condition_key] + CONTAMINATION_DELTA[contam_key]
    score  = max(0, min(100, base + delta))

    return {
        "score":  score,
        "status": _score_to_status(score),
    }
