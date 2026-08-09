"""
Environmental Impact Assessment Router — Milestone 4

Exposes the Environmental Impact Assessment Engine through three REST endpoints.

All business logic is delegated to environmental_service.py.
This router contains NO business logic — only request validation,
service delegation, and HTTP response construction.

Endpoints
---------
POST   /api/environmental/generate          — generate & persist an environmental report
GET    /api/environmental/{inventory_id}    — retrieve a stored report for one item
GET    /api/environmental                   — list all stored environmental reports
"""

from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services import environmental_service
from app.schemas.environmental import (
    EnvironmentalGenerateRequest,
    EnvironmentalReportOut,
    EnvironmentalReportListItem,
    SustainabilityReportOut,
    EnvironmentalImpactStats,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/environmental",
    tags=["Environmental Impact Assessment Engine"],
)


# ── POST /api/environmental/generate ─────────────────────────────────────────

@router.post(
    "/generate",
    response_model=SustainabilityReportOut,
    status_code=status.HTTP_200_OK,
    summary="Generate an environmental impact assessment report",
    description=(
        "Triggers the Environmental Impact Assessment Engine for the given inventory item. "
        "\n\n"
        "**Data Sources (read-only — no recalculation):**\n"
        "- `sustainability_metrics` — CO₂, water, landfill, resource recovery, score\n"
        "- `recycling_recommendations` — recommendation type names\n"
        "- `inventory` — material type, weight\n\n"
        "The engine derives the **environmental rating**, generates **3–5 contextual insights**, "
        "composes a **summary paragraph**, and persists report metadata. "
        "Re-running replaces the existing report for that inventory item.\n\n"
        "**Prerequisites:** Run `POST /api/sustainability/calculate` and "
        "`POST /api/recommendation/generate` for this inventory item first."
    ),
    responses={
        200: {
            "description": "Environmental report generated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "inventory_id": 1,
                        "material": "Cotton",
                        "waste_category": "Recyclable",
                        "weight_kg": 5.0,
                        "co2_saved": 12.5,
                        "water_saved": 350.0,
                        "landfill_diversion": 92.0,
                        "resource_recovery": 4.5,
                        "sustainability_score": 78.5,
                        "circularity": "High",
                        "recommendations": ["Donation", "Fabric Reuse"],
                        "environmental_rating": "Very Good",
                        "co2_benefit": "Recycling this cotton textile avoids 12.5 kg of CO₂.",
                        "water_benefit": "350.0 litres of water conserved.",
                        "landfill_benefit": "92.0% of material diverted from landfill.",
                        "recovery_benefit": "4.5 kg of cotton fibre can be recovered.",
                        "impact_statistics": {
                            "carbon_impact": 12.5,
                            "water_conservation": 350.0,
                            "landfill_reduction": 92.0,
                            "resource_recovery": 4.5,
                            "circular_economy_contribution": "High",
                            "overall_sustainability_performance": 78.5,
                        },
                        "insights": [
                            "Recycling this cotton textile saves approximately 12.5 kg of CO₂.",
                            "Water conservation is above average for this material type.",
                            "The material has excellent recovery potential.",
                        ],
                        "summary": (
                            "This Cotton textile waste has been assessed as 'Very Good' "
                            "with an overall sustainability score of 78.5/100."
                        ),
                        "generated_at": "2026-08-05T12:00:00Z",
                    }
                }
            },
        },
        404: {"description": "Inventory / sustainability assessment / recommendations not found."},
        500: {"description": "Unexpected environmental assessment failure."},
    },
)
def generate_environmental_report(
    body: EnvironmentalGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SustainabilityReportOut:
    """
    Generate and persist an environmental impact assessment report.

    Request body
    ------------
    inventory_id : int — ID of the inventory item to assess.

    Returns
    -------
    SustainabilityReportOut — full structured report with all sections.

    Raises
    ------
    404 — inventory item not found
    404 — sustainability assessment not available
    404 — recommendations not available
    500 — unexpected internal failure
    """
    try:
        report_dict = environmental_service.generate_and_save(
            inventory_id=body.inventory_id,
            db=db,
        )
    except ValueError as exc:
        msg = str(exc)
        # Map all "not found" errors to 404
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
    except RuntimeError as exc:
        logger.exception(
            "Environmental report generation failed for inventory_id=%s",
            body.inventory_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Environmental assessment error: {exc}",
        )

    # Construct the Pydantic response from the assembled dict
    return SustainabilityReportOut(
        inventory_id=report_dict["inventory_id"],
        material=report_dict["material"],
        waste_category=report_dict["waste_category"],
        weight_kg=report_dict["weight_kg"],
        co2_saved=report_dict["co2_saved"],
        water_saved=report_dict["water_saved"],
        landfill_diversion=report_dict["landfill_diversion"],
        resource_recovery=report_dict["resource_recovery"],
        sustainability_score=report_dict["sustainability_score"],
        circularity=report_dict["circularity"],
        recommendations=report_dict["recommendations"],
        environmental_rating=report_dict["environmental_rating"],
        co2_benefit=report_dict["co2_benefit"],
        water_benefit=report_dict["water_benefit"],
        landfill_benefit=report_dict["landfill_benefit"],
        recovery_benefit=report_dict["recovery_benefit"],
        impact_statistics=EnvironmentalImpactStats(**report_dict["impact_statistics"]),
        insights=report_dict["insights"],
        summary=report_dict["summary"],
        generated_at=report_dict["generated_at"],
    )


# ── GET /api/environmental/{inventory_id} ─────────────────────────────────────

@router.get(
    "/{inventory_id}",
    response_model=SustainabilityReportOut,
    summary="Retrieve the environmental report for an inventory item",
    description=(
        "Returns the stored environmental impact assessment for the given inventory item. "
        "\n\n"
        "KPI values (CO₂, water, landfill, recovery, score) are always sourced live "
        "from `sustainability_metrics` to ensure consistency. "
        "\n\n"
        "Returns **404** if no report has been generated — "
        "call **POST /api/environmental/generate** first."
    ),
)
def get_environmental_report(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SustainabilityReportOut:
    """
    Retrieve the stored environmental report for one inventory item.

    Path parameter
    --------------
    inventory_id : int — the inventory item to retrieve the report for.

    Returns
    -------
    SustainabilityReportOut — full report with live KPI values.

    Raises
    ------
    404 — inventory / metric / report not found.
    """
    try:
        report_dict = environmental_service.get_report(
            inventory_id=inventory_id,
            db=db,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.exception(
            "Unexpected error retrieving environmental report for inventory_id=%s",
            inventory_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {exc}",
        )

    return SustainabilityReportOut(
        inventory_id=report_dict["inventory_id"],
        material=report_dict["material"],
        waste_category=report_dict["waste_category"],
        weight_kg=report_dict["weight_kg"],
        co2_saved=report_dict["co2_saved"],
        water_saved=report_dict["water_saved"],
        landfill_diversion=report_dict["landfill_diversion"],
        resource_recovery=report_dict["resource_recovery"],
        sustainability_score=report_dict["sustainability_score"],
        circularity=report_dict["circularity"],
        recommendations=report_dict["recommendations"],
        environmental_rating=report_dict["environmental_rating"],
        co2_benefit=report_dict["co2_benefit"],
        water_benefit=report_dict["water_benefit"],
        landfill_benefit=report_dict["landfill_benefit"],
        recovery_benefit=report_dict["recovery_benefit"],
        impact_statistics=EnvironmentalImpactStats(**report_dict["impact_statistics"]),
        insights=report_dict["insights"],
        summary=report_dict["summary"],
        generated_at=report_dict["generated_at"],
    )


# ── GET /api/environmental ────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[EnvironmentalReportListItem],
    summary="List all environmental impact reports",
    description=(
        "Returns lightweight metadata for all stored environmental impact reports, "
        "ordered by most recently generated. "
        "\n\n"
        "Suitable for dashboard overview tables and export views. "
        "For full report details including KPI values, use "
        "**GET /api/environmental/{inventory_id}**."
    ),
)
def list_environmental_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[EnvironmentalReportListItem]:
    """
    Return a lightweight list of all environmental report metadata rows.

    Returns
    -------
    List[EnvironmentalReportListItem] — ordered by most recently generated.
    """
    reports = environmental_service.get_all_reports(db=db)
    return [
        EnvironmentalReportListItem(
            id=r.id,
            inventory_id=r.inventory_id,
            environmental_rating=r.environmental_rating,
            summary=r.summary,
            report_generated_at=r.report_generated_at,
        )
        for r in reports
    ]
