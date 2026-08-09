"""
Environmental Assessment Schemas — Milestone 4 (Environmental Impact Assessment Engine)

Pydantic v2 schemas for the Environmental Impact Assessment Engine API.

Schemas
-------
EnvironmentalGenerateRequest    — POST body: just the inventory_id
EnvironmentalImpactSummary      — KPI block (re-surfaced from sustainability_metrics)
EnvironmentalPerformanceRating  — rating band + score
EnvironmentalInsight            — single generated insight string
SustainabilityReportOut         — full structured report (all sections)
EnvironmentalImpactStats        — aggregate statistics response
EnvironmentalReportOut          — stored-report response (GET endpoints)
EnvironmentalReportListItem     — lightweight item for the list endpoint
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Request Schema ────────────────────────────────────────────────────────────

class EnvironmentalGenerateRequest(BaseModel):
    """
    Request body for POST /api/environmental/generate.

    The engine resolves all data from the existing sustainability_metrics
    and recycling_recommendations tables — no recalculation is performed.
    """

    inventory_id: int = Field(
        ...,
        gt=0,
        description="ID of the inventory item to assess.",
        examples=[1],
    )


# ── Environmental Impact Summary ──────────────────────────────────────────────

class EnvironmentalImpactSummary(BaseModel):
    """
    Key performance indicators surfaced from sustainability_metrics.

    All numerical values are READ — never recalculated — from the
    Sustainability Intelligence Engine's stored output.
    """

    co2_saved: float = Field(..., description="kg of CO₂ emissions avoided.")
    water_saved: float = Field(..., description="Litres of water conserved.")
    landfill_diversion: float = Field(..., description="% of weight diverted from landfill (0–100).")
    resource_recovery: float = Field(..., description="kg of material recovered.")
    sustainability_score: float = Field(..., description="Composite score 0–100.")
    circularity: str = Field(..., description="Circular economy contribution: Low / Medium / High.")
    recommendation_summary: List[str] = Field(
        ...,
        description="List of top recycling recommendation type names.",
    )

    class Config:
        from_attributes = True


# ── Environmental Performance Rating ─────────────────────────────────────────

class EnvironmentalPerformanceRating(BaseModel):
    """
    Banded environmental rating derived from the sustainability_score.

    Bands
    -----
    90–100   → Excellent
    75–89    → Very Good
    60–74    → Good
    40–59    → Fair
    < 40     → Needs Improvement
    """

    score: float = Field(..., description="Raw sustainability score (0–100).")
    rating: str = Field(
        ...,
        description=(
            "'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Needs Improvement'"
        ),
    )
    description: str = Field(..., description="Human-readable rating description.")

    class Config:
        from_attributes = True


# ── Environmental Impact Statistics ──────────────────────────────────────────

class EnvironmentalImpactStats(BaseModel):
    """
    Six-category statistical summary of environmental impact.

    Returned as a standalone section within the full report and
    also available as a top-level response block.
    """

    carbon_impact: float = Field(..., description="CO₂ saved (kg).")
    water_conservation: float = Field(..., description="Water saved (litres).")
    landfill_reduction: float = Field(..., description="Landfill diversion (%).")
    resource_recovery: float = Field(..., description="Material recovered (kg).")
    circular_economy_contribution: str = Field(
        ...,
        description="Qualitative circularity label: 'Low' | 'Medium' | 'High'.",
    )
    overall_sustainability_performance: float = Field(
        ...,
        description="Composite sustainability score (0–100).",
    )

    class Config:
        from_attributes = True


# ── Full Structured Sustainability Report ─────────────────────────────────────

class SustainabilityReportOut(BaseModel):
    """
    Full structured sustainability report returned by the generate endpoint.

    Sections
    --------
    1. material_information       — material, waste category, weight
    2. impact_summary             — KPIs from sustainability_metrics
    3. performance_rating         — banded score
    4. environmental_benefits     — CO₂, water, landfill, recovery detail strings
    5. impact_statistics          — six-category stats block
    6. insights                   — generated 3–5 insight strings
    7. metadata                   — generation date, inventory_id
    """

    # ── Identity ──────────────────────────────────────────────────────────────
    inventory_id: int
    material: str = Field(..., description="Material type (e.g. 'Cotton').")
    waste_category: str = Field(..., description="Waste category (e.g. 'Recyclable').")
    weight_kg: float = Field(..., description="Weight analysed (kg).")

    # ── Section 1: Impact Summary (KPIs) ─────────────────────────────────────
    co2_saved: float
    water_saved: float
    landfill_diversion: float
    resource_recovery: float
    sustainability_score: float
    circularity: str

    # ── Section 2: Recommendations ────────────────────────────────────────────
    recommendations: List[str] = Field(
        ...,
        description="Top recommendation type names (e.g. ['Donation', 'Fabric Reuse']).",
    )

    # ── Section 3: Performance Rating ─────────────────────────────────────────
    environmental_rating: str = Field(
        ...,
        description="Banded rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Needs Improvement'.",
    )

    # ── Section 4: Environmental Benefits (narrative strings) ─────────────────
    co2_benefit: str = Field(..., description="Narrative sentence for CO₂ impact.")
    water_benefit: str = Field(..., description="Narrative sentence for water impact.")
    landfill_benefit: str = Field(..., description="Narrative sentence for landfill impact.")
    recovery_benefit: str = Field(..., description="Narrative sentence for resource recovery.")

    # ── Section 5: Impact Statistics ─────────────────────────────────────────
    impact_statistics: EnvironmentalImpactStats

    # ── Section 6: Generated Insights ────────────────────────────────────────
    insights: List[str] = Field(..., description="3–5 automatically generated insights.")

    # ── Section 7: Summary Paragraph ─────────────────────────────────────────
    summary: str = Field(..., description="One-paragraph holistic assessment summary.")

    # ── Metadata ──────────────────────────────────────────────────────────────
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Stored Report Response (GET endpoints) ────────────────────────────────────

class EnvironmentalReportOut(BaseModel):
    """
    Full environmental report response — mirrors the sample response format
    documented in the feature specification.

    Returned by:
      POST /api/environmental/generate
      GET  /api/environmental/{inventory_id}
    """

    inventory_id: int
    material: str
    environmental_rating: str
    co2_saved: float
    water_saved: float
    landfill_diversion: float
    resource_recovery: float
    recommendations: List[str]
    insights: List[str]
    summary: str
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Lightweight List Item ─────────────────────────────────────────────────────

class EnvironmentalReportListItem(BaseModel):
    """
    Lightweight summary used in GET /api/environmental (global list).

    Returns one row per environmental report — suitable for paginated tables.
    """

    id: int
    inventory_id: int
    environmental_rating: str
    summary: str
    report_generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
