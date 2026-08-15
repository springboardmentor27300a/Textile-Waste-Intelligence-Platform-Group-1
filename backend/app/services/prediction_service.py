import os

from sqlalchemy.orm import Session

from app.ai.image_analysis import ImageAnalysisEngine
from app.ai.material_classifier import MaterialClassifier
from app.ai.recommendation import RecommendationEngine

from app.models import Prediction


class PredictionService:
    """
    Main AI Prediction Service

    Responsibilities:
    -----------------
    1. Analyze uploaded image
    2. Predict textile material
    3. Generate recommendation
    4. Save prediction to database
    """

    def __init__(self):

        self.image_engine = ImageAnalysisEngine()

        self.material_classifier = MaterialClassifier()

        self.recommendation_engine = RecommendationEngine()

    def predict(
        self,
        image_path: str,
        db: Session = None,
        user_id: int = None,
    ):

        # =====================================
        # Step 1 : Image Analysis
        # =====================================

        image_info = self.image_engine.analyze(image_path)

        # =====================================
        # Step 2 : Material Classification
        # =====================================

        material_result = self.material_classifier.classify(
            image_path
        )

        material = material_result["material"]

        # =====================================
        # Step 3 : Recommendation
        # =====================================

        if material == "Not enough textile evidence":
            recommendation = {
                "material": material,
                "waste_category": "Needs review",
                "reuse_potential": "Not enough textile evidence",
                "disposal_method": "Manual inspection required",
                "contamination_detection": "Unable to assess",
                "reuse_opportunity": "Upload a clearer textile image for analysis",
                "recycling_strategy": "Manual review before recycling",
                "upcycling_suggestion": "Reassess with a textile-focused photo",
                "material_recovery_recommendation": "No recovery recommendation available for this input",
                "waste_reduction_strategy": "Improve image quality and upload a textile sample",
                "recycling_options": ["Manual Review"],
                "recyclability_score": 0,
                "recyclability_level": "Needs review",
                "recommendation": "The upload does not show enough textile structure for a reliable classification.",
                "estimated_carbon_saving_kg": 0.0,
                "estimated_water_saving_liters": 0.0,
                "estimated_energy_saving_kwh": 0.0,
                "landfill_diverted_kg": 0.0,
                "circularity_score": 0.0,
                "circularity_category": "Disposal Recommended",
                "sustainability_score": 0.0,
                "material_recovery_score": 0.0,
                "reuse_score": 0.0,
                "environmental_benefit_score": 0.0,
                "processing_feasibility_score": 0.0,
                "sustainability_priority": "Low",
                "environmental_impact_summary": "No environmental benefit estimate is available for this non-textile input.",
                "milestone_2_summary": "The image did not contain enough textile evidence to support a reliable classification. Please upload a clearer textile photo.",
                "milestone_3_summary": "No sustainability impact estimate is available for this non-textile input. Manual review is recommended before any recovery or recycling decision.",
                "recovery_priority": "Manual review required",
                "sustainability_priority": "Low",
                "environmental_impact_summary": "No environmental benefit estimate is available for this non-textile input.",
                "recovery_opportunity": "The input should be reviewed manually before any circularity or recovery decisions are made.",
            }
        else:
            recommendation = self.recommendation_engine.generate(
                material,
                confidence=material_result.get("confidence"),
                confidence_level=material_result.get("confidence_level"),
                requires_manual_verification=material_result.get("requires_manual_verification", False),
            )

        # =====================================
        # Step 4 : Save Prediction (Optional)
        # =====================================

        if db is not None:

            prediction = Prediction(

                image_name=os.path.basename(image_path),

                image_path=image_path,

                material=material_result["material"],

                confidence=material_result["confidence"],

                waste_category=recommendation["waste_category"],

                reuse_potential=recommendation["reuse_potential"],

                disposal_method=recommendation["disposal_method"],

                recyclability_score=recommendation[
                    "recyclability_score"
                ],

                recyclability_level=recommendation[
                    "recyclability_level"
                ],

                recommendation=recommendation[
                    "recommendation"
                ],

                estimated_carbon_saving_kg=recommendation[
                    "estimated_carbon_saving_kg"
                ],

                estimated_water_saving_liters=recommendation[
                    "estimated_water_saving_liters"
                ],

                circularity_score=recommendation.get("circularity_score", 0.0),

                circularity_category=recommendation.get("circularity_category", "Disposal Recommended"),

                sustainability_score=recommendation.get("sustainability_score", 0.0),

                material_recovery_score=recommendation.get("material_recovery_score", 0.0),

                reuse_score=recommendation.get("reuse_score", 0.0),

                environmental_benefit_score=recommendation.get("environmental_benefit_score", 0.0),

                processing_feasibility_score=recommendation.get("processing_feasibility_score", 0.0),

                estimated_energy_saving_kwh=recommendation.get("estimated_energy_saving_kwh", 0.0),

                landfill_diverted_kg=recommendation.get("landfill_diverted_kg", 0.0),

                user_id=user_id,

            )

            db.add(prediction)

            db.commit()

            db.refresh(prediction)

        # =====================================
        # Final Response
        # =====================================

        return {
            "image_analysis": image_info,
            "material_prediction": material_result,
            "recommendation": recommendation,
        }


# =====================================================
# Testing
# =====================================================

if __name__ == "__main__":

    service = PredictionService()

    result = service.predict(

        image_path="data/TFD/001/001-001.png"

    )

    from pprint import pprint

    pprint(result)