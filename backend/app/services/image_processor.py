from cv2 import imread

from app.AI.predict import predict_image

from app.schemas.analysis_result import AnalysisResult

# --------------------------------------------------
# Image Analysis
# --------------------------------------------------

from app.services.color_detector import ColorDetector
from app.services.texture_detector import TextureDetector
from app.services.pattern_detector import PatternDetector
from app.services.defect_detector import DefectDetector
from app.services.contamination_detector import (
    ContaminationDetector,
)

# --------------------------------------------------
# AI Engines
# --------------------------------------------------

from app.services.material_classifier import (
    MaterialClassifier,
)

from app.services.waste_classifier import (
    WasteClassifier,
)

from app.services.scoring_engine import (
    ScoringEngine,
)

from app.services.environmental_engine import (
    EnvironmentalEngine,
)

from app.services.sustainability_engine import (
    SustainabilityEngine,
)

from app.services.recommendation_engine import (
    RecommendationEngine,
)


class ImageProcessor:
    """
    =========================================================

        Textile Waste Intelligence Platform

            AI Processing Pipeline

    Pipeline

    Upload Image
            ↓
    AI Material Prediction
            ↓
    Image Feature Detection
            ↓
    Material Classification
            ↓
    Waste Classification
            ↓
    Scoring Engine
            ↓
    Environmental Engine
            ↓
    Sustainability Engine
            ↓
    Recommendation Engine
            ↓
    Unified Analysis Result

    =========================================================
    """

    @staticmethod
    def analyze(
        image_path: str,
    ) -> AnalysisResult:

        image = imread(image_path)

        if image is None:

            raise ValueError(
                "Unable to read image."
            )

        # --------------------------------------------------
        # AI Prediction
        # --------------------------------------------------

        prediction = predict_image(
            image_path
        )

        best_prediction = prediction[
            "best_prediction"
        ]

        # --------------------------------------------------
        # Image Intelligence
        # --------------------------------------------------

        color_data = ColorDetector.detect(
            image
        )

        texture_data = TextureDetector.detect(
            image
        )

        pattern_data = PatternDetector.detect(
            image
        )

        defect_data = DefectDetector.detect(
            image
        )

        contamination_data = (
            ContaminationDetector.detect(
                image
            )
        )

        # --------------------------------------------------
        # Material Intelligence
        # --------------------------------------------------

        material = (
            MaterialClassifier.classify(
                best_prediction
            )
        )

        # --------------------------------------------------
        # Waste Intelligence
        # --------------------------------------------------

        waste = (
            WasteClassifier.classify(
                material,
                defect_data,
                contamination_data,
            )
        )

        # --------------------------------------------------
        # Scoring Engine
        # --------------------------------------------------

        scores = (
            ScoringEngine.calculate(
                material,
                waste,
            )
        )

        # --------------------------------------------------
        # Environmental Engine
        # --------------------------------------------------

        environmental = (
            EnvironmentalEngine.calculate(
                material,
                waste,
                scores,
            )
        )

        # --------------------------------------------------
        # Sustainability Engine
        # --------------------------------------------------

        sustainability = (
            SustainabilityEngine.calculate(
                environmental,
                scores,
            )
        )

        # --------------------------------------------------
        # Recommendation Engine
        # --------------------------------------------------

        recommendation = (
            RecommendationEngine.generate(
                material,
                waste,
                scores,
                sustainability,
            )
        )

        # --------------------------------------------------
        # Unified Analysis Result
        # --------------------------------------------------

        return AnalysisResult(

            # ==================================================
            # AI Prediction
            # ==================================================

            material=material[
                "primary_material"
            ],

            confidence=best_prediction[
                "confidence"
            ],

            top_predictions=prediction[
                "top_predictions"
            ],

            # ==================================================
            # Material Intelligence
            # ==================================================

            primary_material=material[
                "primary_material"
            ],

            secondary_material=material[
                "secondary_material"
            ],

            composition=material[
                "composition"
            ],

            material_category=material[
                "material_category"
            ],

            material_quality=material[
                "material_quality"
            ],

            biodegradable=material[
                "biodegradable"
            ],

            recyclable=material[
                "recyclable"
            ],

            recycled_content=material[
                "recycled_content"
            ],

            # ==================================================
            # Image Intelligence
            # ==================================================

            dominant_color=color_data[
                "dominant_color"
            ],

            color_palette=color_data[
                "color_palette"
            ],

            texture=texture_data[
                "texture"
            ],

            pattern=pattern_data[
                "pattern"
            ],

            defects=defect_data[
                "defects"
            ],

            contamination_level=(
                contamination_data[
                    "contamination_level"
                ]
            ),

            # ==================================================
            # Waste Intelligence
            # ==================================================

            waste_category=waste[
                "waste_category"
            ],

            waste_subcategory=waste[
                "waste_subcategory"
            ],

            reuse_potential=waste[
                "reuse_potential"
            ],

            recycling_method=waste[
                "recycling_method"
            ],

            # ==================================================
            # Scoring Engine
            # ==================================================

            recyclability_score=scores[
                "recyclability_score"
            ],

            reuse_score=scores[
                "reuse_score"
            ],

            material_recovery_score=scores[
                "material_recovery_score"
            ],

            circularity_score=scores[
                "circularity_score"
            ],

            sustainability_score=scores[
                "sustainability_score"
            ],

            environmental_score=scores[
                "environmental_score"
            ],

            overall_score=scores[
                "overall_score"
            ],

            # ==================================================
            # Environmental Intelligence
            # ==================================================

            carbon_footprint=environmental[
                "carbon_footprint"
            ],

            carbon_savings=environmental[
                "carbon_savings"
            ],

            water_consumption=environmental[
                "water_consumption"
            ],

            water_savings=environmental[
                "water_savings"
            ],

            energy_consumption=environmental[
                "energy_consumption"
            ],

            energy_savings=environmental[
                "energy_savings"
            ],

            landfill_diversion=environmental[
                "landfill_diversion"
            ],

            resource_conservation=environmental[
                "resource_conservation"
            ],

            # ==================================================
            # Sustainability Intelligence
            # ==================================================

            sustainability_rating=sustainability[
                "sustainability_rating"
            ],

            sustainability_status=sustainability[
                "sustainability_status"
            ],

            circular_economy_index=sustainability[
                "circular_economy_index"
            ],

            recycling_target=sustainability[
                "recycling_target"
            ],

            recycling_progress=sustainability[
                "recycling_progress"
            ],

            environmental_impact=sustainability[
                "environmental_impact"
            ],

            esg_score=sustainability[
                "esg_score"
            ],

            esg_readiness=sustainability[
                "esg_readiness"
            ],

            # ==================================================
            # Recommendation Intelligence
            # ==================================================

            priority=recommendation[
                "priority"
            ],

            recommendation=recommendation[
                "recommendation"
            ],

            next_step=recommendation[
                "next_step"
            ],

            expected_benefit=recommendation[
                "expected_benefit"
            ],

        )