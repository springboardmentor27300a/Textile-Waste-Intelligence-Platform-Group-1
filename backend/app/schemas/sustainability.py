"""
Sustainability Schemas — Milestone 3

Pydantic v2 schemas for the Sustainability Intelligence Engine API.

Schemas
-------
SustainabilityCalculateRequest  — POST body: just the inventory_id
SustainabilityMetricOut         — full response returned after calculation / retrieval
SustainabilityListItem          — lightweight entry for the list endpoint

Benchmarking Schemas (Milestone 3 — Benchmarking Extension)
------------------------------------------------------------
MetricComparisonOut             — single-metric benchmark card (current / average / diff / status)
BenchmarkReportOut              — full benchmark envelope for GET /benchmark/{inventory_id}
BenchmarkUnavailableOut         — graceful response when insufficient data exists
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Request Schema ────────────────────────────────────────────────────────────

class SustainabilityCalculateRequest(BaseModel):
    """
    Request body for POST /api/sustainability/calculate.

    The engine looks up the inventory item and uses its material_type
    and quantity_kg alongside the waste classifier to derive all metrics.
    """
    inventory_id: int = Field(
        ...,
        gt=0,
        description="ID of the inventory item to analyse.",
        examples=[1],
    )


# ── Response Schemas ──────────────────────────────────────────────────────────

class SustainabilityMetricOut(BaseModel):
    """
    Full sustainability metric response.

    Returned by both the calculate endpoint and the per-item GET endpoint.
    """
    id: int
    inventory_id: int

    # Snapshot inputs
    material: str = Field(..., description="Material type (e.g. 'Cotton')")
    waste_category: str = Field(..., description="Waste category (e.g. 'Recyclable')")
    weight_kg: float = Field(..., description="Weight analysed in kilograms")

    # Computed KPIs
    co2_saved: float = Field(..., description="kg of CO₂ emissions avoided")
    water_saved: float = Field(..., description="Litres of water saved")
    landfill_diverted: float = Field(..., description="% of weight diverted from landfill")
    resource_recovery: float = Field(..., description="kg of material recovered")
    circularity: str = Field(..., description="Circular economy contribution: Low / Medium / High")
    sustainability_score: float = Field(..., description="Composite score 0–100")

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_metric(cls, metric) -> "SustainabilityMetricOut":
        """
        Factory method: build response from a SustainabilityMetric ORM instance.

        Maps the ORM's ``circularity_score`` field to the API's ``circularity``
        field to keep the public contract clean.
        """
        return cls(
            id=metric.id,
            inventory_id=metric.inventory_id,
            material=metric.material_type,
            waste_category=metric.waste_category,
            weight_kg=metric.weight_kg,
            co2_saved=metric.co2_saved,
            water_saved=metric.water_saved,
            landfill_diverted=metric.landfill_diverted,
            resource_recovery=metric.resource_recovery,
            circularity=metric.circularity_score,
            sustainability_score=metric.sustainability_score,
            created_at=metric.created_at,
        )


class SustainabilityListItem(BaseModel):
    """
    Lightweight item used in GET /api/sustainability (list endpoint).
    """
    id: int
    inventory_id: int
    material: str
    waste_category: str
    weight_kg: float
    sustainability_score: float
    circularity: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ════════════════════════════════════════════════════════════════════
# BENCHMARKING SCHEMAS  (Milestone 3 — Sustainability Benchmarking Extension)
# These schemas are NEW — no existing schema has been modified.
# ════════════════════════════════════════════════════════════════════


class MetricComparisonOut(BaseModel):
    """
    Single-metric benchmark comparison card.

    Designed for React dashboard components:
      • Comparison Cards   — show current vs. average side-by-side
      • Progress Bars      — use ``current`` and ``average`` as bar values
      • Performance Badges — colour-code using ``status``
      • Benchmark Tables   — one row per MetricComparisonOut
      • Future Charts      — historical trend data can be layered on top

    Fields
    ------
    current    : The metric value for the inventory item being benchmarked.
    average    : Platform-wide average for this metric (across all records).
    difference : current − average  (positive = above average).
    status     : "Above Average" | "Average" | "Below Average"
    """

    current: float = Field(..., description="Current inventory item metric value.")
    average: float = Field(..., description="Platform-wide average for this metric.")
    difference: float = Field(
        ...,
        description="current − average. Positive means above average.",
    )
    status: str = Field(
        ...,
        description='"Above Average" | "Average" | "Below Average"',
    )

    class Config:
        from_attributes = True


class BenchmarkReportOut(BaseModel):
    """
    Full benchmark report envelope.

    Returned by GET /api/sustainability/benchmark/{inventory_id}.

    When ``available`` is True all metric fields are populated.
    When ``available`` is False (insufficient historical data) only
    ``inventory_id``, ``available``, and ``message`` are set;
    all metric fields are None and ``overall_rating`` is None.

    Dashboard support
    -----------------
    • ``co2``                 — CO₂ savings comparison card
    • ``water``               — water savings comparison card
    • ``resource_recovery``   — material recovery comparison card
    • ``landfill_diversion``  — landfill diversion comparison card
    • ``sustainability_score`` — composite score comparison card
    • ``overall_rating``      — summary badge / header chip
    • ``record_count``        — drives "based on N analyses" copy
    • ``message``             — human-readable status for toasts/banners
    """

    inventory_id: int = Field(..., description="Inventory item that was benchmarked.")
    available: bool = Field(
        ...,
        description="False when there is insufficient historical data for benchmarking.",
    )
    message: str = Field(..., description="Human-readable status or error message.")
    record_count: int = Field(
        ...,
        description="Number of historical records used to compute averages.",
    )

    # Per-metric comparisons — None only when available=False
    co2: Optional[MetricComparisonOut] = Field(
        None,
        description="CO₂ savings benchmark comparison.",
    )
    water: Optional[MetricComparisonOut] = Field(
        None,
        description="Water savings benchmark comparison.",
    )
    resource_recovery: Optional[MetricComparisonOut] = Field(
        None,
        description="Resource recovery benchmark comparison.",
    )
    landfill_diversion: Optional[MetricComparisonOut] = Field(
        None,
        description="Landfill diversion benchmark comparison.",
    )
    sustainability_score: Optional[MetricComparisonOut] = Field(
        None,
        description="Composite sustainability score benchmark comparison.",
    )

    # Aggregate summary — None only when available=False
    overall_rating: Optional[str] = Field(
        None,
        description=(
            "Overall performance rating: "
            "'Excellent Sustainability Performance' | "
            "'Good Sustainability Performance' | "
            "'Average Sustainability Performance' | "
            "'Needs Improvement'"
        ),
    )

    class Config:
        from_attributes = True

    @classmethod
    def from_benchmark_report(cls, report) -> "BenchmarkReportOut":
        """
        Factory: convert a BenchmarkReport service-layer dataclass to this
        Pydantic response model without coupling the router to service internals.

        Parameters
        ----------
        report : BenchmarkReport dataclass from benchmark_service.py

        Returns
        -------
        BenchmarkReportOut
        """

        def _map_comparison(cmp) -> Optional[MetricComparisonOut]:
            """Convert a MetricComparison dataclass to MetricComparisonOut, or None."""
            if cmp is None:
                return None
            return MetricComparisonOut(
                current=cmp.current,
                average=cmp.average,
                difference=cmp.difference,
                status=cmp.status,
            )

        return cls(
            inventory_id=report.inventory_id,
            available=report.available,
            message=report.message,
            record_count=report.record_count,
            co2=_map_comparison(report.co2),
            water=_map_comparison(report.water),
            resource_recovery=_map_comparison(report.resource_recovery),
            landfill_diversion=_map_comparison(report.landfill_diversion),
            sustainability_score=_map_comparison(report.sustainability_score),
            overall_rating=report.overall_rating,
        )
