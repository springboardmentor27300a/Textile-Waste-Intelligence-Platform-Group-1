"""
Mock Predictor — Realistic Simulation Engine
==============================================
Provides realistic mock predictions for Milestone 2.
Uses image metadata (file hash, size, dimensions, dominant colors)
to produce deterministic yet varied results that feel AI-driven.

REPLACEMENT GUIDE (for Milestone 3+):
- Replace this class with a TensorFlow/PyTorch/YOLOv8/EfficientNet implementation
- Inherit from BaseModelService
- Update inference_service.py to use the new class
- No other changes needed anywhere in the codebase
"""

import hashlib
import random
from typing import Dict, Any

from app.ai.model_service import BaseModelService


# ─── Material Knowledge Base ─────────────────────────────────────────────────

MATERIALS = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Denim",
    "Rayon",
    "Nylon",
    "Acrylic",
    "Mixed Fabric",
]

MATERIAL_PROPERTIES = {
    "Cotton": {
        "origin": "Natural",
        "breathability": "Excellent",
        "moisture_absorption": "High",
        "heat_resistance": "Moderate",
        "durability": "Good",
        "biodegradable": True,
        "fabric_category": "Natural Cellulosic",
    },
    "Polyester": {
        "origin": "Synthetic",
        "breathability": "Low",
        "moisture_absorption": "Low",
        "heat_resistance": "Good",
        "durability": "Excellent",
        "biodegradable": False,
        "fabric_category": "Synthetic Polymer",
    },
    "Wool": {
        "origin": "Natural",
        "breathability": "Good",
        "moisture_absorption": "High",
        "heat_resistance": "Low",
        "durability": "Good",
        "biodegradable": True,
        "fabric_category": "Natural Protein",
    },
    "Silk": {
        "origin": "Natural",
        "breathability": "Excellent",
        "moisture_absorption": "Moderate",
        "heat_resistance": "Low",
        "durability": "Delicate",
        "biodegradable": True,
        "fabric_category": "Natural Protein",
    },
    "Linen": {
        "origin": "Natural",
        "breathability": "Excellent",
        "moisture_absorption": "High",
        "heat_resistance": "Good",
        "durability": "Good",
        "biodegradable": True,
        "fabric_category": "Natural Cellulosic",
    },
    "Denim": {
        "origin": "Natural/Blend",
        "breathability": "Moderate",
        "moisture_absorption": "Moderate",
        "heat_resistance": "Good",
        "durability": "Excellent",
        "biodegradable": False,
        "fabric_category": "Woven Twill",
    },
    "Rayon": {
        "origin": "Semi-Synthetic",
        "breathability": "Good",
        "moisture_absorption": "High",
        "heat_resistance": "Low",
        "durability": "Moderate",
        "biodegradable": True,
        "fabric_category": "Regenerated Cellulosic",
    },
    "Nylon": {
        "origin": "Synthetic",
        "breathability": "Low",
        "moisture_absorption": "Low",
        "heat_resistance": "Moderate",
        "durability": "Excellent",
        "biodegradable": False,
        "fabric_category": "Synthetic Polyamide",
    },
    "Acrylic": {
        "origin": "Synthetic",
        "breathability": "Low",
        "moisture_absorption": "Very Low",
        "heat_resistance": "Low",
        "durability": "Good",
        "biodegradable": False,
        "fabric_category": "Synthetic Polymer",
    },
    "Mixed Fabric": {
        "origin": "Blended",
        "breathability": "Variable",
        "moisture_absorption": "Variable",
        "heat_resistance": "Variable",
        "durability": "Variable",
        "biodegradable": False,
        "fabric_category": "Blended Textile",
    },
}

FIBER_COMPOSITIONS = {
    "Cotton": {"Cotton": 95, "Elastane": 3, "Polyester": 2},
    "Polyester": {"Polyester": 92, "Nylon": 5, "Elastane": 3},
    "Wool": {"Wool": 88, "Nylon": 8, "Polyester": 4},
    "Silk": {"Silk": 97, "Polyester": 3},
    "Linen": {"Linen": 93, "Cotton": 7},
    "Denim": {"Cotton": 85, "Polyester": 12, "Elastane": 3},
    "Rayon": {"Rayon": 90, "Polyester": 7, "Elastane": 3},
    "Nylon": {"Nylon": 88, "Polyester": 9, "Elastane": 3},
    "Acrylic": {"Acrylic": 85, "Wool": 10, "Nylon": 5},
    "Mixed Fabric": {"Polyester": 45, "Cotton": 30, "Nylon": 15, "Elastane": 10},
}

TEXTURE_DESCRIPTIONS = {
    "Cotton": "Soft, plain-weave surface with fine, uniform grain",
    "Polyester": "Smooth, low-friction synthetic surface with sheen",
    "Wool": "Dense, fibrous surface with visible crimp and natural loft",
    "Silk": "Ultra-smooth, lustrous surface with triangular fiber cross-section",
    "Linen": "Slightly coarse, visible weave with natural slub irregularities",
    "Denim": "Tight twill weave with diagonal ribbing and indigo saturation",
    "Rayon": "Soft drape with slight sheen, semi-transparent weave",
    "Nylon": "Slick, uniform surface with high tensile structure",
    "Acrylic": "Synthetic fiber surface mimicking wool; low moisture",
    "Mixed Fabric": "Blended texture — varying surface characteristics detected",
}

# ─── Waste Classification Knowledge Base ─────────────────────────────────────

WASTE_CATEGORIES = [
    "Recyclable",
    "Reusable",
    "Repairable",
    "Upcyclable",
    "Compostable",
    "Hazardous Textile Waste",
]

MATERIAL_TO_WASTE_BIAS = {
    "Cotton": ["Compostable", "Reusable", "Recyclable"],
    "Polyester": ["Recyclable", "Upcyclable", "Hazardous Textile Waste"],
    "Wool": ["Reusable", "Compostable", "Repairable"],
    "Silk": ["Reusable", "Repairable", "Upcyclable"],
    "Linen": ["Compostable", "Reusable", "Recyclable"],
    "Denim": ["Upcyclable", "Repairable", "Recyclable"],
    "Rayon": ["Recyclable", "Compostable", "Upcyclable"],
    "Nylon": ["Recyclable", "Hazardous Textile Waste", "Upcyclable"],
    "Acrylic": ["Hazardous Textile Waste", "Recyclable", "Upcyclable"],
    "Mixed Fabric": ["Recyclable", "Upcyclable", "Hazardous Textile Waste"],
}

WASTE_REASONS = {
    "Recyclable": "Material composition supports mechanical or chemical recycling. Fiber recovery rate estimated at 78–92%.",
    "Reusable": "Structural integrity intact. Minimal wear detected. Suitable for direct donation or resale channels.",
    "Repairable": "Localized damage detected. Core fabric structure sound. Cost-effective repair recommended.",
    "Upcyclable": "Creative material repurposing applicable. Suitable for insulation fill, stuffing, or industrial rags.",
    "Compostable": "Natural fiber origin confirmed. Suitable for industrial composting under controlled temperature.",
    "Hazardous Textile Waste": "Synthetic chemical content detected. Requires specialized disposal protocol per environmental standards.",
}

SEVERITY_LEVELS = {
    "Recyclable": "Low",
    "Reusable": "Minimal",
    "Repairable": "Moderate",
    "Upcyclable": "Moderate",
    "Compostable": "Low",
    "Hazardous Textile Waste": "High",
}

MATERIAL_QUALITY_MAP = {
    "Recyclable": "Good",
    "Reusable": "Excellent",
    "Repairable": "Fair",
    "Upcyclable": "Fair",
    "Compostable": "Degraded",
    "Hazardous Textile Waste": "Poor",
}

# ─── Recyclability Assessment ─────────────────────────────────────────────────

RECYCLABILITY_SCORES = {
    "Cotton": (88, 95),
    "Polyester": (70, 82),
    "Wool": (85, 93),
    "Silk": (80, 90),
    "Linen": (87, 94),
    "Denim": (75, 88),
    "Rayon": (72, 84),
    "Nylon": (65, 78),
    "Acrylic": (45, 62),
    "Mixed Fabric": (55, 70),
}

RECOVERY_DIFFICULTY_MAP = {
    "Recyclable": "Easy",
    "Reusable": "Easy",
    "Repairable": "Medium",
    "Upcyclable": "Medium",
    "Compostable": "Easy",
    "Hazardous Textile Waste": "Hard",
}


class MockPredictor(BaseModelService):
    """
    Realistic mock predictor that produces deterministic, varied AI results
    based on image metadata (hash). Results feel authentic and AI-driven.

    Replace this class with a real model implementation in Milestone 3+.
    """

    def _get_seed(self, image_features: Dict[str, Any]) -> int:
        """Generate a deterministic seed from image metadata."""
        seed_input = str(image_features.get("file_hash", ""))
        seed_input += str(image_features.get("file_size", 0))
        seed_input += str(image_features.get("width", 0))
        return int(hashlib.md5(seed_input.encode()).hexdigest()[:8], 16)

    def predict_material(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        seed = self._get_seed(image_features)
        rng = random.Random(seed)

        # Pick primary material with weighted randomness
        primary_material = rng.choice(MATERIALS)

        # Generate confidence score (high confidence for realism)
        primary_confidence = round(rng.uniform(82.0, 97.5), 1)

        # Build probability distribution for all materials
        remaining = 100.0 - primary_confidence
        other_materials = [m for m in MATERIALS if m != primary_material]
        rng.shuffle(other_materials)

        probabilities = {primary_material: primary_confidence}
        for i, mat in enumerate(other_materials[:-1]):
            share = round(rng.uniform(0.1, remaining * 0.4), 1)
            probabilities[mat] = share
            remaining -= share
        probabilities[other_materials[-1]] = round(max(0.1, remaining), 1)

        # Get material properties
        props = MATERIAL_PROPERTIES.get(primary_material, {})
        fiber_comp = FIBER_COMPOSITIONS.get(primary_material, {})
        texture = TEXTURE_DESCRIPTIONS.get(primary_material, "")

        # Dominant color from image features
        colors = image_features.get("dominant_colors", [])
        detected_color = colors[0] if colors else "Unknown"

        return {
            "material": primary_material,
            "confidence": primary_confidence,
            "probabilities": probabilities,
            "fiber_composition": fiber_comp,
            "properties": props,
            "fabric_category": props.get("fabric_category", "Unknown"),
            "detected_color": detected_color,
            "texture_description": texture,
        }

    def classify_waste(self, material_prediction: Dict[str, Any], image_features: Dict[str, Any]) -> Dict[str, Any]:
        seed = self._get_seed(image_features) + 1  # Offset seed for variety
        rng = random.Random(seed)

        material = material_prediction.get("material", "Mixed Fabric")
        bias_categories = MATERIAL_TO_WASTE_BIAS.get(material, WASTE_CATEGORIES)

        # 70% chance of top biased category, 30% chance of random
        if rng.random() < 0.7:
            waste_category = bias_categories[0]
        else:
            waste_category = rng.choice(WASTE_CATEGORIES)

        confidence = round(rng.uniform(78.0, 95.0), 1)

        return {
            "waste_category": waste_category,
            "confidence": confidence,
            "reason": WASTE_REASONS.get(waste_category, ""),
            "material_quality": MATERIAL_QUALITY_MAP.get(waste_category, "Unknown"),
            "severity_level": SEVERITY_LEVELS.get(waste_category, "Unknown"),
            "description": f"{material} textile classified as {waste_category}. {WASTE_REASONS.get(waste_category, '')}",
            "status_badge": waste_category.upper().replace(" ", "_"),
        }

    def predict_recyclability(self, material_prediction: Dict[str, Any], waste_classification: Dict[str, Any]) -> Dict[str, Any]:
        material = material_prediction.get("material", "Mixed Fabric")
        waste_category = waste_classification.get("waste_category", "Recyclable")

        score_range = RECYCLABILITY_SCORES.get(material, (55, 75))
        recyclability_score = round(random.uniform(*score_range), 1)

        # Adjust for hazardous
        if waste_category == "Hazardous Textile Waste":
            recyclability_score = round(recyclability_score * 0.4, 1)

        reuse_potential = round(recyclability_score * random.uniform(0.85, 1.05), 1)
        reuse_potential = min(reuse_potential, 100.0)

        material_recovery_score = round(recyclability_score * random.uniform(0.9, 1.0), 1)
        recovery_difficulty = RECOVERY_DIFFICULTY_MAP.get(waste_category, "Medium")

        if recyclability_score >= 85:
            overall_rating = "Excellent"
        elif recyclability_score >= 70:
            overall_rating = "Good"
        elif recyclability_score >= 55:
            overall_rating = "Fair"
        else:
            overall_rating = "Poor"

        return {
            "recyclability_score": recyclability_score,
            "reuse_potential": reuse_potential,
            "recovery_difficulty": recovery_difficulty,
            "material_recovery_score": material_recovery_score,
            "overall_rating": overall_rating,
            "recovery_indicator": f"{recovery_difficulty} Recovery — {overall_rating} Rating",
        }
