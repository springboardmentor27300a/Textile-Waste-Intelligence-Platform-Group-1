"""
Model Service — Abstract Interface
====================================
Defines the contract that any AI model (mock, TensorFlow, PyTorch,
YOLOv8, EfficientNet, Vision Transformer) must satisfy.

To replace the mock with a real model:
1. Create a new class implementing BaseModelService
2. Update inference_service.py to instantiate the new class
3. No changes required in routes, schemas, or frontend.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseModelService(ABC):
    """
    Abstract base class for all AI model services.
    All prediction engines must implement this interface.
    """

    @abstractmethod
    def predict_material(self, image_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Given extracted image features, predict the textile material type.

        Returns:
            {
                "material": str,
                "confidence": float,          # 0-100
                "probabilities": dict,        # { material_name: confidence }
                "fiber_composition": dict,    # { fiber_name: percentage }
                "properties": dict,           # material properties
                "fabric_category": str,
                "detected_color": str,
                "texture_description": str
            }
        """
        pass

    @abstractmethod
    def classify_waste(self, material_prediction: Dict[str, Any], image_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Given material prediction and image features, classify the waste type.

        Returns:
            {
                "waste_category": str,
                "confidence": float,
                "reason": str,
                "material_quality": str,
                "severity_level": str,
                "description": str,
                "status_badge": str
            }
        """
        pass

    @abstractmethod
    def predict_recyclability(self, material_prediction: Dict[str, Any], waste_classification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate recyclability assessment from material and waste data.

        Returns:
            {
                "recyclability_score": float,  # 0-100
                "reuse_potential": float,
                "recovery_difficulty": str,    # Easy / Medium / Hard
                "material_recovery_score": float,
                "overall_rating": str,
                "recovery_indicator": str
            }
        """
        pass
