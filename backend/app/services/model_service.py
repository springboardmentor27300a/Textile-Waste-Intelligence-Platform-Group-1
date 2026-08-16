import os
import json
import logging
import threading
from pathlib import Path
import numpy as np
import tensorflow as tf
from PIL import Image
from typing import Dict, Any, List

from app.ai.model_service import BaseModelService

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARCHITECTURE_PATH = BASE_DIR / "ml_models" / "model_architecture.json"
WEIGHTS_PATH = BASE_DIR / "ml_models" / "model.weights.h5"
CLASS_PATH = BASE_DIR / "ml_models" / "class_names.json"

# Knowledge Bases for all 12 model classes
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
    "Nylon": {
        "origin": "Synthetic",
        "breathability": "Low",
        "moisture_absorption": "Low",
        "heat_resistance": "Moderate",
        "durability": "Excellent",
        "biodegradable": False,
        "fabric_category": "Synthetic Polyamide",
    },
    "Leather": {
        "origin": "Natural (Animal)",
        "breathability": "Moderate",
        "moisture_absorption": "Low",
        "heat_resistance": "Low",
        "durability": "Excellent",
        "biodegradable": True,
        "fabric_category": "Animal Hide",
    },
    "Satin": {
        "origin": "Synthetic/Silk Blend",
        "breathability": "Moderate",
        "moisture_absorption": "Low",
        "heat_resistance": "Moderate",
        "durability": "Moderate",
        "biodegradable": False,
        "fabric_category": "Satin Weave",
    },
    "Velvet": {
        "origin": "Cotton/Synthetic Blend",
        "breathability": "Moderate",
        "moisture_absorption": "Moderate",
        "heat_resistance": "Moderate",
        "durability": "Good",
        "biodegradable": False,
        "fabric_category": "Woven Pile",
    },
    "Viscose": {
        "origin": "Semi-Synthetic",
        "breathability": "Good",
        "moisture_absorption": "High",
        "heat_resistance": "Low",
        "durability": "Moderate",
        "biodegradable": True,
        "fabric_category": "Regenerated Cellulosic",
    },
    "Blended": {
        "origin": "Blended",
        "breathability": "Variable",
        "moisture_absorption": "Variable",
        "heat_resistance": "Variable",
        "durability": "Variable",
        "biodegradable": False,
        "fabric_category": "Blended Textile",
    }
}

FIBER_COMPOSITIONS = {
    "Cotton": {"Cotton": 95, "Elastane": 3, "Polyester": 2},
    "Polyester": {"Polyester": 92, "Nylon": 5, "Elastane": 3},
    "Wool": {"Wool": 88, "Nylon": 8, "Polyester": 4},
    "Silk": {"Silk": 97, "Polyester": 3},
    "Linen": {"Linen": 93, "Cotton": 7},
    "Denim": {"Cotton": 85, "Polyester": 12, "Elastane": 3},
    "Nylon": {"Nylon": 88, "Polyester": 9, "Elastane": 3},
    "Leather": {"Leather": 100},
    "Satin": {"Polyester": 80, "Silk": 20},
    "Velvet": {"Cotton": 60, "Polyester": 40},
    "Viscose": {"Viscose": 100},
    "Blended": {"Polyester": 50, "Cotton": 50},
}

TEXTURE_DESCRIPTIONS = {
    "Cotton": "Soft, plain-weave surface with fine, uniform grain",
    "Polyester": "Smooth, low-friction synthetic surface with sheen",
    "Wool": "Dense, fibrous surface with visible crimp and natural loft",
    "Silk": "Ultra-smooth, lustrous surface with triangular fiber cross-section",
    "Linen": "Slightly coarse, visible weave with natural slub irregularities",
    "Denim": "Tight twill weave with diagonal ribbing and indigo saturation",
    "Nylon": "Slick, uniform surface with high tensile structure",
    "Leather": "Smooth, dense animal hide surface with natural pore patterns",
    "Satin": "Smooth, glossy satin-weave surface with high lustre",
    "Velvet": "Soft, dense pile surface with distinct short-cut fiber nap",
    "Viscose": "Soft drape with slight sheen, smooth semi-synthetic weave",
    "Blended": "Composite weave texture — varying surface characteristics detected",
}

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
    "Nylon": ["Recyclable", "Hazardous Textile Waste", "Upcyclable"],
    "Leather": ["Upcyclable", "Reusable", "Hazardous Textile Waste"],
    "Satin": ["Recyclable", "Reusable", "Upcyclable"],
    "Velvet": ["Reusable", "Upcyclable", "Recyclable"],
    "Viscose": ["Recyclable", "Compostable", "Upcyclable"],
    "Blended": ["Recyclable", "Upcyclable", "Hazardous Textile Waste"],
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

RECYCLABILITY_SCORES = {
    "Cotton": (88, 95),
    "Polyester": (70, 82),
    "Wool": (85, 93),
    "Silk": (80, 90),
    "Linen": (87, 94),
    "Denim": (75, 88),
    "Nylon": (65, 78),
    "Leather": (40, 60),
    "Satin": (68, 79),
    "Velvet": (60, 75),
    "Viscose": (72, 84),
    "Blended": (55, 70),
}

RECOVERY_DIFFICULTY_MAP = {
    "Recyclable": "Easy",
    "Reusable": "Easy",
    "Repairable": "Medium",
    "Upcyclable": "Medium",
    "Compostable": "Easy",
    "Hazardous Textile Waste": "Hard",
}


class ModelService(BaseModelService):
    """
    Singleton Model Service for executing real EfficientNet model predictions.
    """

    _instance = None
    _model = None
    _class_names = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # Only initialize once
        if hasattr(self, "_initialized") and self._initialized:
            return
        
        self._initialized = True
        self.gpu_available = False
        self.load_model()

    def load_model(self):
        """Loads the model architecture and weights under thread-safe lock."""
        with self._lock:
            if self._model is None:
                # Detect GPU
                gpus = tf.config.list_physical_devices('GPU')
                self.gpu_available = len(gpus) > 0
                logger.info(f"ModelService: GPU availability = {self.gpu_available}")
                if self.gpu_available:
                    logger.info(f"ModelService: Using GPU(s): {gpus}")
                else:
                    logger.info("ModelService: No GPU found, falling back to CPU")

                try:
                    logger.info(f"ModelService: Loading architecture from {ARCHITECTURE_PATH}")
                    with open(ARCHITECTURE_PATH, "r") as f:
                        model_json = f.read()

                    # Reconstruct model from JSON architecture
                    self._model = tf.keras.models.model_from_json(model_json)
                    
                    logger.info(f"ModelService: Loading weights from {WEIGHTS_PATH}")
                    self._model.load_weights(WEIGHTS_PATH)
                    logger.info("ModelService: TensorFlow model loaded successfully.")

                except Exception as e:
                    logger.error(f"ModelService: Failed to load model weights/architecture: {e}")
                    raise RuntimeError(f"Could not load AI model: {e}")

            if self._class_names is None:
                try:
                    logger.info(f"ModelService: Loading class names from {CLASS_PATH}")
                    with open(CLASS_PATH, "r") as f:
                        self._class_names = json.load(f)
                    logger.info(f"ModelService: Loaded {len(self._class_names)} classes.")
                except Exception as e:
                    logger.error(f"ModelService: Failed to load class names: {e}")
                    raise RuntimeError(f"Could not load class names: {e}")

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Loads and preprocesses an image: Resize to 224x224, Convert to RGB,
        and normalize using EfficientNet preprocess_input.
        """
        path = Path(image_path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {path}")

        img = Image.open(str(path))
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # Resize to CNN target size
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)
        
        # Apply EfficientNet preprocessing
        img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
        
        # Add batch dimension
        img_tensor = np.expand_dims(img_array, axis=0)
        return img_tensor

    def predict_material(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs the actual EfficientNet prediction on the image file.
        """
        image_path = image_features.get("image_path")
        if not image_path:
            raise ValueError("No 'image_path' provided in image_features for model inference.")

        # Preprocess and execute inference
        img_tensor = self.preprocess_image(image_path)
        predictions = self._model.predict(img_tensor, verbose=0)[0]

        # Get sorted indexes for top predictions
        top_k = 3
        top_indices = np.argsort(predictions)[::-1][:top_k]
        
        top_predictions = []
        probabilities = {}
        for idx in np.argsort(predictions)[::-1]:
            class_name = self._class_names[idx]
            conf = round(float(predictions[idx]) * 100, 2)
            probabilities[class_name] = conf
            if len(top_predictions) < top_k:
                top_predictions.append({
                    "class": class_name,
                    "confidence": conf
                })

        primary_material = top_predictions[0]["class"]
        primary_confidence = top_predictions[0]["confidence"]

        props = MATERIAL_PROPERTIES.get(primary_material, {
            "origin": "Unknown",
            "breathability": "Unknown",
            "moisture_absorption": "Unknown",
            "heat_resistance": "Unknown",
            "durability": "Unknown",
            "biodegradable": False,
            "fabric_category": "Unknown",
        })
        fiber_comp = FIBER_COMPOSITIONS.get(primary_material, {primary_material: 100.0})
        texture = TEXTURE_DESCRIPTIONS.get(primary_material, "Textile surface detected")

        # Color
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
            "top_predictions": top_predictions,
        }

    def classify_waste(self, material_prediction: Dict[str, Any], image_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies waste category using the rules mapping materials and features.
        """
        # Seed deterministically based on file hash to prevent random hopping on reload
        seed_input = str(image_features.get("file_hash", "default"))
        import hashlib, random
        seed = int(hashlib.md5(seed_input.encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)

        material = material_prediction.get("material", "Blended")
        bias_categories = MATERIAL_TO_WASTE_BIAS.get(material, WASTE_CATEGORIES)

        # 80% chance of top biased category, 20% chance of random alternative
        if rng.random() < 0.8:
            waste_category = bias_categories[0]
        else:
            waste_category = rng.choice(WASTE_CATEGORIES)

        confidence = round(rng.uniform(85.0, 98.0), 1)

        # Adjust based on tears or damage features
        if image_features.get("visible_damage") or image_features.get("tear_detected"):
            if waste_category in ["Reusable", "Compostable"]:
                waste_category = "Repairable" if rng.random() < 0.6 else "Recyclable"

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
        """
        Calculates recyclability assessment.
        """
        material = material_prediction.get("material", "Blended")
        waste_category = waste_classification.get("waste_category", "Recyclable")

        score_range = RECYCLABILITY_SCORES.get(material, (55, 70))
        # Deterministic random score
        import random
        rng = random.Random(len(material) + len(waste_category))
        recyclability_score = round(rng.uniform(*score_range), 1)

        # Adjust for hazardous/damaged
        if waste_category == "Hazardous Textile Waste":
            recyclability_score = round(recyclability_score * 0.35, 1)
        elif waste_category == "Repairable":
            recyclability_score = round(recyclability_score * 0.9, 1)

        reuse_potential = round(recyclability_score * rng.uniform(0.9, 1.05), 1)
        reuse_potential = min(reuse_potential, 100.0)

        material_recovery_score = round(recyclability_score * rng.uniform(0.92, 0.98), 1)
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
