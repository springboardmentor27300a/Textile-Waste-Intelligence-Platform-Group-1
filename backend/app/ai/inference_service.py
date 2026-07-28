"""
Inference Service — Full Pipeline Orchestrator
================================================
Orchestrates the complete AI prediction pipeline:
Image Features → Material Classification → Waste Classification → Recyclability Assessment

Uses MockPredictor in Milestone 2.
Swap MockPredictor for a real model in Milestone 3+ without changing this file.
"""

import logging
from typing import Dict, Any

from app.ai.mock_predictor import MockPredictor

logger = logging.getLogger(__name__)


class InferenceService:
    """
    Central orchestrator for the AI prediction pipeline.
    Coordinates material classification, waste classification,
    and recyclability assessment into a single cohesive result.
    """

    def __init__(self):
        # ──────────────────────────────────────────────────────────────────
        # MILESTONE 3+ SWAP POINT:
        # Replace MockPredictor with your trained model:
        #   from app.ai.efficientnet_predictor import EfficientNetPredictor
        #   self.model = EfficientNetPredictor()
        # ──────────────────────────────────────────────────────────────────
        self.model = MockPredictor()
        logger.info("InferenceService initialized with MockPredictor")

    def run_full_pipeline(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the complete AI analysis pipeline on extracted image features.

        Args:
            image_features: Output from ImageProcessor.extract_features()

        Returns:
            Complete prediction result dict with material, waste, and recyclability data.
        """
        logger.info(f"Running full AI pipeline for image: {image_features.get('filename', 'unknown')}")

        # Step 1: Material Classification
        material_result = self.model.predict_material(image_features)
        logger.info(f"Material classified: {material_result['material']} ({material_result['confidence']}%)")

        # Step 2: Waste Classification
        waste_result = self.model.classify_waste(material_result, image_features)
        logger.info(f"Waste classified: {waste_result['waste_category']} ({waste_result['confidence']}%)")

        # Step 3: Recyclability Assessment
        recyclability_result = self.model.predict_recyclability(material_result, waste_result)
        logger.info(f"Recyclability score: {recyclability_result['recyclability_score']}%")

        # Compose unified response
        combined_confidence = round(
            (material_result["confidence"] * 0.5 + waste_result["confidence"] * 0.5), 1
        )

        return {
            # Top-level summary
            "material": material_result["material"],
            "confidence": material_result["confidence"],
            "waste_category": waste_result["waste_category"],
            "recyclability": recyclability_result["recyclability_score"],
            "recovery": recyclability_result["recovery_difficulty"],
            "status": "Success",
            "overall_confidence": combined_confidence,

            # Material Classification Details
            "material_details": material_result,

            # Waste Classification Details
            "waste_details": waste_result,

            # Recyclability Assessment Details
            "recyclability_details": recyclability_result,

            # Image features used
            "image_features": {
                "dominant_colors": image_features.get("dominant_colors", []),
                "texture_complexity": image_features.get("texture_complexity", "Unknown"),
                "fabric_pattern": image_features.get("fabric_pattern", "Unknown"),
                "visible_damage": image_features.get("visible_damage", False),
                "contamination_detected": image_features.get("contamination_detected", False),
                "wrinkle_detected": image_features.get("wrinkle_detected", False),
                "tear_detected": image_features.get("tear_detected", False),
                "surface_quality": image_features.get("surface_quality", "Good"),
                "brightness": image_features.get("brightness", 0),
                "contrast": image_features.get("contrast", 0),
            }
        }

    def predict_material_only(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        """Run material classification only."""
        return self.model.predict_material(image_features)

    def classify_waste_only(self, material_prediction: Dict[str, Any], image_features: Dict[str, Any]) -> Dict[str, Any]:
        """Run waste classification only."""
        return self.model.classify_waste(material_prediction, image_features)

    def predict_recyclability_only(self, material_prediction: Dict[str, Any], waste_classification: Dict[str, Any]) -> Dict[str, Any]:
        """Run recyclability assessment only."""
        return self.model.predict_recyclability(material_prediction, waste_classification)


# Singleton instance
inference_service = InferenceService()
