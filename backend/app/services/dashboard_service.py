from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    WasteBatch,
    Facility,
    Classification,
    WasteScore,
    ImpactEstimate,
)


def get_dashboard_analytics(
    db: Session,
    current_user,
):
    organization_id = current_user.organization_id

    if organization_id is None:
        raise Exception(
            "Complete organization onboarding before viewing dashboard."
        )

    # ---------------------------------------------------------
    # Base organization filter
    # ---------------------------------------------------------

    batch_filter = [
        WasteBatch.organization_id == organization_id,
        WasteBatch.is_archived.is_(False),
    ]

    # ---------------------------------------------------------
    # Batch statistics
    # ---------------------------------------------------------

    total_batches = db.scalar(
        select(func.count(WasteBatch.id))
        .where(*batch_filter)
    ) or 0

    analyzed_batches = db.scalar(
        select(func.count(WasteBatch.id))
        .where(
            *batch_filter,
            WasteBatch.processing_status == "ANALYZED",
        )
    ) or 0

    pending_batches = db.scalar(
        select(func.count(WasteBatch.id))
        .where(
            *batch_filter,
            WasteBatch.processing_status != "ANALYZED",
            WasteBatch.processing_status != "REJECTED",
        )
    ) or 0

    # ---------------------------------------------------------
    # Facilities
    # ---------------------------------------------------------

    active_facilities = db.scalar(
        select(func.count(Facility.id))
        .where(
            Facility.organization_id == organization_id,
            Facility.is_active.is_(True),
        )
    ) or 0

    # ---------------------------------------------------------
    # Waste category statistics
    # ---------------------------------------------------------

    category_rows = db.execute(
        select(
            WasteScore.waste_category,
            func.count(WasteScore.id),
        )
        .join(
            Classification,
            Classification.id
            == WasteScore.classification_id,
        )
        .join(
            WasteBatch,
            WasteBatch.id
            == Classification.batch_id,
        )
        .where(
            WasteBatch.organization_id == organization_id,
            WasteBatch.is_archived.is_(False),
        )
        .group_by(WasteScore.waste_category)
    ).all()

    waste_categories = {
        str(category): count
        for category, count in category_rows
    }

    # ---------------------------------------------------------
    # Average recovery / circularity
    # ---------------------------------------------------------

    average_circularity = db.scalar(
        select(
            func.avg(
                WasteScore.circularity_score
            )
        )
        .join(
            Classification,
            Classification.id
            == WasteScore.classification_id,
        )
        .join(
            WasteBatch,
            WasteBatch.id
            == Classification.batch_id,
        )
        .where(
            WasteBatch.organization_id == organization_id,
            WasteBatch.is_archived.is_(False),
        )
    )

    average_recyclability = db.scalar(
        select(
            func.avg(
                WasteScore.recyclability_score
            )
        )
        .join(
            Classification,
            Classification.id
            == WasteScore.classification_id,
        )
        .join(
            WasteBatch,
            WasteBatch.id
            == Classification.batch_id,
        )
        .where(
            WasteBatch.organization_id == organization_id,
            WasteBatch.is_archived.is_(False),
        )
    )

    # ---------------------------------------------------------
    # Environmental impact
    # ---------------------------------------------------------

    impact_values = db.execute(
        select(
            func.coalesce(
                func.sum(
                    ImpactEstimate.co2_avoided_kg
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ImpactEstimate.water_saved_liters
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ImpactEstimate.landfill_avoided_kg
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    ImpactEstimate.material_recovered_kg
                ),
                0,
            ),
            func.avg(
                ImpactEstimate.diversion_percentage
            ),
        )
        .join(
            Classification,
            Classification.id
            == ImpactEstimate.classification_id,
        )
        .join(
            WasteBatch,
            WasteBatch.id
            == Classification.batch_id,
        )
        .where(
            WasteBatch.organization_id == organization_id,
            WasteBatch.is_archived.is_(False),
        )
    ).one()

    (
        co2_avoided,
        water_saved,
        landfill_avoided,
        material_recovered,
        average_diversion,
    ) = impact_values

    # ---------------------------------------------------------
    # Material distribution
    # ---------------------------------------------------------

    material_rows = db.execute(
        select(
            Classification.predicted_material,
            func.count(Classification.id),
        )
        .join(
            WasteBatch,
            WasteBatch.id
            == Classification.batch_id,
        )
        .where(
            WasteBatch.organization_id == organization_id,
            WasteBatch.is_archived.is_(False),
        )
        .group_by(
            Classification.predicted_material
        )
        .order_by(
            func.count(Classification.id).desc()
        )
    ).all()

    materials = {
        str(material): count
        for material, count in material_rows
    }

    return {
        "batches": {
            "total": total_batches,
            "analyzed": analyzed_batches,
            "pending": pending_batches,
        },

        "facilities": {
            "active": active_facilities,
        },

        "recovery": {
            "average_circularity": round(
                float(average_circularity or 0),
                2,
            ),
            "average_recyclability": round(
                float(average_recyclability or 0),
                2,
            ),
        },

        "waste_categories": waste_categories,

        "materials": materials,

        "sustainability": {
            "co2_avoided_kg": round(
                float(co2_avoided or 0),
                2,
            ),
            "water_saved_liters": round(
                float(water_saved or 0),
                2,
            ),
            "landfill_avoided_kg": round(
                float(landfill_avoided or 0),
                2,
            ),
            "material_recovered_kg": round(
                float(material_recovered or 0),
                2,
            ),
            "average_diversion_percentage": round(
                float(average_diversion or 0),
                2,
            ),
        },
    }