"""
Circular Economy Analytics Service — Milestone 3 (Circular Economy Analytics Engine)

All business logic for the Circular Economy Analytics Engine lives here.
Routers MUST NOT perform any calculations — they delegate entirely to the
functions exposed in this module.

────────────────────────────────────────────────────────────────────
Architecture
────────────────────────────────────────────────────────────────────

Data Sources (read-only — no recalculation)
    inventory                  — material_type, quantity_kg, status
    sustainability_metrics     — co2_saved, water_saved, landfill_diverted,
                                 resource_recovery, circularity_score,
                                 sustainability_score, waste_category
    recycling_recommendations  — recommendation (type name)
    environmental_reports      — environmental_rating, summary (metadata only)

Pure helper functions
    _circularity_label_to_score()    — convert 'Low'/'Medium'/'High' → numeric
    _build_statistics()              — compute all aggregate KPI statistics
    _build_material_distribution()   — count items per material type
    _build_recommendation_distribution() — count recs per type
    _build_waste_category_breakdown()— count + % share per waste category
    _derive_overall_rating()         — map avg score → performance band
    _generate_insights()             — produce 5–10 data-driven insights
    _build_summary()                 — compose one-paragraph narrative
    _build_empty_analytics()         — graceful empty response with no data

Orchestrators
    generate_analytics()    — main POST entry point; persists metadata, returns full dict
    get_latest_analytics()  — GET /latest; returns most recently persisted snapshot
    get_analytics_history() — GET /history; returns all stored metadata rows

Rating Thresholds (configurable constants at module level)
    EXCELLENT_THRESHOLD = 85.0
    GOOD_THRESHOLD      = 70.0
    AVERAGE_THRESHOLD   = 50.0
    Below AVERAGE_THRESHOLD → 'Needs Improvement'
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import json
import logging
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.circular_economy import CircularEconomyAnalytics
from app.models.inventory import Inventory
from app.models.sustainability_metric import SustainabilityMetric
from app.models.recycling_recommendation import RecyclingRecommendation
from app.models.environmental_report import EnvironmentalReport

logger = logging.getLogger(__name__)


# ====================================================================
# 1. RATING THRESHOLDS — Configurable
#    85–100  → Excellent Circular Economy Performance
#    70–84   → Good Circular Economy Performance
#    50–69   → Average Circular Economy Performance
#    < 50    → Needs Improvement
# ====================================================================

EXCELLENT_THRESHOLD: float = 85.0
GOOD_THRESHOLD: float = 70.0
AVERAGE_THRESHOLD: float = 50.0

RATING_EXCELLENT = "Excellent Circular Economy Performance"
RATING_GOOD = "Good Circular Economy Performance"
RATING_AVERAGE = "Average Circular Economy Performance"
RATING_NEEDS_IMPROVEMENT = "Needs Improvement"

# Circularity label → numeric score mapping
_CIRCULARITY_SCORE_MAP: Dict[str, float] = {
    "low": 33.0,
    "medium": 66.0,
    "high": 100.0,
}


# ====================================================================
# 2. PURE HELPER FUNCTIONS
# ====================================================================

def _circularity_label_to_score(label: str) -> float:
    """
    Convert a qualitative circularity label into a numeric score (0–100).

    Parameters
    ----------
    label : str
        One of 'Low', 'Medium', 'High' (case-insensitive).

    Returns
    -------
    float
        Mapped numeric score: Low → 33, Medium → 66, High → 100.
        Defaults to 0.0 for unrecognised labels.
    """
    return _CIRCULARITY_SCORE_MAP.get(label.strip().lower(), 0.0)


def _safe_round(value: float, decimals: int = 2) -> float:
    """Round a float to `decimals` places, returning 0.0 for NaN/Inf."""
    try:
        result = round(value, decimals)
        return result if result == result else 0.0  # NaN guard
    except (TypeError, ValueError):
        return 0.0


def _derive_overall_rating(avg_sustainability_score: float) -> str:
    """
    Map the platform-wide average sustainability score to a circular economy
    performance band.

    Bands (configurable via module-level threshold constants)
    ---------------------------------------------------------
    ≥ EXCELLENT_THRESHOLD (85)  → Excellent Circular Economy Performance
    ≥ GOOD_THRESHOLD (70)       → Good Circular Economy Performance
    ≥ AVERAGE_THRESHOLD (50)    → Average Circular Economy Performance
    < AVERAGE_THRESHOLD         → Needs Improvement

    Parameters
    ----------
    avg_sustainability_score : float
        Platform-wide mean sustainability score (0–100).

    Returns
    -------
    str
        One of the four RATING_* constants.
    """
    if avg_sustainability_score >= EXCELLENT_THRESHOLD:
        return RATING_EXCELLENT
    if avg_sustainability_score >= GOOD_THRESHOLD:
        return RATING_GOOD
    if avg_sustainability_score >= AVERAGE_THRESHOLD:
        return RATING_AVERAGE
    return RATING_NEEDS_IMPROVEMENT


def _build_statistics(metrics: List[SustainabilityMetric]) -> Dict[str, Any]:
    """
    Compute the full aggregate statistics block from a list of SustainabilityMetric rows.

    Parameters
    ----------
    metrics : List[SustainabilityMetric]
        All sustainability_metric records to aggregate.

    Returns
    -------
    Dict[str, Any]
        Flat dictionary matching the CircularStatistics schema fields.
    """
    n = len(metrics)

    if n == 0:
        # Return zero-filled statistics when no data exists
        return {
            "total_items": 0,
            "total_co2_saved": 0.0,
            "total_water_saved": 0.0,
            "total_resource_recovery": 0.0,
            "total_landfill_reduction": 0.0,
            "average_sustainability_score": 0.0,
            "average_circularity_score": 0.0,
            "average_resource_recovery": 0.0,
            "average_landfill_diversion": 0.0,
            "highest_co2_saved": 0.0,
            "lowest_co2_saved": 0.0,
            "average_co2_saved": 0.0,
            "highest_water_saved": 0.0,
            "lowest_water_saved": 0.0,
            "average_water_saved": 0.0,
        }

    co2_values = [m.co2_saved for m in metrics]
    water_values = [m.water_saved for m in metrics]
    landfill_values = [m.landfill_diverted for m in metrics]
    recovery_values = [m.resource_recovery for m in metrics]
    sustainability_scores = [m.sustainability_score for m in metrics]
    circularity_scores = [_circularity_label_to_score(m.circularity_score) for m in metrics]

    total_co2 = sum(co2_values)
    total_water = sum(water_values)
    total_recovery = sum(recovery_values)
    total_landfill = sum(landfill_values)

    return {
        "total_items": n,
        "total_co2_saved": _safe_round(total_co2),
        "total_water_saved": _safe_round(total_water),
        "total_resource_recovery": _safe_round(total_recovery),
        "total_landfill_reduction": _safe_round(total_landfill),
        "average_sustainability_score": _safe_round(sum(sustainability_scores) / n),
        "average_circularity_score": _safe_round(sum(circularity_scores) / n),
        "average_resource_recovery": _safe_round(total_recovery / n),
        "average_landfill_diversion": _safe_round(sum(landfill_values) / n),
        "highest_co2_saved": _safe_round(max(co2_values)),
        "lowest_co2_saved": _safe_round(min(co2_values)),
        "average_co2_saved": _safe_round(total_co2 / n),
        "highest_water_saved": _safe_round(max(water_values)),
        "lowest_water_saved": _safe_round(min(water_values)),
        "average_water_saved": _safe_round(total_water / n),
    }


def _build_material_distribution(metrics: List[SustainabilityMetric]) -> Dict[str, int]:
    """
    Count inventory items per material type.

    Parameters
    ----------
    metrics : List[SustainabilityMetric]
        All sustainability_metric records (one per inventory item).

    Returns
    -------
    Dict[str, int]
        Mapping of material_type → item count, sorted descending by count.
    """
    counter: Counter = Counter(m.material_type for m in metrics)
    # Sort descending by count so the most common appears first
    return dict(counter.most_common())


def _build_recommendation_distribution(
    recommendations: List[RecyclingRecommendation],
) -> Dict[str, int]:
    """
    Count recycling recommendations per recommendation type.

    Parameters
    ----------
    recommendations : List[RecyclingRecommendation]
        All recycling_recommendation records from the database.

    Returns
    -------
    Dict[str, int]
        Mapping of recommendation type → count, sorted descending by count.
    """
    counter: Counter = Counter(r.recommendation for r in recommendations)
    return dict(counter.most_common())


def _build_waste_category_breakdown(
    metrics: List[SustainabilityMetric],
) -> List[Dict[str, Any]]:
    """
    Compute count and percentage share for each waste category.

    Parameters
    ----------
    metrics : List[SustainabilityMetric]
        All sustainability_metric records (one per inventory item).

    Returns
    -------
    List[Dict[str, Any]]
        List of dicts with keys: category, count, percentage.
        Sorted descending by count.
    """
    n = len(metrics)
    if n == 0:
        return []

    counter: Counter = Counter(m.waste_category for m in metrics)
    return [
        {
            "category": category,
            "count": count,
            "percentage": _safe_round((count / n) * 100),
        }
        for category, count in counter.most_common()
    ]


def _get_most_least_common_material(
    material_dist: Dict[str, int],
) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract the most and least common material types from a distribution dict.

    Parameters
    ----------
    material_dist : Dict[str, int]
        material_type → count mapping (already sorted descending by count).

    Returns
    -------
    Tuple[Optional[str], Optional[str]]
        (most_common_material, least_common_material).
        Both are None when the distribution is empty.
    """
    if not material_dist:
        return None, None
    items = list(material_dist.items())
    return items[0][0], items[-1][0]


def _generate_insights(
    stats: Dict[str, Any],
    material_dist: Dict[str, int],
    rec_dist: Dict[str, int],
    waste_breakdown: List[Dict[str, Any]],
    overall_rating: str,
) -> List[str]:
    """
    Generate 5–10 data-driven circular economy insights using live project data.

    Insights are constructed purely from aggregated statistics already computed —
    no re-fetching of database rows is performed here.

    Parameters
    ----------
    stats : Dict[str, Any]
        The computed statistics block (from _build_statistics).
    material_dist : Dict[str, int]
        Material type distribution (most common first).
    rec_dist : Dict[str, int]
        Recommendation type distribution (most common first).
    waste_breakdown : List[Dict[str, Any]]
        Waste category breakdown list.
    overall_rating : str
        Platform performance rating string.

    Returns
    -------
    List[str]
        A list of 5–10 natural-language insight strings.
    """
    insights: List[str] = []
    n = stats["total_items"]

    if n == 0:
        return [
            "No sustainability data is available yet. "
            "Run the Sustainability Intelligence Engine for inventory items to generate insights."
        ]

    # ── Insight 1: Most common material ──────────────────────────────────────
    if material_dist:
        top_material, top_count = next(iter(material_dist.items()))
        pct = _safe_round((top_count / n) * 100)
        insights.append(
            f"{top_material} is the most frequently processed textile material, "
            f"accounting for {pct}% of all inventory items ({top_count} items)."
        )

    # ── Insight 2: Top recycling recommendation ───────────────────────────────
    if rec_dist:
        top_rec, top_rec_count = next(iter(rec_dist.items()))
        insights.append(
            f"{top_rec} is the most frequently recommended recovery strategy, "
            f"appearing in {top_rec_count} recommendations across the platform."
        )

    # ── Insight 3: CO₂ savings narrative ─────────────────────────────────────
    total_co2 = stats["total_co2_saved"]
    avg_co2 = stats["average_co2_saved"]
    if total_co2 > 0:
        insights.append(
            f"The platform has collectively avoided {total_co2:.2f} kg of CO₂ emissions "
            f"through textile recycling and recovery activities, averaging {avg_co2:.2f} kg per item."
        )

    # ── Insight 4: Water conservation ────────────────────────────────────────
    total_water = stats["total_water_saved"]
    if total_water > 0:
        insights.append(
            f"A total of {total_water:.0f} litres of water have been conserved, "
            f"equivalent to significant fresh-water preservation through circular practices."
        )

    # ── Insight 5: Landfill diversion ────────────────────────────────────────
    avg_landfill = stats["average_landfill_diversion"]
    if avg_landfill > 0:
        insights.append(
            f"On average, {avg_landfill:.1f}% of textile waste weight is diverted from landfill, "
            f"demonstrating strong landfill-reduction performance across the platform."
        )

    # ── Insight 6: Dominant waste category ───────────────────────────────────
    if waste_breakdown:
        top_cat = waste_breakdown[0]
        insights.append(
            f"The majority ({top_cat['percentage']}%) of processed textile waste is classified as "
            f"'{top_cat['category']}', indicating strong circular economy alignment."
        )

    # ── Insight 7: Average sustainability score ───────────────────────────────
    avg_score = stats["average_sustainability_score"]
    insights.append(
        f"The platform's average sustainability score is {avg_score:.1f}/100, "
        f"reflecting {'outstanding' if avg_score >= 85 else 'strong' if avg_score >= 70 else 'moderate'} "
        f"overall environmental stewardship."
    )

    # ── Insight 8: Circularity score ─────────────────────────────────────────
    avg_circ = stats["average_circularity_score"]
    if avg_circ > 0:
        insights.append(
            f"The average circularity score across all items is {avg_circ:.1f}/100, "
            f"indicating {'high' if avg_circ >= 80 else 'moderate' if avg_circ >= 50 else 'developing'} "
            f"circular economy integration."
        )

    # ── Insight 9: Overall platform rating ───────────────────────────────────
    insights.append(
        f"Overall platform performance is rated '{overall_rating}', "
        f"based on aggregated sustainability metrics across {n} processed textile items."
    )

    # ── Insight 10: Resource recovery ────────────────────────────────────────
    total_recovery = stats["total_resource_recovery"]
    if total_recovery > 0:
        insights.append(
            f"A total of {total_recovery:.2f} kg of textile material has been recovered or repurposed, "
            f"contributing directly to circular material loops and reduced virgin resource demand."
        )

    # Return at most 10 insights
    return insights[:10]


def _build_summary(
    stats: Dict[str, Any],
    overall_rating: str,
    top_material: Optional[str],
    top_recommendation: Optional[str],
) -> str:
    """
    Compose a one-paragraph human-readable platform-level summary narrative.

    Parameters
    ----------
    stats : Dict[str, Any]
        Computed statistics block.
    overall_rating : str
        Platform-level performance rating.
    top_material : Optional[str]
        Most common material type (or None).
    top_recommendation : Optional[str]
        Most commonly recommended strategy (or None).

    Returns
    -------
    str
        A single coherent paragraph summarising circular economy performance.
    """
    n = stats["total_items"]
    if n == 0:
        return (
            "No sustainability or inventory data has been processed yet. "
            "Generate sustainability metrics and recycling recommendations for inventory items "
            "to enable circular economy analytics."
        )

    material_clause = f", with {top_material} as the dominant material" if top_material else ""
    rec_clause = (
        f" {top_recommendation} is the leading recommended recovery strategy."
        if top_recommendation
        else ""
    )

    return (
        f"The platform demonstrates {overall_rating.lower()} across {n} processed textile items"
        f"{material_clause}. "
        f"A total of {stats['total_co2_saved']:.2f} kg of CO₂ and "
        f"{stats['total_water_saved']:.0f} litres of water have been saved through circular practices, "
        f"with an average sustainability score of {stats['average_sustainability_score']:.1f}/100 "
        f"and an average landfill diversion rate of {stats['average_landfill_diversion']:.1f}%."
        f"{rec_clause} "
        f"Overall, the platform continues to advance circular economy objectives through "
        f"data-driven recycling and resource recovery strategies."
    )


def _build_empty_analytics() -> Dict[str, Any]:
    """
    Build a meaningful empty analytics response when no data exists.

    Returns a fully structured dict matching generate_analytics() output but
    with zero/empty values — ensures callers never receive a 500 for missing data.

    Returns
    -------
    Dict[str, Any]
        Empty analytics dict with correct structure.
    """
    now = datetime.now(tz=timezone.utc)
    return {
        "generated_at": now,
        "overall_rating": RATING_NEEDS_IMPROVEMENT,
        "summary": (
            "No sustainability data is available yet. "
            "Process inventory items through the Sustainability Intelligence Engine, "
            "Recycling Recommendation Engine, and Environmental Impact Assessment Engine "
            "to generate circular economy analytics."
        ),
        "statistics": {
            "total_items": 0,
            "total_co2_saved": 0.0,
            "total_water_saved": 0.0,
            "total_resource_recovery": 0.0,
            "total_landfill_reduction": 0.0,
            "average_sustainability_score": 0.0,
            "average_circularity_score": 0.0,
            "average_resource_recovery": 0.0,
            "average_landfill_diversion": 0.0,
            "highest_co2_saved": 0.0,
            "lowest_co2_saved": 0.0,
            "average_co2_saved": 0.0,
            "highest_water_saved": 0.0,
            "lowest_water_saved": 0.0,
            "average_water_saved": 0.0,
        },
        "material_distribution": {},
        "recommendation_distribution": {},
        "waste_category_breakdown": [],
        "most_common_material": None,
        "least_common_material": None,
        "generated_insights": [
            "No sustainability data is available yet. "
            "Run the Sustainability Intelligence Engine on inventory items to populate analytics."
        ],
    }


# ====================================================================
# 3. ORCHESTRATION FUNCTIONS
# ====================================================================

def generate_analytics(db: Session) -> Dict[str, Any]:
    """
    Generate a complete circular economy analytics snapshot and persist its metadata.

    This is the main entry point for POST /api/circular-analytics/generate.

    Steps
    -----
    1. Fetch all SustainabilityMetric rows (read-only aggregation).
    2. Fetch all RecyclingRecommendation rows (for recommendation distribution).
    3. Compute all analytics blocks using pure helper functions.
    4. Persist a new CircularEconomyAnalytics metadata row.
    5. Return the full analytics dictionary.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy database session (injected by FastAPI).

    Returns
    -------
    Dict[str, Any]
        Full analytics response dict matching CircularAnalyticsGenerateResponse.

    Raises
    ------
    RuntimeError
        On unexpected aggregation failure (propagated to 500 in the router).
    """
    try:
        # ── Step 1: Load source data (read-only) ──────────────────────────────
        metrics: List[SustainabilityMetric] = db.query(SustainabilityMetric).all()
        recommendations: List[RecyclingRecommendation] = db.query(RecyclingRecommendation).all()

        # ── Step 2: Handle empty data state ───────────────────────────────────
        if not metrics:
            logger.info(
                "[CircularAnalytics] No sustainability metrics found — returning empty analytics."
            )
            empty = _build_empty_analytics()
            # Still persist a metadata row so history endpoint shows the attempt
            _persist_analytics_metadata(
                db=db,
                total_items=0,
                overall_rating=empty["overall_rating"],
                summary=empty["summary"],
                insights=empty["generated_insights"],
            )
            return empty

        # ── Step 3: Compute all analytics blocks ──────────────────────────────
        stats = _build_statistics(metrics)
        material_dist = _build_material_distribution(metrics)
        rec_dist = _build_recommendation_distribution(recommendations)
        waste_breakdown = _build_waste_category_breakdown(metrics)
        most_common, least_common = _get_most_least_common_material(material_dist)

        overall_rating = _derive_overall_rating(stats["average_sustainability_score"])
        top_recommendation = next(iter(rec_dist), None)

        insights = _generate_insights(
            stats=stats,
            material_dist=material_dist,
            rec_dist=rec_dist,
            waste_breakdown=waste_breakdown,
            overall_rating=overall_rating,
        )
        summary = _build_summary(
            stats=stats,
            overall_rating=overall_rating,
            top_material=most_common,
            top_recommendation=top_recommendation,
        )

        # ── Step 4: Persist metadata ──────────────────────────────────────────
        _persist_analytics_metadata(
            db=db,
            total_items=stats["total_items"],
            overall_rating=overall_rating,
            summary=summary,
            insights=insights,
        )

        # ── Step 5: Build and return response dict ────────────────────────────
        return {
            "generated_at": datetime.now(tz=timezone.utc),
            "overall_rating": overall_rating,
            "summary": summary,
            "statistics": stats,
            "material_distribution": material_dist,
            "recommendation_distribution": rec_dist,
            "waste_category_breakdown": waste_breakdown,
            "most_common_material": most_common,
            "least_common_material": least_common,
            "generated_insights": insights,
        }

    except Exception as exc:
        logger.exception("[CircularAnalytics] Unexpected failure in generate_analytics: %s", exc)
        raise RuntimeError(f"Circular economy analytics generation failed: {exc}") from exc


def get_latest_analytics(db: Session) -> Optional[Dict[str, Any]]:
    """
    Retrieve the most recently generated analytics snapshot.

    The snapshot metadata (rating, summary, insights) is read from
    circular_economy_analytics. All statistics and distributions are
    re-computed LIVE from the source tables to ensure fresh values.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy database session.

    Returns
    -------
    Optional[Dict[str, Any]]
        Full analytics dict, or None if no snapshots exist yet.

    Raises
    ------
    RuntimeError
        On unexpected retrieval failure.
    """
    try:
        # Retrieve the most recent persisted metadata row
        latest: Optional[CircularEconomyAnalytics] = (
            db.query(CircularEconomyAnalytics)
            .order_by(CircularEconomyAnalytics.generated_at.desc())
            .first()
        )

        if latest is None:
            logger.info("[CircularAnalytics] No stored analytics snapshots found.")
            return None

        # Re-compute live statistics (source tables may have changed since last generate)
        metrics: List[SustainabilityMetric] = db.query(SustainabilityMetric).all()
        recommendations: List[RecyclingRecommendation] = db.query(RecyclingRecommendation).all()

        stats = _build_statistics(metrics)
        material_dist = _build_material_distribution(metrics)
        rec_dist = _build_recommendation_distribution(recommendations)
        waste_breakdown = _build_waste_category_breakdown(metrics)
        most_common, least_common = _get_most_least_common_material(material_dist)

        # Deserialise stored insights
        try:
            stored_insights: List[str] = json.loads(latest.generated_insights)
        except (json.JSONDecodeError, TypeError):
            stored_insights = []

        return {
            "generated_at": latest.generated_at,
            "overall_rating": latest.overall_rating,
            "summary": latest.summary,
            "statistics": stats,
            "material_distribution": material_dist,
            "recommendation_distribution": rec_dist,
            "waste_category_breakdown": waste_breakdown,
            "most_common_material": most_common,
            "least_common_material": least_common,
            "generated_insights": stored_insights,
        }

    except Exception as exc:
        logger.exception("[CircularAnalytics] Unexpected failure in get_latest_analytics: %s", exc)
        raise RuntimeError(f"Failed to retrieve latest circular analytics: {exc}") from exc


def get_analytics_history(db: Session) -> List[CircularEconomyAnalytics]:
    """
    Return all stored analytics metadata rows, ordered newest-first.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy database session.

    Returns
    -------
    List[CircularEconomyAnalytics]
        ORM row objects ordered by generated_at descending.
        Empty list if no snapshots exist.
    """
    return (
        db.query(CircularEconomyAnalytics)
        .order_by(CircularEconomyAnalytics.generated_at.desc())
        .all()
    )


# ====================================================================
# 4. PRIVATE DATABASE HELPERS
# ====================================================================

def _persist_analytics_metadata(
    db: Session,
    total_items: int,
    overall_rating: str,
    summary: str,
    insights: List[str],
) -> CircularEconomyAnalytics:
    """
    Persist a new CircularEconomyAnalytics row to the database.

    Each call to generate_analytics() creates a NEW row (immutable audit log).
    The history endpoint returns all rows; the latest endpoint returns the newest.

    Parameters
    ----------
    db : Session
        Active SQLAlchemy database session.
    total_items : int
        Number of inventory items included in this snapshot.
    overall_rating : str
        Platform-level circular economy performance rating string.
    summary : str
        One-paragraph narrative summary.
    insights : List[str]
        List of 5–10 dynamically generated insight strings.

    Returns
    -------
    CircularEconomyAnalytics
        The newly created ORM row (committed to the database).
    """
    row = CircularEconomyAnalytics(
        total_items=total_items,
        overall_rating=overall_rating,
        summary=summary,
        generated_insights=json.dumps(insights, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    logger.info(
        "[CircularAnalytics] Persisted analytics snapshot id=%s with %d items, rating='%s'.",
        row.id,
        total_items,
        overall_rating,
    )
    return row
