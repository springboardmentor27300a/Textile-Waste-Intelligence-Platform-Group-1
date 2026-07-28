"""
WeaveCycle AI Module
====================
Central AI registry for the Textile Recognition and Waste Classification engine.

Architecture is designed to allow replacing mock predictors with real
TensorFlow / PyTorch / YOLOv8 / EfficientNet / Vision Transformer models
without modifying any API contracts or frontend code.
"""

from app.ai.inference_service import InferenceService

__all__ = ["InferenceService"]
