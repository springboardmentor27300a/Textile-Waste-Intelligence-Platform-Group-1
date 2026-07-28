"""
Material Classifier
====================
Provides the material classification service interface.
Delegates to the inference service for actual predictions.
"""

import logging
from typing import Dict, Any

from app.ai.inference_service import inference_service

logger = logging.getLogger(__name__)


class MaterialClassifier:
    """Material classification service — delegates to InferenceService."""

    def predict(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        """Classify the textile material from image features."""
        logger.info("MaterialClassifier: running prediction")
        return inference_service.predict_material_only(image_features)
