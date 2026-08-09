"""
Circular Economy Analytics Router — Milestone 3 (Circular Economy Analytics Engine)

Exposes the Circular Economy Analytics Engine through three REST endpoints.

All business logic is delegated to circular_analytics_service.py.
This router contains NO business logic — only request validation,
service delegation, and HTTP response construction.

Endpoints
---------
POST   /api/circular-analytics/generate   — generate & persist latest analytics
GET    /api/circular-analytics/latest     — return latest analytics snapshot
GET    /api/circular-analytics/history    — return all previously generated snapshots
"""

from __future__ import annotations

import json
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services import circular_analytics_service
from app.schemas.circular_analytics import (
    CircularAnalyticsGenerateResponse,
    CircularAnalyticsHistoryItem,
    CircularStatistics,
    CircularWasteCategoryStats,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/circular-analytics",
    tags=["Circular Economy Analytics Engine"],
)


# ── Helper: build response from dict ─────────────────────────────────────────

def _dict_to_response(data: dict) -> CircularAnalyticsGenerateResponse:
    """
    Convert the service-layer analytics dict into a Pydantic response model.

    Centralised here so both POST /generate and GET /latest share
    identical response construction logic.

    Parameters
    ----------
    data : dict
        Full analytics dict as returned by circular_analytics_service
        functions.

    Returns
    -------
    CircularAnalyticsGenerateResponse
        Fully populated Pydantic response model.
    """
    stats_raw = data["statistics"]
    stats = CircularStatistics(**stats_raw)

    waste_breakdown = [
        CircularWasteCategoryStats(**row)
        for row in data.get("waste_category_breakdown", [])
    ]

    return CircularAnalyticsGenerateResponse(
        generated_at=data["generated_at"],
        overall_rating=data["overall_rating"],
        summary=data["summary"],
        statistics=stats,
        material_distribution=data.get("material_distribution", {}),
        recommendation_distribution=data.get("recommendation_distribution", {}),
        waste_category_breakdown=waste_breakdown,
        most_common_material=data.get("most_common_material"),
        least_common_material=data.get("least_common_material"),
        generated_insights=data.get("generated_insights", []),
    )


# ── POST /api/circular-analytics/generate ────────────────────────────────────

@router.post(
    "/generate",
    response_model=CircularAnalyticsGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate latest circular economy analytics",
    description=(
        "Triggers the Circular Economy Analytics Engine to aggregate all existing "
        "sustainability data and produce a comprehensive circular economy analytics snapshot.\n\n"
        "**Data Sources (read-only — no recalculation):**\n"
        "- `sustainability_metrics` — CO₂, water, landfill, resource recovery, scores\n"
        "- `recycling_recommendations` — recommendation type distribution\n"
        "- `inventory` — material types, waste categories\n\n"
        "The engine computes:\n"
        "- Platform-wide aggregate KPI statistics\n"
        "- Material and recommendation distributions\n"
        "- Waste category breakdown with counts and percentages\n"
        "- 5–10 dynamic data-driven circular economy insights\n"
        "- Overall circular economy performance rating\n\n"
        "A metadata snapshot is persisted after each call. "
        "If no sustainability data exists, a meaningful empty analytics response is returned — "
        "no 500 error is raised."
    ),
    responses={
        200: {
            "description": "Circular economy analytics generated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "generated_at": "2026-08-05T18:00:00Z",
                        "overall_rating": "Excellent Circular Economy Performance",
                        "summary": (
                            "The platform demonstrates excellent circular economy performance "
                            "across 120 processed textile items, with Cotton as the dominant material. "
                            "A total of 845.30 kg of CO₂ and 18420 litres of water have been saved."
                        ),
                        "statistics": {
                            "total_items": 120,
                            "total_co2_saved": 845.3,
                            "total_water_saved": 18420.0,
                            "total_resource_recovery": 350.5,
                            "total_landfill_reduction": 10740.0,
                            "average_sustainability_score": 84.7,
                            "average_circularity_score": 88.2,
                            "average_resource_recovery": 2.92,
                            "average_landfill_diversion": 89.5,
                            "highest_co2_saved": 18.5,
                            "lowest_co2_saved": 0.5,
                            "average_co2_saved": 7.04,
                            "highest_water_saved": 420.0,
                            "lowest_water_saved": 20.0,
                            "average_water_saved": 153.5,
                        },
                        "material_distribution": {
                            "Cotton": 42,
                            "Polyester": 26,
                            "Denim": 15,
                            "Mixed Fabric": 12,
                            "Others": 25,
                        },
                        "recommendation_distribution": {
                            "Mechanical Recycling": 34,
                            "Donation": 22,
                            "Fiber Recycling": 19,
                            "Upcycling": 17,
                            "Industrial Recovery": 8,
                        },
                        "waste_category_breakdown": [
                            {"category": "Recyclable", "count": 55, "percentage": 45.83},
                            {"category": "Reusable", "count": 30, "percentage": 25.0},
                            {"category": "Upcyclable", "count": 20, "percentage": 16.67},
                            {"category": "Repairable", "count": 10, "percentage": 8.33},
                            {"category": "Compostable", "count": 5, "percentage": 4.17},
                        ],
                        "most_common_material": "Cotton",
                        "least_common_material": "Mixed Fabric",
                        "generated_insights": [
                            "Cotton is the most frequently processed textile material, accounting for 35.0% of all inventory items.",
                            "Mechanical Recycling is the most frequently recommended recovery strategy.",
                            "The platform has collectively avoided 845.30 kg of CO₂ emissions.",
                            "18420 litres of water have been conserved through circular practices.",
                            "On average, 89.5% of textile waste is diverted from landfill.",
                        ],
                    }
                }
            },
        },
        500: {"description": "Unexpected circular economy analytics aggregation failure."},
    },
)
def generate_circular_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CircularAnalyticsGenerateResponse:
    """
    Generate and persist a circular economy analytics snapshot.

    No request body is required — the engine reads all data from
    existing tables automatically.

    Returns
    -------
    CircularAnalyticsGenerateResponse
        Full analytics response including statistics, distributions, and insights.

    Raises
    ------
    500 — Unexpected internal aggregation failure.
    """
    try:
        analytics_data = circular_analytics_service.generate_analytics(db=db)
    except RuntimeError as exc:
        logger.exception(
            "[CircularAnalyticsRouter] Aggregation failure in generate endpoint: %s", exc
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Circular economy analytics aggregation failed: {exc}",
        )

    return _dict_to_response(analytics_data)


# ── GET /api/circular-analytics/latest ───────────────────────────────────────

@router.get(
    "/latest",
    response_model=CircularAnalyticsGenerateResponse,
    summary="Retrieve the latest circular economy analytics snapshot",
    description=(
        "Returns the most recently generated circular economy analytics snapshot.\n\n"
        "The stored rating, summary, and insights are read from the "
        "`circular_economy_analytics` table. "
        "All aggregate statistics and distributions are **re-computed live** from "
        "`sustainability_metrics`, `recycling_recommendations`, and `inventory` "
        "to ensure fresh values.\n\n"
        "Returns **404** if no analytics have been generated yet — "
        "call **POST /api/circular-analytics/generate** first."
    ),
    responses={
        200: {"description": "Latest analytics snapshot retrieved successfully."},
        404: {"description": "No analytics snapshot has been generated yet."},
        500: {"description": "Unexpected internal retrieval failure."},
    },
)
def get_latest_circular_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CircularAnalyticsGenerateResponse:
    """
    Retrieve the most recently generated circular economy analytics snapshot.

    Returns
    -------
    CircularAnalyticsGenerateResponse
        Full analytics response with live-recomputed statistics.

    Raises
    ------
    404 — No analytics snapshot has been generated yet.
    500 — Unexpected internal failure.
    """
    try:
        analytics_data = circular_analytics_service.get_latest_analytics(db=db)
    except RuntimeError as exc:
        logger.exception(
            "[CircularAnalyticsRouter] Retrieval failure in /latest endpoint: %s", exc
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve latest analytics: {exc}",
        )

    if analytics_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No circular economy analytics have been generated yet. "
                "Call POST /api/circular-analytics/generate to generate the first snapshot."
            ),
        )

    return _dict_to_response(analytics_data)


# ── GET /api/circular-analytics/history ──────────────────────────────────────

@router.get(
    "/history",
    response_model=List[CircularAnalyticsHistoryItem],
    summary="List all previously generated circular economy analytics snapshots",
    description=(
        "Returns a list of all previously generated circular economy analytics snapshots "
        "ordered by most recently generated.\n\n"
        "Each item includes the snapshot timestamp, total items processed, "
        "overall rating, one-paragraph summary, and the list of insights generated at "
        "the time of the snapshot.\n\n"
        "For the full analytics response including live statistics and distributions, "
        "use **GET /api/circular-analytics/latest**.\n\n"
        "Returns an empty list if no snapshots exist."
    ),
    responses={
        200: {"description": "Analytics history retrieved successfully (empty list if none exist)."},
        500: {"description": "Unexpected internal retrieval failure."},
    },
)
def get_circular_analytics_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CircularAnalyticsHistoryItem]:
    """
    Return all stored circular economy analytics metadata rows, newest-first.

    Returns
    -------
    List[CircularAnalyticsHistoryItem]
        Lightweight analytics history items. Empty list if none exist.

    Raises
    ------
    500 — Unexpected internal failure.
    """
    try:
        rows = circular_analytics_service.get_analytics_history(db=db)
    except Exception as exc:
        logger.exception(
            "[CircularAnalyticsRouter] Unexpected failure in /history endpoint: %s", exc
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analytics history: {exc}",
        )

    return [
        CircularAnalyticsHistoryItem(
            id=row.id,
            generated_at=row.generated_at,
            total_items=row.total_items,
            overall_rating=row.overall_rating,
            summary=row.summary,
            generated_insights=_safe_deserialise_insights(row.generated_insights),
        )
        for row in rows
    ]


# ── Private utilities ─────────────────────────────────────────────────────────

def _safe_deserialise_insights(raw: str) -> List[str]:
    """
    Safely deserialise a JSON-encoded insights string from the database.

    Returns an empty list on any parse error, preventing 500 responses
    caused by malformed stored data.

    Parameters
    ----------
    raw : str
        JSON-encoded list of insight strings from the database column.

    Returns
    -------
    List[str]
        Deserialised list of insight strings, or [] on failure.
    """
    try:
        result = json.loads(raw)
        if isinstance(result, list):
            return [str(item) for item in result]
        return []
    except (json.JSONDecodeError, TypeError):
        return []
