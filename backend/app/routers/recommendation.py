"""
Recommendation Router — Milestone 4

Exposes the Recycling Recommendation Engine through three REST endpoints.

All business logic is delegated to recommendation_service.py.
This router contains NO business logic — only request validation,
service delegation, and HTTP response construction.

Endpoints
---------
POST   /api/recommendation/generate              — generate & persist recommendations
GET    /api/recommendation/{inventory_id}        — retrieve stored recommendations
GET    /api/recommendation                       — list all stored recommendations
"""

from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services import recommendation_service
from app.schemas.recommendation import (
    RecommendationGenerateRequest,
    RecommendationItemOut,
    RecommendationListResponse,
    RecommendationSummaryItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/recommendation",
    tags=["Recycling Recommendation Engine"],
)

# ── POST /api/recommendation/generate ─────────────────────────────────────────

@router.post(
    "/generate",
    response_model=RecommendationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate recycling recommendations for an inventory item",
    description=(
        "Triggers the Recycling Recommendation Engine for the given inventory item. "
        "\n\n"
        "The engine resolves the **material type** and **waste category** from the "
        "existing inventory record — no image classification is performed. "
        "\n\n"
        "If an optional **condition** ('Excellent' | 'Good' | 'Fair' | 'Poor') is "
        "provided, the recommendations are refined to match the material state. "
        "\n\n"
        "Any previously stored recommendations for this inventory item are replaced "
        "with freshly generated ones."
    ),
    responses={
        200: {
            "description": "Recommendations generated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "inventory_id": 1,
                        "material": "Cotton",
                        "waste_category": "Recyclable",
                        "condition": "Good",
                        "recommendation_count": 2,
                        "recommendations": [
                            {
                                "id": 1,
                                "recommendation": "Donation",
                                "priority": "High",
                                "description": "Donate to local textile charity drives.",
                                "reason": "Good quality natural fiber suitable for direct reuse.",
                                "environmental_benefit": "Reduces landfill waste and extends product life.",
                                "created_at": "2026-08-05T12:00:00Z",
                            },
                            {
                                "id": 2,
                                "recommendation": "Fabric Reuse",
                                "priority": "Medium",
                                "description": "Reuse in textile manufacturing.",
                                "reason": "Cotton fibers remain durable.",
                                "environmental_benefit": "Reduces demand for virgin cotton.",
                                "created_at": "2026-08-05T12:00:00Z",
                            },
                        ],
                    }
                }
            },
        },
        404: {"description": "Inventory item not found."},
        400: {"description": "Invalid input — unrecognised material or condition."},
        500: {"description": "Unexpected recommendation generation failure."},
    },
)
def generate_recommendations(
    body: RecommendationGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendationListResponse:
    """
    Generate and persist recycling recommendations for an inventory item.

    Request body
    ------------
    inventory_id : int           — ID of the inventory item to analyse.
    condition    : str (optional) — 'Excellent' | 'Good' | 'Fair' | 'Poor'

    Returns
    -------
    RecommendationListResponse — grouped recommendations ordered High → Medium → Low priority.

    Raises
    ------
    404 — inventory item not found
    400 — material not recognised by waste classifier
    500 — unexpected internal failure
    """
    try:
        recs = recommendation_service.generate_and_save(
            inventory_id=body.inventory_id,
            db=db,
            condition=body.condition,
        )
    except ValueError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    except RuntimeError as exc:
        logger.exception(
            "Recommendation generation failed for inventory_id=%s", body.inventory_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation error: {exc}",
        )

    if not recs:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No recommendations could be generated for this item.",
        )

    # All records share the same material/category/condition snapshot
    first = recs[0]
    return RecommendationListResponse(
        inventory_id=body.inventory_id,
        material=first.material_type,
        waste_category=first.waste_category,
        condition=first.condition,
        recommendation_count=len(recs),
        recommendations=[
            RecommendationItemOut(
                id=r.id,
                recommendation=r.recommendation,
                priority=r.priority,
                description=r.description,
                reason=r.reason,
                environmental_benefit=r.environmental_benefit,
                created_at=r.created_at,
            )
            for r in recs
        ],
    )


# ── GET /api/recommendation/{inventory_id} ─────────────────────────────────────

@router.get(
    "/{inventory_id}",
    response_model=RecommendationListResponse,
    summary="Retrieve recycling recommendations for an inventory item",
    description=(
        "Returns all stored recycling recommendations for the given inventory item, "
        "ordered by priority (High first). "
        "\n\n"
        "Returns **404** if no recommendations have been generated yet — "
        "call **POST /api/recommendation/generate** first."
    ),
)
def get_recommendations_by_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendationListResponse:
    """
    Retrieve stored recycling recommendations by inventory ID.

    Path parameter
    --------------
    inventory_id : int — the inventory item to retrieve recommendations for.

    Returns
    -------
    RecommendationListResponse — all stored recommendations, High priority first.

    Raises
    ------
    404 — no recommendations found for this inventory item.
    """
    recs = recommendation_service.get_recommendations_by_inventory_id(
        inventory_id=inventory_id,
        db=db,
    )

    if not recs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No recycling recommendations found for inventory_id={inventory_id}. "
                "Run POST /api/recommendation/generate first."
            ),
        )

    first = recs[0]
    # Re-sort by priority for the response (High→Medium→Low)
    _order = {"High": 0, "Medium": 1, "Low": 2}
    recs_sorted = sorted(recs, key=lambda r: _order.get(r.priority, 99))

    return RecommendationListResponse(
        inventory_id=inventory_id,
        material=first.material_type,
        waste_category=first.waste_category,
        condition=first.condition,
        recommendation_count=len(recs_sorted),
        recommendations=[
            RecommendationItemOut(
                id=r.id,
                recommendation=r.recommendation,
                priority=r.priority,
                description=r.description,
                reason=r.reason,
                environmental_benefit=r.environmental_benefit,
                created_at=r.created_at,
            )
            for r in recs_sorted
        ],
    )


# ── GET /api/recommendation ───────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[RecommendationSummaryItem],
    summary="List all recycling recommendations",
    description=(
        "Returns all stored recycling recommendation records across all inventory items, "
        "ordered by most recently created. "
        "Suitable for data tables, export views, and dashboard overview widgets."
    ),
)
def list_all_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[RecommendationSummaryItem]:
    """
    Return a lightweight list of all recycling recommendation records.

    Returns
    -------
    List[RecommendationSummaryItem] — all stored recommendation summaries.
    """
    recs = recommendation_service.get_all_recommendations(db=db)
    return [
        RecommendationSummaryItem(
            id=r.id,
            inventory_id=r.inventory_id,
            material_type=r.material_type,
            waste_category=r.waste_category,
            condition=r.condition,
            recommendation=r.recommendation,
            priority=r.priority,
            created_at=r.created_at,
        )
        for r in recs
    ]
