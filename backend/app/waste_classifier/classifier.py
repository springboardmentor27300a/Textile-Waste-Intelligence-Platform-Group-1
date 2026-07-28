"""
Waste Classifier
=================
Provides the waste classification service interface.
Delegates to the inference service for actual predictions.
"""

import logging
from typing import Dict, Any

from app.ai.inference_service import inference_service

logger = logging.getLogger(__name__)


class WasteClassifier:
    """Waste classification service — delegates to InferenceService."""

    def classify(self, material_prediction: Dict[str, Any], image_features: Dict[str, Any]) -> Dict[str, Any]:
        """Classify the waste type from material prediction and image features."""
        logger.info("WasteClassifier: running classification")
        return inference_service.classify_waste_only(material_prediction, image_features)
