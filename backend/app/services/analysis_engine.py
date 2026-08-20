from app.services.material_classifier import MaterialClassifier
from app.services.waste_classifier import WasteClassifier

from app.services.scoring_engine import ScoringEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.environmental_engine import EnvironmentalEngine
from app.services.sustainability_engine import SustainabilityEngine


class AnalysisEngine:
    """
    ==========================================================
    Textile Waste Intelligence Platform

    Central Analysis Engine

    Responsible for coordinating every analysis module.

    Pipeline

    Material
        ↓
    Waste
        ↓
    Scores
        ↓
    Recommendation
        ↓
    Environmental
        ↓
    Sustainability

    ==========================================================
    """

    @staticmethod
    def analyze(
        prediction: dict,
        visual_analysis: dict,
    ):

        # ---------------------------------------
        # Material Analysis
        # ---------------------------------------

        material = MaterialClassifier.classify(
            prediction
        )

        # ---------------------------------------
        # Waste Analysis
        # ---------------------------------------

        waste = WasteClassifier.classify(
            material,
            visual_analysis["defects"],
            visual_analysis["contamination"],
        )

        # ---------------------------------------
        # Scoring
        # ---------------------------------------

        scores = ScoringEngine.calculate(
            material,
            waste,
        )

        # ---------------------------------------
        # Environmental Impact
        # ---------------------------------------

        environmental = EnvironmentalEngine.calculate(
            {
                "material": prediction["material"],
                **material,
            },
            waste,
            scores,
        )

        # ---------------------------------------
        # Sustainability Intelligence
        # ---------------------------------------

        sustainability = SustainabilityEngine.calculate(
            environmental,
            scores,
        )

        # ---------------------------------------
        # Recommendation Intelligence
        # ---------------------------------------

        recommendation = RecommendationEngine.generate(
            {
                "material": prediction["material"],
                **material,
            },
            waste,
            scores,
            sustainability,
        )

        # ---------------------------------------
        # Final Response
        # ---------------------------------------

        return {

            "prediction": prediction,

            "material_analysis": material,

            "visual_analysis": visual_analysis,

            "waste_analysis": waste,

            "scores": scores,

            "recommendation": recommendation,

            "environmental_analysis": environmental,

            "sustainability_analysis": sustainability,

        }