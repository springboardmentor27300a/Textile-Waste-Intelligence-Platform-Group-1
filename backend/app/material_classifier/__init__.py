"""
WeaveCycle Material Classifier Module
======================================
Identifies textile material type from image features.
Supports: Cotton, Polyester, Wool, Silk, Linen, Denim, Rayon, Nylon, Acrylic, Mixed Fabric
"""

from app.material_classifier.classifier import MaterialClassifier

__all__ = ["MaterialClassifier"]
