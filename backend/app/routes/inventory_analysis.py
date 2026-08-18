from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    TextileInventory,
    InventorySustainabilityAnalysis,
    User
)
from app.dependencies import (
    RoleChecker
)
from app.services.inventory_sustainability_service import (
    InventorySustainabilityService
)

router = APIRouter(
    prefix="/inventory-analysis",
    tags=["Inventory Sustainability Analysis"]
)


# ==========================================================
# Inventory Sustainability Analysis
# ==========================================================

@router.post("/{inventory_id}")
def analyze_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RoleChecker([
            "admin",
            "manufacturer",
            "recycling_operator",
            "sustainability_manager"
        ])
    )
):

    # ------------------------------------------------------
    # 1. Find inventory batch
    # ------------------------------------------------------

    inventory = (
        db.query(TextileInventory)
        .filter(
            TextileInventory.id == inventory_id
        )
        .first()
    )

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory batch not found."
        )


    # ------------------------------------------------------
    # 2. Check whether analysis already exists
    # ------------------------------------------------------

    existing_analysis = (
        db.query(InventorySustainabilityAnalysis)
        .filter(
            InventorySustainabilityAnalysis.inventory_id
            == inventory_id
        )
        .first()
    )

    if existing_analysis:
        db.delete(existing_analysis)
        db.commit()


    # ------------------------------------------------------
    # 3. Normalize inventory values
    # ------------------------------------------------------

    # fabric = (
    #     inventory.fabric_type or ""
    # ).strip().lower()

    condition = (
        inventory.condition or ""
    ).strip().lower()


    quantity = float(
        inventory.quantity or 0
    )
    sustainability_service = (
        InventorySustainabilityService()
    )


    # ------------------------------------------------------
    # 4. Recycling Recommendation
    # ------------------------------------------------------

    if condition in [
        "recyclable",
        "good"
    ]:

        recommended_action = "Recycle"
        recovery_potential = "High"

    elif condition in [
        "poor",
        "damaged"
    ]:

        recommended_action = "Recover"
        recovery_potential = "Medium"

    else:

        recommended_action = "Reuse"
        recovery_potential = "Medium"

    sustainability_result = (
        sustainability_service.calculate(
            fabric_type=inventory.fabric_type,
            quantity=quantity,
            condition=inventory.condition,
            recommended_action=recommended_action
        )
    )
            # ------------------------------------------------------
    # 6. Sustainability Scores
    # ------------------------------------------------------

    recyclability_score = (
        sustainability_result["recyclability_score"]
    )

    reuse_score = (
        sustainability_result["reuse_score"]
    )

    material_recovery_score = (
        sustainability_result["material_recovery_score"]
    )

    sustainability_score = (
        sustainability_result["sustainability_score"]
    )

            # ------------------------------------------------------
    # 7. Circular Economy Score
    # ------------------------------------------------------

    circularity_score = round(
        (
            recyclability_score * 0.4
            + reuse_score * 0.3
            + material_recovery_score * 0.3
        ),
        2
    )

    if circularity_score >= 80:

        circularity_category = "High"

    elif circularity_score >= 60:

        circularity_category = "Medium"

    else:

        circularity_category = "Low"

    # ------------------------------------------------------
    # 8. Circular Economy Metrics
    # ------------------------------------------------------

    landfill_diversion = (
        sustainability_result["landfill_diversion"]
    )

    waste_diversion_rate = round(
        (
            landfill_diversion / quantity * 100
        )
        if quantity > 0
        else 0,
        2
    )

    resource_recovery_rate = round(
        material_recovery_score,
        2
    )

    circular_economy_index = round(
        (
            circularity_score
            + sustainability_score
        ) / 2,
        2
    )

    if circular_economy_index >= 80:

        circular_rating = "Excellent"

    elif circular_economy_index >= 60:

        circular_rating = "Good"

    else:

        circular_rating = "Needs Improvement"


    # ------------------------------------------------------
    # 10. Save Analysis
    # ------------------------------------------------------

    analysis = InventorySustainabilityAnalysis(

        inventory_id=inventory.id,

        batch_id=inventory.waste_batch_id,

        fabric_type=inventory.fabric_type,

        quantity=quantity,

        condition=inventory.condition,

        recommended_action=recommended_action,

        recovery_potential=recovery_potential,

        

        carbon_footprint=(
            sustainability_result["carbon_footprint"]
        ),

        water_impact=(
            sustainability_result["water_impact"]
        ),

        co2_saved=(
            sustainability_result["co2_saved"]
        ),

        water_saved=(
            sustainability_result["water_saved"]
        ),

        landfill_diversion=(
            sustainability_result["landfill_diversion"]
        ),

    

        impact_source=(
            sustainability_result["impact_source"]
        ),

        impact_boundary=(
            sustainability_result["impact_boundary"]
        ),

        impact_factor_status=(
            sustainability_result["impact_factor_status"]
        ),

        impact_region=(
            sustainability_result["impact_region"]
        ),

        impact_scenario=(
            sustainability_result["impact_scenario"]
        ),

        # Sustainability Scores
                recyclability_score=recyclability_score,

        reuse_score=reuse_score,

        material_recovery_score=(
            material_recovery_score
        ),

        sustainability_score=(
            sustainability_score
        ),

        circularity_score=(
            circularity_score
        ),

        circularity_category=(
            circularity_category
        ),

        # Circular Economy
                waste_diversion_rate=(
            waste_diversion_rate
        ),

        resource_recovery_rate=(
            resource_recovery_rate
        ),

        circular_economy_index=(
            circular_economy_index
        ),

        circular_rating=(
            circular_rating
        ),
        analyzed_by=current_user.id
    )


    db.add(analysis)

    db.commit()

    db.refresh(analysis)


    return analysis

# ==========================================================
# Inventory Sustainability Dashboard Summary
# ==========================================================

@router.get("/summary")
def get_inventory_sustainability_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        RoleChecker([
            "admin",
            "manufacturer",
            "recycling_operator",
            "sustainability_manager"
        ])
    )
):

    total_analyzed_batches = (
        db.query(
            func.count(
                InventorySustainabilityAnalysis.id
            )
        )
        .scalar()
        or 0
    )

    total_quantity = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.quantity
            )
        )
        .scalar()
        or 0
    )

    total_carbon_footprint = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.carbon_footprint
            )
        )
        .scalar()
        or 0
    )

    total_co2_saved = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.co2_saved
            )
        )
        .scalar()
        or 0
    )

    total_water_impact = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.water_impact
            )
        )
        .scalar()
        or 0
    )

    total_water_saved = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.water_saved
            )
        )
        .scalar()
        or 0
    )

    total_landfill_diversion = (
        db.query(
            func.sum(
                InventorySustainabilityAnalysis.landfill_diversion
            )
        )
        .scalar()
        or 0
    )

    average_sustainability_score = (
        db.query(
            func.avg(
                InventorySustainabilityAnalysis.sustainability_score
            )
        )
        .scalar()
        or 0
    )

    average_circularity_score = (
        db.query(
            func.avg(
                InventorySustainabilityAnalysis.circularity_score
            )
        )
        .scalar()
        or 0
    )

    average_resource_recovery = (
        db.query(
            func.avg(
                InventorySustainabilityAnalysis.resource_recovery_rate
            )
        )
        .scalar()
        or 0
    )

    recycling_opportunities = (
        db.query(
            InventorySustainabilityAnalysis
        )
        .filter(
            InventorySustainabilityAnalysis.recommended_action
            == "Recycle"
        )
        .count()
    )
    
        # ==========================================
        # LCA Coverage
        # ==========================================

    lca_coverage = (
            db.query(
                InventorySustainabilityAnalysis
            )
            .filter(
                InventorySustainabilityAnalysis.impact_factor_status.like(
                    "Official published factor%"
                )
            )
            .count()
        )

    lca_coverage_total = total_analyzed_batches

    return {
        "total_analyzed_batches": total_analyzed_batches,

        "total_quantity": round(
            total_quantity,
            2
        ),

        "total_carbon_footprint": round(
            total_carbon_footprint,
            2
        ),

        "total_co2_saved": round(
            total_co2_saved,
            2
        ),

        "total_water_impact": round(
            total_water_impact,
            2
        ),

        "total_water_saved": round(
            total_water_saved,
            2
        ),

        "total_landfill_diversion": round(
            total_landfill_diversion,
            2
        ),

        "average_sustainability_score": round(
            average_sustainability_score,
            2
        ),

        "average_circularity_score": round(
            average_circularity_score,
            2
        ),

        "average_resource_recovery": round(
            average_resource_recovery,
            2
        ),

        "recycling_opportunities": recycling_opportunities,
        "lca_coverage": lca_coverage,

        "lca_coverage_total": lca_coverage_total
    }