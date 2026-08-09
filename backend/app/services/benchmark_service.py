"""
Sustainability Benchmarking Service — Milestone 3 (Extension)

Compares a specific inventory item's sustainability metrics against
platform-wide historical averages calculated from all stored
sustainability_metrics records.

────────────────────────────────────────────────────────────────────
Architecture
────────────────────────────────────────────────────────────────────

This service is purposely decoupled from sustainability_service.py.
It ONLY reads from the sustainability_metrics table — it NEVER
recalculates or modifies existing metrics.

Public API
----------
calculate_platform_averages(db)
    → PlatformAverages dataclass

compare_with_average(current_value, average_value)
    → MetricComparison (current, average, difference, status)

generate_benchmark_report(inventory_id, db)
    → BenchmarkReport dataclass (full response payload)

generate_overall_rating(above_count, below_count, total)
    → str  ("Excellent …" / "Good …" / "Average …" / "Needs Improvement")

────────────────────────────────────────────────────────────────────
Design decisions
────────────────────────────────────────────────────────────────────

• Minimum records threshold (MIN_RECORDS_FOR_BENCHMARK = 2).
  If fewer records exist the service returns a graceful "unavailable"
  response instead of raising a server error.

• The current inventory's own record IS included in the averages,
  consistent with standard "rolling" benchmarking practice.  When
  only one record exists this matches the threshold check above.

• All threshold logic lives in _classify_status() so it can be
  tuned centrally.

• No SQLAlchemy func imports are duplicated — aggregations use a
  single query with func.avg().
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.sustainability_metric import SustainabilityMetric

logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ════════════════════════════════════════════════════════════════════

# Minimum number of stored metric records required before a
# meaningful benchmark can be generated.
MIN_RECORDS_FOR_BENCHMARK: int = 2

# Tolerance band: if |difference / average| ≤ this fraction,
# the metric is considered "Average" rather than above/below.
AVERAGE_TOLERANCE_FRACTION: float = 0.05   # 5%


# ════════════════════════════════════════════════════════════════════
# INTERNAL DATA STRUCTURES
# ════════════════════════════════════════════════════════════════════

@dataclass
class PlatformAverages:
    """Aggregated platform-wide averages from all stored metrics."""
    avg_co2_saved: float
    avg_water_saved: float
    avg_resource_recovery: float
    avg_landfill_diverted: float
    avg_sustainability_score: float
    record_count: int


@dataclass
class MetricComparison:
    """
    Single-metric comparison result.

    Attributes
    ----------
    current    : The value from the current inventory item.
    average    : Platform-wide average for this metric.
    difference : current − average  (positive = above, negative = below).
    status     : "Above Average" | "Average" | "Below Average"
    """
    current: float
    average: float
    difference: float
    status: str


@dataclass
class BenchmarkReport:
    """
    Full benchmark report returned by the API endpoint.

    ``available`` is False when there are insufficient historical
    records — in that case all metric fields are None and
    ``message`` explains why.
    """
    inventory_id: int
    available: bool
    message: str
    record_count: int

    # Per-metric comparisons (None when unavailable)
    co2: Optional[MetricComparison]
    water: Optional[MetricComparison]
    resource_recovery: Optional[MetricComparison]
    landfill_diversion: Optional[MetricComparison]
    sustainability_score: Optional[MetricComparison]

    # Aggregate rating (None when unavailable)
    overall_rating: Optional[str]


# ════════════════════════════════════════════════════════════════════
# 1. PLATFORM AVERAGES
# ════════════════════════════════════════════════════════════════════

def calculate_platform_averages(db: Session) -> Optional[PlatformAverages]:
    """
    Calculate platform-wide average KPIs from all stored
    sustainability_metrics records using a single aggregation query.

    Returns None if there are fewer than MIN_RECORDS_FOR_BENCHMARK
    records, indicating a benchmark cannot be generated.

    Parameters
    ----------
    db : SQLAlchemy session.

    Returns
    -------
    PlatformAverages | None
    """
    result = db.query(
        func.count(SustainabilityMetric.id).label("count"),
        func.avg(SustainabilityMetric.co2_saved).label("avg_co2"),
        func.avg(SustainabilityMetric.water_saved).label("avg_water"),
        func.avg(SustainabilityMetric.resource_recovery).label("avg_recovery"),
        func.avg(SustainabilityMetric.landfill_diverted).label("avg_landfill"),
        func.avg(SustainabilityMetric.sustainability_score).label("avg_score"),
    ).one()

    count = result.count or 0

    if count < MIN_RECORDS_FOR_BENCHMARK:
        logger.info(
            "Benchmark unavailable: only %d record(s) exist (minimum %d required).",
            count, MIN_RECORDS_FOR_BENCHMARK,
        )
        return None

    return PlatformAverages(
        avg_co2_saved=round(float(result.avg_co2 or 0), 2),
        avg_water_saved=round(float(result.avg_water or 0), 2),
        avg_resource_recovery=round(float(result.avg_recovery or 0), 2),
        avg_landfill_diverted=round(float(result.avg_landfill or 0), 2),
        avg_sustainability_score=round(float(result.avg_score or 0), 2),
        record_count=count,
    )


# ════════════════════════════════════════════════════════════════════
# 2. SINGLE-METRIC COMPARISON
# ════════════════════════════════════════════════════════════════════

def _classify_status(current: float, average: float) -> str:
    """
    Determine benchmark status for a single metric.

    Status is "Average" when the relative deviation from the platform
    average is within AVERAGE_TOLERANCE_FRACTION (default 5%).

    Parameters
    ----------
    current : Current inventory metric value.
    average : Platform average for the same metric.

    Returns
    -------
    str — "Above Average" | "Average" | "Below Average"
    """
    if average == 0:
        # Avoid division by zero: if average is 0, any positive value
        # is "Above Average", zero is "Average".
        return "Above Average" if current > 0 else "Average"

    relative_diff = (current - average) / abs(average)

    if abs(relative_diff) <= AVERAGE_TOLERANCE_FRACTION:
        return "Average"
    elif relative_diff > 0:
        return "Above Average"
    else:
        return "Below Average"


def compare_with_average(
    current_value: float,
    average_value: float,
) -> MetricComparison:
    """
    Compare a single current metric value against the platform average.

    Parameters
    ----------
    current_value : Value from the current inventory item.
    average_value : Platform-wide average for this metric.

    Returns
    -------
    MetricComparison — with rounded difference and classified status.
    """
    difference = round(current_value - average_value, 2)
    status = _classify_status(current_value, average_value)

    return MetricComparison(
        current=round(current_value, 2),
        average=round(average_value, 2),
        difference=difference,
        status=status,
    )


# ════════════════════════════════════════════════════════════════════
# 3. OVERALL RATING
# ════════════════════════════════════════════════════════════════════

def generate_overall_rating(
    above_count: int,
    average_count: int,
    below_count: int,
    total: int,
) -> str:
    """
    Generate a single qualitative rating that summarises performance
    across all benchmarked metrics.

    Rules (applied in order of precedence)
    ---------------------------------------
    All above average                       → "Excellent Sustainability Performance"
    ≥ 60% above average (and none below)    → "Good Sustainability Performance"
    Mostly average (below < 2)              → "Average Sustainability Performance"
    Anything else (≥ 2 below average)       → "Needs Improvement"

    Parameters
    ----------
    above_count   : Number of metrics rated "Above Average".
    average_count : Number of metrics rated "Average".
    below_count   : Number of metrics rated "Below Average".
    total         : Total number of metrics compared.

    Returns
    -------
    str — Human-readable overall rating.
    """
    if total == 0:
        return "Insufficient Data"

    if below_count == 0 and above_count == total:
        return "Excellent Sustainability Performance"

    if below_count == 0 and above_count >= round(total * 0.60):
        return "Good Sustainability Performance"

    if below_count < 2:
        return "Average Sustainability Performance"

    return "Needs Improvement"


# ════════════════════════════════════════════════════════════════════
# 4. MAIN ORCHESTRATOR
# ════════════════════════════════════════════════════════════════════

def generate_benchmark_report(
    inventory_id: int,
    db: Session,
) -> BenchmarkReport:
    """
    Main entry point for the Benchmarking Service.

    Steps
    -----
    1. Fetch the stored sustainability metric for this inventory item.
    2. Calculate platform-wide averages from all stored records.
    3. If insufficient data → return a graceful unavailable report.
    4. Compare each KPI against its platform average.
    5. Generate an overall rating.
    6. Return a fully populated BenchmarkReport.

    Parameters
    ----------
    inventory_id : The inventory item whose metrics to benchmark.
    db           : Active SQLAlchemy session.

    Returns
    -------
    BenchmarkReport — always returned (never raises for insufficient data).

    Raises
    ------
    ValueError — if no sustainability metric exists for inventory_id.
    """
    # ── Step 1: Fetch current metric ──────────────────────────────────────────
    current = (
        db.query(SustainabilityMetric)
        .filter(SustainabilityMetric.inventory_id == inventory_id)
        .first()
    )
    if current is None:
        raise ValueError(
            f"No sustainability metrics found for inventory_id={inventory_id}. "
            "Run POST /api/sustainability/calculate first."
        )

    # ── Step 2: Platform averages ─────────────────────────────────────────────
    averages = calculate_platform_averages(db)

    # ── Step 3: Insufficient data guard ───────────────────────────────────────
    if averages is None:
        return BenchmarkReport(
            inventory_id=inventory_id,
            available=False,
            message=(
                "Benchmark unavailable. More sustainability analyses are required. "
                f"At least {MIN_RECORDS_FOR_BENCHMARK} records are needed."
            ),
            record_count=0,
            co2=None,
            water=None,
            resource_recovery=None,
            landfill_diversion=None,
            sustainability_score=None,
            overall_rating=None,
        )

    # ── Step 4: Per-metric comparisons ────────────────────────────────────────
    co2_cmp = compare_with_average(current.co2_saved, averages.avg_co2_saved)
    water_cmp = compare_with_average(current.water_saved, averages.avg_water_saved)
    recovery_cmp = compare_with_average(current.resource_recovery, averages.avg_resource_recovery)
    landfill_cmp = compare_with_average(current.landfill_diverted, averages.avg_landfill_diverted)
    score_cmp = compare_with_average(current.sustainability_score, averages.avg_sustainability_score)

    all_comparisons = [co2_cmp, water_cmp, recovery_cmp, landfill_cmp, score_cmp]

    # ── Step 5: Overall rating ────────────────────────────────────────────────
    above_count   = sum(1 for c in all_comparisons if c.status == "Above Average")
    average_count = sum(1 for c in all_comparisons if c.status == "Average")
    below_count   = sum(1 for c in all_comparisons if c.status == "Below Average")

    overall = generate_overall_rating(
        above_count=above_count,
        average_count=average_count,
        below_count=below_count,
        total=len(all_comparisons),
    )

    logger.info(
        "Benchmark generated: inventory_id=%s overall_rating=%r "
        "above=%d average=%d below=%d",
        inventory_id, overall, above_count, average_count, below_count,
    )

    # ── Step 6: Return full report ────────────────────────────────────────────
    return BenchmarkReport(
        inventory_id=inventory_id,
        available=True,
        message="Benchmark generated successfully.",
        record_count=averages.record_count,
        co2=co2_cmp,
        water=water_cmp,
        resource_recovery=recovery_cmp,
        landfill_diversion=landfill_cmp,
        sustainability_score=score_cmp,
        overall_rating=overall,
    )
