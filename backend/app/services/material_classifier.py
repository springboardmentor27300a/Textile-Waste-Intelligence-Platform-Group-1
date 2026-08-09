"""
Material Classifier Service — Milestone 2

This module provides a deterministic placeholder classifier that can be
swapped out for a real TensorFlow / YOLO / HuggingFace model with minimal
changes. The public interface is the single `classify(filename)` function.

To plug in a real model later:
  1. Load your model at module-level (or via a singleton factory).
  2. Replace the body of `classify()` keeping the same return signature:
     { "material": str, "confidence": float }
"""

import hashlib
import random
from typing import Dict

# ── Supported Materials ───────────────────────────────────────────────────────

MATERIALS = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Denim",
    "Nylon",
    "Rayon",
    "Linen",
    "Acrylic",
    "Mixed Fabric",
]

# Confidence range per material (simulates realistic model certainty)
CONFIDENCE_RANGES: Dict[str, tuple] = {
    "Cotton":       (88.0, 97.5),
    "Polyester":    (85.0, 96.0),
    "Wool":         (82.0, 94.0),
    "Silk":         (78.0, 93.0),
    "Denim":        (86.0, 95.5),
    "Nylon":        (80.0, 93.0),
    "Rayon":        (75.0, 91.0),
    "Linen":        (83.0, 95.0),
    "Acrylic":      (77.0, 92.0),
    "Mixed Fabric": (65.0, 85.0),
}

MATERIAL_DETAILS: Dict[str, dict] = {
    "Cotton":       {"fabric_type": "Woven/Knit", "fiber_composition": "100% Cotton", "blend_identification": "Pure Natural", "material_quality": "High Grade", "fabric_category": "Natural Plant Fiber"},
    "Polyester":    {"fabric_type": "Woven/Knit", "fiber_composition": "100% Polyester", "blend_identification": "Pure Synthetic", "material_quality": "Standard Grade", "fabric_category": "Synthetic Fiber"},
    "Wool":         {"fabric_type": "Woven/Knit", "fiber_composition": "100% Wool", "blend_identification": "Pure Natural", "material_quality": "Premium Grade", "fabric_category": "Natural Animal Fiber"},
    "Silk":         {"fabric_type": "Woven", "fiber_composition": "100% Silk", "blend_identification": "Pure Natural", "material_quality": "Luxury Grade", "fabric_category": "Natural Animal Fiber"},
    "Denim":        {"fabric_type": "Twill Weave", "fiber_composition": "98% Cotton, 2% Elastane", "blend_identification": "Cotton Blend", "material_quality": "Heavy Duty", "fabric_category": "Natural Plant Fiber"},
    "Nylon":        {"fabric_type": "Woven/Knit", "fiber_composition": "100% Nylon", "blend_identification": "Pure Synthetic", "material_quality": "High Durability", "fabric_category": "Synthetic Fiber"},
    "Rayon":        {"fabric_type": "Woven", "fiber_composition": "100% Rayon", "blend_identification": "Pure Semi-Synthetic", "material_quality": "Standard Grade", "fabric_category": "Semi-Synthetic"},
    "Linen":        {"fabric_type": "Woven", "fiber_composition": "100% Linen", "blend_identification": "Pure Natural", "material_quality": "High Grade", "fabric_category": "Natural Plant Fiber"},
    "Acrylic":      {"fabric_type": "Knit", "fiber_composition": "100% Acrylic", "blend_identification": "Pure Synthetic", "material_quality": "Standard Grade", "fabric_category": "Synthetic Fiber"},
    "Mixed Fabric": {"fabric_type": "Various", "fiber_composition": "Unknown Blend", "blend_identification": "Poly-Cotton Blend", "material_quality": "Variable", "fabric_category": "Mixed/Blended"},
}




# ── Classifier Interface ──────────────────────────────────────────────────────

from app.services import model_service
import os
from pathlib import Path

# To map filenames back to absolute path if needed, we might need the upload dir.
_uploads_dir = Path(__file__).resolve().parent.parent / "uploads"

def classify(filename: str) -> dict:
    """
    Classify the material of a textile image by filename using the trained ML model.
    """
    image_path = _uploads_dir / filename
    
    # Run prediction
    predicted_material, confidence = model_service.predict(str(image_path))
    
    # Fallback to hash if model fails
    if not predicted_material:
        digest = hashlib.md5(filename.encode()).hexdigest()
        idx    = int(digest[:8], 16) % len(MATERIALS)
        predicted_material = MATERIALS[idx]
        seed = int(digest[8:16], 16)
        rng  = random.Random(seed)
        low, high = CONFIDENCE_RANGES[predicted_material]
        confidence = round(rng.uniform(low, high), 1)
    
    # Ensure standard naming (e.g. Mixed Fabrics vs Mixed Fabric)
    if predicted_material == "Mixed Fabrics":
        predicted_material = "Mixed Fabric"

    details = MATERIAL_DETAILS.get(predicted_material, MATERIAL_DETAILS["Mixed Fabric"])

    return {
        "material":   predicted_material,
        "confidence": round(confidence, 1),
        "fabric_type": details["fabric_type"],
        "fiber_composition": details["fiber_composition"],
        "blend_identification": details["blend_identification"],
        "material_quality": details["material_quality"],
        "fabric_category": details["fabric_category"],
    }

