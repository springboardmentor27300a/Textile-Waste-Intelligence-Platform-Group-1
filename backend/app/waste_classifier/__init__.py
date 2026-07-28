"""
WeaveCycle Waste Classifier Module
=====================================
Classifies textile waste into actionable categories.
Supports: Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous Textile Waste
"""

from app.waste_classifier.classifier import WasteClassifier

__all__ = ["WasteClassifier"]
