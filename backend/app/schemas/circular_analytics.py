"""
Circular Analytics Schemas — Milestone 3 (Circular Economy Analytics Engine)

Pydantic v2 schemas for the Circular Economy Analytics Engine API.

Schemas
-------
CircularAnalyticsGenerateResponse  — POST /generate  full analytics response
CircularAnalyticsLatestResponse    — GET  /latest     same shape, latest snapshot
CircularAnalyticsHistoryItem       — GET  /history    lightweight list row
CircularStatistics                 — aggregate KPI block
CircularWasteCategoryStats         — one row of the waste-category breakdown
CircularInsight                    — single insight string (internal helper)
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ── Waste-Category Breakdown ──────────────────────────────────────────────────

class CircularWasteCategoryStats(BaseModel):
    """Count and percentage share for a single waste category."""

    category: str = Field(..., description="Waste category name.")
    count: int = Field(..., description="Number of inventory items in this category.")
    percentage: float = Field(
        ...,
        description="Percentage share of all items (0–100, rounded to 2 dp).",
    )

    class Config:
        from_attributes = True


# ── Aggregate Statistics Block ────────────────────────────────────────────────

class CircularStatistics(BaseModel):
    """
    Platform-level aggregate statistics aggregated from sustainability_metrics
    and environmental_reports.

    All values are READ — never recalculated — from stored engine outputs.
    """

    # Totals
    total_items: int = Field(..., description="Total inventory items processed.")
    total_co2_saved: float = Field(..., description="Sum of CO₂ saved across all items (kg).")
    total_water_saved: float = Field(..., description="Sum of water saved across all items (litres).")
    total_resource_recovery: float = Field(..., description="Sum of resource recovery across all items (kg).")
    total_landfill_reduction: float = Field(..., description="Sum of landfill diverted across all items (% × count, normalised).")

    # Averages
    average_sustainability_score: float = Field(..., description="Mean sustainability score (0–100).")
    average_circularity_score: float = Field(
        ...,
        description=(
            "Mean circularity score derived from circularity_score labels "
            "(Low=33, Medium=66, High=100) across all items (0–100)."
        ),
    )
    average_resource_recovery: float = Field(..., description="Mean resource recovery per item (kg).")
    average_landfill_diversion: float = Field(..., description="Mean landfill diversion percentage (0–100).")

    # Environmental extremes
    highest_co2_saved: float = Field(..., description="Highest CO₂ saved by a single item (kg).")
    lowest_co2_saved: float = Field(..., description="Lowest CO₂ saved by a single item (kg).")
    average_co2_saved: float = Field(..., description="Mean CO₂ saved per item (kg).")
    highest_water_saved: float = Field(..., description="Highest water saved by a single item (litres).")
    lowest_water_saved: float = Field(..., description="Lowest water saved by a single item (litres).")
    average_water_saved: float = Field(..., description="Mean water saved per item (litres).")

    class Config:
        from_attributes = True


# ── Full Analytics Response ───────────────────────────────────────────────────

class CircularAnalyticsGenerateResponse(BaseModel):
    """
    Full circular economy analytics response.

    Returned by:
      POST /api/circular-analytics/generate
      GET  /api/circular-analytics/latest

    The response mirrors the sample response format from the feature spec and
    includes all seven analytics blocks specified in the requirements.
    """

    # ── Snapshot metadata ─────────────────────────────────────────────────────
    generated_at: datetime = Field(..., description="UTC timestamp of when this snapshot was generated.")
    overall_rating: str = Field(
        ...,
        description=(
            "'Excellent Circular Economy Performance' | "
            "'Good Circular Economy Performance' | "
            "'Average Circular Economy Performance' | "
            "'Needs Improvement'"
        ),
    )
    summary: str = Field(..., description="One-paragraph platform-level summary narrative.")

    # ── Aggregate statistics ──────────────────────────────────────────────────
    statistics: CircularStatistics = Field(..., description="Platform-wide aggregate KPI block.")

    # ── Distributions ─────────────────────────────────────────────────────────
    material_distribution: Dict[str, int] = Field(
        ...,
        description="Count of items per material type (e.g. {'Cotton': 42, 'Polyester': 26}).",
    )
    recommendation_distribution: Dict[str, int] = Field(
        ...,
        description="Count of recommendations per type (e.g. {'Mechanical Recycling': 34}).",
    )

    # ── Waste category breakdown ──────────────────────────────────────────────
    waste_category_breakdown: List[CircularWasteCategoryStats] = Field(
        ...,
        description="Count and percentage share per waste category.",
    )

    # ── Material analytics ────────────────────────────────────────────────────
    most_common_material: Optional[str] = Field(
        None,
        description="Material type with the highest inventory count.",
    )
    least_common_material: Optional[str] = Field(
        None,
        description="Material type with the lowest inventory count.",
    )

    # ── Circular economy insights ─────────────────────────────────────────────
    generated_insights: List[str] = Field(
        ...,
        description="5–10 dynamically generated insights from live project data.",
    )

    class Config:
        from_attributes = True


# ── History List Item ─────────────────────────────────────────────────────────

class CircularAnalyticsHistoryItem(BaseModel):
    """
    Lightweight summary row for GET /api/circular-analytics/history.

    Returns one row per stored analytics snapshot — suitable for paginated tables
    and audit logs. Full details are available through /latest or per-ID endpoints.
    """

    id: int = Field(..., description="Primary key of this analytics snapshot.")
    generated_at: datetime = Field(..., description="When this snapshot was generated.")
    total_items: int = Field(..., description="Number of items included in this snapshot.")
    overall_rating: str = Field(..., description="Circular economy performance rating.")
    summary: str = Field(..., description="One-paragraph narrative summary.")
    generated_insights: List[str] = Field(
        ...,
        description="5–10 insights generated at the time of the snapshot.",
    )

    class Config:
        from_attributes = True
