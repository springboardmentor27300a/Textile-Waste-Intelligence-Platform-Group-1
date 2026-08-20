

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
from app.ml.scoring_engine import calculate_waste_assessment
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
    # 4. REAL AI material prediction
    # ---------------------------------------------------------

    prediction = predictor.predict(
        tensor
    )

    # ---------------------------------------------------------
    # 5. Condition
    #
    # Condition comes from the registered waste batch.
    # The current ML dataset does not contain condition labels,
    # so we do not pretend the ML model predicted condition.
    # ---------------------------------------------------------

    assessment_condition = (
        batch.condition or "UNKNOWN"
    ).upper()

    # ---------------------------------------------------------
    # 6. REAL waste assessment
    # ---------------------------------------------------------

    assessment = calculate_waste_assessment(
        material=prediction.predicted_material,
        condition=assessment_condition,
    )

    # ---------------------------------------------------------
    # 7. Save classification
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
            assessment_condition
        ),
        condition_confidence=0,
        model_name="EfficientNet-B0",
        model_version="1.0-finetuned",
    )

    db.add(classification)
    db.flush()

    # ---------------------------------------------------------
    # 8. Generate recommendations using REAL assessment
    # ---------------------------------------------------------

    recommendations = generate_recommendations(
        material=prediction.predicted_material,
        condition=assessment_condition,
        waste_category=assessment["waste_category"],
        recyclability=assessment[
            "recyclability_score"
        ],
        reuse_potential=assessment[
            "reuse_potential_score"
        ],
        processing_feasibility=assessment[
            "processing_feasibility_score"
        ],
    )

    # ---------------------------------------------------------
    # 9. Save REAL waste score
    # ---------------------------------------------------------

    score = WasteScore(
        classification_id=classification.id,
        recyclability_score=Decimal(
            str(assessment["recyclability_score"])
        ),
        condition_score=Decimal(
            str(assessment["condition_score"])
        ),
        reuse_potential_score=Decimal(
            str(assessment["reuse_potential_score"])
        ),
        environmental_benefit_score=Decimal(
            str(
                assessment[
                    "environmental_benefit_score"
                ]
            )
        ),
        processing_feasibility_score=Decimal(
            str(
                assessment[
                    "processing_feasibility_score"
                ]
            )
        ),
        circularity_score=Decimal(
            str(assessment["circularity_score"])
        ),
        waste_category=assessment[
            "waste_category"
        ],
        calculation_version="2.0",
    )

    db.add(score)

    # ---------------------------------------------------------
    # 10. Environmental impact
    # ---------------------------------------------------------

    impact = estimate_environmental_impact(
        material=prediction.predicted_material,
        quantity_kg=float(batch.quantity_kg),
        waste_category=assessment[
            "waste_category"
        ],
        condition=assessment_condition,
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
        calculation_version="2.0",
    )

    db.add(impact_row)

    # ---------------------------------------------------------
    # 11. Save recommendations
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
    # 12. Update batch status
    # ---------------------------------------------------------

    batch.processing_status = "ANALYZED"

    # ---------------------------------------------------------
    # 13. Commit
    # ---------------------------------------------------------

    db.commit()

    db.refresh(classification)
    db.refresh(score)
    db.refresh(impact_row)

    # ---------------------------------------------------------
    # 14. Return complete analysis
    # ---------------------------------------------------------

    return {
        "message": "Analysis completed successfully",

        "batch_id": batch.id,
        "batch_code": batch.batch_code,

        "classification_id": classification.id,

        "material": prediction.predicted_material,
        "confidence": prediction.confidence_score,

        "condition": assessment_condition,
        "condition_confidence": 0,

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


def get_latest_analysis(
    db: Session,
    current_user,
    batch_id: int,
):
    batch = db.scalar(
        select(WasteBatch).where(
            WasteBatch.id == batch_id
        )
    )

    if batch is None:
        raise Exception("Batch not found")

    classification = db.scalar(
        select(Classification)
        .where(
            Classification.batch_id == batch.id
        )
        .order_by(
            Classification.id.desc()
        )
    )

    if classification is None:
        raise Exception(
            "No analysis found for this batch."
        )

    score = db.scalar(
        select(WasteScore)
        .where(
            WasteScore.classification_id
            == classification.id
        )
    )

    recommendations = db.scalars(
        select(Recommendation)
        .where(
            Recommendation.classification_id
            == classification.id
        )
        .order_by(
            Recommendation.rank
        )
    ).all()

    impact = db.scalar(
        select(ImpactEstimate)
        .where(
            ImpactEstimate.classification_id
            == classification.id
        )
    )

    return {
        "batch_id": batch.id,
        "batch_code": batch.batch_code,

        "classification_id":
            classification.id,

        "material":
            classification.predicted_material,

        "confidence":
            classification.confidence_score,

        "condition":
            classification.predicted_condition,

        "condition_confidence":
            classification.condition_confidence,

        "alternative_predictions":
            classification.alternative_predictions
            or [],

        "waste_score": (
            {
                "recyclability_score":
                    float(
                        score.recyclability_score
                    ),
                "condition_score":
                    float(
                        score.condition_score
                    ),
                "reuse_potential_score":
                    float(
                        score.reuse_potential_score
                    ),
                "environmental_benefit_score":
                    float(
                        score.environmental_benefit_score
                    ),
                "processing_feasibility_score":
                    float(
                        score.processing_feasibility_score
                    ),
                "circularity_score":
                    float(
                        score.circularity_score
                    ),
                "waste_category":
                    score.waste_category,
            }
            if score
            else None
        ),

        "recommendations": [
            {
                "action":
                    rec.action,
                "rank":
                    rec.rank,
                "suitability_score":
                    float(
                        rec.suitability_score
                    ),
                "reason":
                    rec.reason,
                "is_primary":
                    rec.is_primary,
            }
            for rec in recommendations
        ],

        "impact": (
            {
                "co2_avoided_kg":
                    float(
                        impact.co2_avoided_kg
                    ),
                "water_saved_liters":
                    float(
                        impact.water_saved_liters
                    ),
                "landfill_avoided_kg":
                    float(
                        impact.landfill_avoided_kg
                    ),
                "material_recovered_kg":
                    float(
                        impact.material_recovered_kg
                    ),
                "diversion_percentage":
                    float(
                        impact.diversion_percentage
                    ),
            }
            if impact
            else None
        ),
    }