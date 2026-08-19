# # from app.ml.preprocessing import preprocess_image
# # from app.ml.predictor import predictor
# # from app.ml.recommendation_engine import generate_recommendations
# # from app.ml.impact_engine import estimate_environmental_impact


# # def analyze_image(image_path: str, quantity_kg: float):

# #     # Step 1
# #     image_tensor = preprocess_image(image_path)

# #     # Step 2
# #     prediction = predictor.predict(image_tensor)

# #     # Step 3
# #     recommendations = generate_recommendations(
# #         prediction.predicted_material
# #     )

# #     # Step 4
# #     impact = estimate_environmental_impact(
# #         prediction.predicted_material,
# #         quantity_kg,
# #     )

# #     return {
# #         "prediction": prediction,
# #         "recommendations": recommendations,
# #         "impact": impact,
# #     }


# from sqlalchemy.orm import Session
# from sqlalchemy import select

# # from app.models import WasteBatch, WasteImage
# from app.models import (
#     WasteBatch,
#     WasteImage,
#     Classification,
#     WasteScore,
#     Recommendation,
#     ImpactEstimate,
# )
# from decimal import Decimal

# from app.ml.preprocessing import preprocess_image
# from app.ml.predictor import predictor
# from app.ml.recommendation_engine import generate_recommendations
# from app.ml.impact_engine import estimate_environmental_impact
# # from backend.app.models.classification import Classification


# def analyze_batch(
#     db: Session,
#     current_user,
#     batch_id: int,
# ):

#     batch = db.scalar(
#         select(WasteBatch).where(
#             WasteBatch.id == batch_id
#         )
#     )

#     if batch is None:
#         raise Exception("Batch not found")

#     image = db.scalar(
#         select(WasteImage).where(
#             WasteImage.batch_id == batch.id,
#             WasteImage.is_primary == True,
#         )
#     )

#     if image is None:
#         raise Exception("Image not found")

#     tensor = preprocess_image(
#         image.file_path
#     )

#     prediction = predictor.predict(
#         tensor
#     )

#     from app.models import Classification

#     classification = Classification(
#     batch_id=batch.id,
#     image_id=image.id,
#     predicted_material=prediction.predicted_material,
#     confidence_score=prediction.confidence_score,
#     alternative_predictions=prediction.alternative_predictions,
#     predicted_condition=prediction.predicted_condition,
#     condition_confidence=prediction.condition_confidence,
#     model_name="Demo Predictor",
#     model_version="1.0",
#     )

#     db.add(classification)
#     db.commit()
#     db.refresh(classification)

#     recommendations = generate_recommendations(
#         prediction.predicted_material
#     )

#     score = WasteScore(
#     classification_id=classification.id,
#     recyclability_score=Decimal("90"),
#     condition_score=Decimal("85"),
#     reuse_potential_score=Decimal("88"),
#     environmental_benefit_score=Decimal("92"),
#     processing_feasibility_score=Decimal("87"),
#     circularity_score=Decimal("89"),
#     waste_category=prediction.predicted_material,
# )

#     db.add(score)

#     impact = estimate_environmental_impact(
#         prediction.predicted_material,
#         float(batch.quantity_kg),
#     )

#     # for rec in recommendations:

#     #     recommendation = Recommendation(
#     #     classification_id=classification.id,
#     #     action=rec["action"],
#     #     rank=rec["rank"],
#     #     suitability_score=Decimal(str(rec["score"])),
#     #     reason=rec["reason"],
#     #     is_primary=rec["primary"],
#     # )


#     # db.add(recommendation)
#     for rec in recommendations:

#         recommendation = Recommendation(
#         classification_id=classification.id,
#         action=rec["action"],
#         rank=rec["rank"],
#         suitability_score=Decimal(str(rec["score"])),
#         reason=rec["reason"],
#         is_primary=rec["primary"],
#     )

#     db.add(recommendation)

#     impact_row = ImpactEstimate(
#     classification_id=classification.id,
#     co2_avoided_kg=Decimal(str(impact["co2_avoided_kg"])),
#     water_saved_liters=Decimal(str(impact["water_saved_liters"])),
#     landfill_avoided_kg=Decimal(str(impact["landfill_avoided_kg"])),
#     material_recovered_kg=Decimal(str(impact["material_recovered_kg"])),
#     diversion_percentage=Decimal(str(impact["diversion_percentage"])),
# )

#     db.add(impact_row)

#     # return {
#     #     "batch": batch.batch_code,
#     #     "prediction": prediction,
#     #     "recommendations": recommendations,
#     #     "impact": impact,
#     # }
#     batch.processing_status = "ANALYZED"

#     db.commit()
    
#     return {
#     "message": "Analysis completed successfully",
#     "classification_id": classification.id,
#     "material": prediction.predicted_material,
#     "confidence": prediction.confidence_score,
#     "condition": prediction.predicted_condition,
# }




from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    WasteBatch,
    WasteImage,
    Classification,
    WasteScore,
    Recommendation,
    ImpactEstimate,
)

from app.ml.preprocessing import preprocess_image
from app.ml.predictor import predictor
from app.ml.recommendation_engine import generate_recommendations
from app.ml.impact_engine import estimate_environmental_impact


def analyze_batch(
    db: Session,
    current_user,
    batch_id: int,
):
    # ---------------------------------------------------------
    # 1. Find waste batch
    # ---------------------------------------------------------

    batch = db.scalar(
        select(WasteBatch).where(
            WasteBatch.id == batch_id
        )
    )

    if batch is None:
        raise Exception("Batch not found")

    # ---------------------------------------------------------
    # 2. Find primary image
    # ---------------------------------------------------------

    image = db.scalar(
        select(WasteImage).where(
            WasteImage.batch_id == batch.id,
            WasteImage.is_primary.is_(True),
        )
    )

    if image is None:
        raise Exception(
            "No primary image found for this waste batch."
        )

    # ---------------------------------------------------------
    # 3. Preprocess image
    # ---------------------------------------------------------

    tensor = preprocess_image(
        image.file_path
    )

    # ---------------------------------------------------------
    # 4. AI prediction
    # ---------------------------------------------------------

    prediction = predictor.predict(
        tensor
    )

    # ---------------------------------------------------------
    # 5. Save classification
    # ---------------------------------------------------------

    classification = Classification(
        batch_id=batch.id,
        image_id=image.id,
        predicted_material=(
            prediction.predicted_material
        ),
        confidence_score=(
            prediction.confidence_score
        ),
        alternative_predictions=(
            prediction.alternative_predictions
        ),
        predicted_condition=(
            prediction.predicted_condition
        ),
        condition_confidence=(
            prediction.condition_confidence
        ),
        model_name="Demo Predictor",
        model_version="1.0",
    )

    db.add(classification)
    db.flush()

    # ---------------------------------------------------------
    # 6. Generate recommendations
    # ---------------------------------------------------------

    recommendations = generate_recommendations(
        prediction.predicted_material
    )

    # ---------------------------------------------------------
    # 7. Waste scoring
    # ---------------------------------------------------------

    score = WasteScore(
        classification_id=classification.id,
        recyclability_score=Decimal("90"),
        condition_score=Decimal("85"),
        reuse_potential_score=Decimal("88"),
        environmental_benefit_score=Decimal("92"),
        processing_feasibility_score=Decimal("87"),
        circularity_score=Decimal("89"),
        waste_category=(
            prediction.predicted_material
        ),
        calculation_version="1.0",
    )

    db.add(score)

    # ---------------------------------------------------------
    # 8. Environmental impact
    # ---------------------------------------------------------

    impact = estimate_environmental_impact(
        prediction.predicted_material,
        float(batch.quantity_kg),
    )

    impact_row = ImpactEstimate(
        classification_id=classification.id,
        co2_avoided_kg=Decimal(
            str(impact["co2_avoided_kg"])
        ),
        water_saved_liters=Decimal(
            str(impact["water_saved_liters"])
        ),
        landfill_avoided_kg=Decimal(
            str(impact["landfill_avoided_kg"])
        ),
        material_recovered_kg=Decimal(
            str(impact["material_recovered_kg"])
        ),
        diversion_percentage=Decimal(
            str(impact["diversion_percentage"])
        ),
        calculation_version="1.0",
    )

    db.add(impact_row)

    # ---------------------------------------------------------
    # 9. Save recommendations
    # ---------------------------------------------------------

    for rec in recommendations:
        recommendation = Recommendation(
            classification_id=classification.id,
            action=rec["action"],
            rank=rec["rank"],
            suitability_score=Decimal(
                str(rec["score"])
            ),
            reason=rec["reason"],
            is_primary=rec["primary"],
        )

        db.add(recommendation)

    # ---------------------------------------------------------
    # 10. Update batch status
    # ---------------------------------------------------------

    batch.processing_status = "ANALYZED"

    # ---------------------------------------------------------
    # 11. Commit everything
    # ---------------------------------------------------------

    db.commit()

    db.refresh(classification)
    db.refresh(score)
    db.refresh(impact_row)

    # ---------------------------------------------------------
    # 12. Return COMPLETE analysis result
    # ---------------------------------------------------------

    return {
        "message": "Analysis completed successfully",

        "batch_id": batch.id,
        "batch_code": batch.batch_code,

        "classification_id": classification.id,

        "material": prediction.predicted_material,
        "confidence": prediction.confidence_score,

        "condition": prediction.predicted_condition,
        "condition_confidence": (
            prediction.condition_confidence
        ),

        "alternative_predictions": (
            prediction.alternative_predictions
        ),

        "waste_score": {
            "recyclability_score": float(
                score.recyclability_score
            ),
            "condition_score": float(
                score.condition_score
            ),
            "reuse_potential_score": float(
                score.reuse_potential_score
            ),
            "environmental_benefit_score": float(
                score.environmental_benefit_score
            ),
            "processing_feasibility_score": float(
                score.processing_feasibility_score
            ),
            "circularity_score": float(
                score.circularity_score
            ),
            "waste_category": (
                score.waste_category
            ),
        },

        "recommendations": [
            {
                "action": rec["action"],
                "rank": rec["rank"],
                "suitability_score": rec["score"],
                "reason": rec["reason"],
                "is_primary": rec["primary"],
            }
            for rec in recommendations
        ],

        "impact": {
            "co2_avoided_kg": impact[
                "co2_avoided_kg"
            ],
            "water_saved_liters": impact[
                "water_saved_liters"
            ],
            "landfill_avoided_kg": impact[
                "landfill_avoided_kg"
            ],
            "material_recovered_kg": impact[
                "material_recovered_kg"
            ],
            "diversion_percentage": impact[
                "diversion_percentage"
            ],
        },
    }