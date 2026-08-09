"""
Recommendation Schemas — Milestone 4

Pydantic v2 schemas for the Recycling Recommendation Engine API.

Schemas
-------
RecommendationGenerateRequest   — POST body: inventory_id (+ optional condition)
RecommendationItemOut           — single recommendation entry (one row)
RecommendationListResponse      — grouped response for one inventory item
RecommendationSummaryItem       — lightweight entry for the global list endpoint
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Request Schema ────────────────────────────────────────────────────────────

class RecommendationGenerateRequest(BaseModel):
    """
    Request body for POST /api/recommendation/generate.

    The engine resolves material_type and waste_category from the stored
    inventory + classification data.  ``condition`` is optional — when
    provided it refines the recommendations (Good → Donation preferred;
    Poor → Fiber Recycling prioritised).
    """

    inventory_id: int = Field(
        ...,
        gt=0,
        description="ID of the inventory item to generate recommendations for.",
        examples=[1],
    )
    condition: Optional[str] = Field(
        None,
        description=(
            "Optional material condition: "
            "'Excellent' | 'Good' | 'Fair' | 'Poor'. "
            "Influences which recommendations are prioritised."
        ),
        examples=["Good"],
    )


# ── Single Recommendation Item ────────────────────────────────────────────────

class RecommendationItemOut(BaseModel):
    """
    A single recycling recommendation entry.

    Designed for React dashboard components:
      • Recommendation Cards  — type + priority + description
      • Detail Modals         — reason + environmental_benefit
      • Priority Badges       — colour-code using ``priority``
      • Recommendation Tables — one row per RecommendationItemOut
    """

    id: int = Field(..., description="Database primary key of this recommendation.")
    recommendation: str = Field(
        ...,
        description=(
            "Recommendation type: "
            "'Fiber Recycling' | 'Mechanical Recycling' | 'Chemical Recycling' | "
            "'Fabric Reuse' | 'Upcycling' | 'Donation' | 'Industrial Recovery'"
        ),
    )
    priority: str = Field(
        ...,
        description="Execution priority: 'High' | 'Medium' | 'Low'",
    )
    description: str = Field(..., description="What this recommendation involves.")
    reason: str = Field(..., description="Why this recommendation applies to this item.")
    environmental_benefit: str = Field(
        ..., description="Expected environmental benefit of following this recommendation."
    )
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Full Grouped Response (per inventory item) ────────────────────────────────

class RecommendationListResponse(BaseModel):
    """
    Full recommendation response for one inventory item.

    Returned by:
      POST /api/recommendation/generate
      GET  /api/recommendation/{inventory_id}

    The ``recommendations`` list is ordered by priority (High first).
    """

    inventory_id: int = Field(..., description="Inventory item that was analysed.")
    material: str = Field(..., description="Resolved material type (e.g. 'Cotton').")
    waste_category: str = Field(..., description="Resolved waste category (e.g. 'Recyclable').")
    condition: Optional[str] = Field(
        None, description="Material condition provided at generation time, if any."
    )
    recommendation_count: int = Field(
        ..., description="Total number of recommendations generated."
    )
    recommendations: List[RecommendationItemOut] = Field(
        ..., description="Ordered list of recycling recommendations (High priority first)."
    )

    class Config:
        from_attributes = True


# ── Lightweight Summary Item (global list endpoint) ───────────────────────────

class RecommendationSummaryItem(BaseModel):
    """
    Lightweight summary used in GET /api/recommendation (global list).

    Returns one row per recommendation record — suitable for paginated
    data tables and export views.
    """

    id: int
    inventory_id: int
    material_type: str
    waste_category: str
    condition: Optional[str] = None
    recommendation: str
    priority: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
