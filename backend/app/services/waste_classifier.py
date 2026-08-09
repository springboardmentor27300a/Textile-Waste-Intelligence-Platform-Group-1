"""
Waste Classifier Service — Milestone 2, Step 2

Maps a known textile material name to a Milestone 2 waste category:
  Recyclable | Reusable | Repairable | Upcyclable | Compostable | Hazardous

The ``category`` field now returns human-readable Milestone 2 category names
so the frontend and reports display them directly without further mapping.

Design mirrors material_classifier.py:
  - Deterministic: the same material always returns the same category.
  - Pluggable: replace classify() body with real model inference when ready.
  - Public interface: classify(material: str) -> { category: str,
                                                   confidence: float,
                                                   handling: str,
                                                   disposal: str }
"""

import hashlib
import random
from typing import Dict, Tuple

# ── Material → Milestone 2 Waste Category mapping ────────────────────────────
# Maps each fabric type to its primary Milestone 2 waste stream.
MATERIAL_CATEGORY_MAP: Dict[str, str] = {
    "Cotton":       "Recyclable",      # natural fibre — high recovery rate
    "Polyester":    "Reusable",        # synthetic — often resold or reprocessed
    "Wool":         "Recyclable",      # natural fibre — fibre reclamation viable
    "Silk":         "Upcyclable",      # luxury fibre — high upcycle value
    "Denim":        "Repairable",      # durable — repair/resale common
    "Nylon":        "Hazardous",       # synthetic — chemical treatment residue
    "Rayon":        "Compostable",     # semi-synthetic cellulose — biodegradable
    "Linen":        "Compostable",     # natural plant fibre — fully biodegradable
    "Acrylic":      "Hazardous",       # petroleum-based — specialist disposal
    "Mixed Fabric": "Reusable",        # blended — sorted for second-use programs
}

# ── Handling guidance per category ───────────────────────────────────────────
HANDLING_GUIDE: Dict[str, str] = {
    "Recyclable":  "Send to certified textile recycling facility for fibre recovery.",
    "Reusable":    "Clean, inspect, and route to second-hand retail or donation.",
    "Repairable":  "Assess damage — minor repairs restore to saleable condition.",
    "Upcyclable":  "Partner with designers or artisans for high-value transformation.",
    "Compostable": "Shred and compost with industrial composting — no synthetic blends.",
    "Hazardous":   "Segregate immediately — route to licensed hazardous waste handler.",
}

# ── Disposal recommendations per category ────────────────────────────────────
DISPOSAL_GUIDE: Dict[str, str] = {
    "Recyclable":  "Mechanical or chemical recycling → raw fibre regeneration.",
    "Reusable":    "Donation drives, resale platforms, or corporate refurbishment programs.",
    "Repairable":  "In-house repair teams or third-party refurbishment services.",
    "Upcyclable":  "Creative reuse: quilts, insulation panels, fashion upcycling.",
    "Compostable": "Industrial composting — decomposes within 6–12 months.",
    "Hazardous":   "Specialist chemical waste contractor — do NOT landfill or incinerate.",
}

# ── Confidence range per category ─────────────────────────────────────────────
CONFIDENCE_RANGES: Dict[str, Tuple[float, float]] = {
    "Recyclable":  (82.0, 95.0),
    "Reusable":    (80.0, 93.0),
    "Repairable":  (75.0, 91.0),
    "Upcyclable":  (78.0, 92.0),
    "Compostable": (83.0, 95.0),
    "Hazardous":   (76.0, 90.0),
}

CATEGORY_DETAILS: Dict[str, dict] = {
    "Recyclable":  {"recyclability_assessment": "High", "reuse_potential": "Low", "contamination_detection": "Low"},
    "Reusable":    {"recyclability_assessment": "Medium", "reuse_potential": "High", "contamination_detection": "Low"},
    "Repairable":  {"recyclability_assessment": "Medium", "reuse_potential": "High", "contamination_detection": "Low"},
    "Upcyclable":  {"recyclability_assessment": "Medium", "reuse_potential": "High", "contamination_detection": "Low"},
    "Compostable": {"recyclability_assessment": "High", "reuse_potential": "Low", "contamination_detection": "Low"},
    "Hazardous":   {"recyclability_assessment": "Low", "reuse_potential": "None", "contamination_detection": "High"},
}

# Normalised lookup key (lowercase, strip whitespace)
_NORMALISED: Dict[str, str] = {k.lower().strip(): k for k in MATERIAL_CATEGORY_MAP}


# ── Classifier Interface ──────────────────────────────────────────────────────

def classify(material: str, damage_level: str = "Unknown") -> Dict[str, object]:
    """
    Predict the Milestone 2 waste category for a given textile material and damage condition.
    """
    # Normalise input
    key = material.lower().strip()

    # Resolve to canonical casing
    canonical = _NORMALISED.get(key)
    if canonical is None:
        raise ValueError(
            f"Unknown material '{material}'. "
            f"Recognised: {list(MATERIAL_CATEGORY_MAP.keys())}"
        )

    category = MATERIAL_CATEGORY_MAP[canonical]
    
    # Adjust category based on damage level
    dl = damage_level.lower()
    if category == "Reusable":
        if "moderate" in dl or "wear" in dl:
            category = "Repairable"
        elif "heavy" in dl:
            category = "Recyclable"
    elif category == "Repairable" and "heavy" in dl:
        category = "Recyclable"
    elif category == "Recyclable" and "heavy" in dl and canonical in ["Cotton", "Linen"]:
        category = "Compostable"

    # Deterministic confidence — seeded from the canonical material name via md5
    seed = int(hashlib.md5(canonical.encode()).hexdigest(), 16) & 0xFFFFFFFF
    rng = random.Random(seed)
    low, high = CONFIDENCE_RANGES.get(category, (80.0, 95.0))
    confidence = round(rng.uniform(low, high), 1)

    details = CATEGORY_DETAILS.get(category, CATEGORY_DETAILS["Recyclable"])

    return {
        "category":   category,
        "confidence": confidence,
        "handling":   HANDLING_GUIDE[category],
        "disposal":   DISPOSAL_GUIDE[category],
        "recyclability_assessment": details["recyclability_assessment"],
        "reuse_potential": details["reuse_potential"],
        "contamination_detection": details["contamination_detection"],
    }
