"""
Sustainability Router — Milestone 3

Exposes the Sustainability Intelligence Engine through three REST endpoints.

All calculation and retrieval logic is delegated to sustainability_service.py.
This router contains NO business logic — only request validation,
service delegation, and HTTP response construction.

Endpoints
---------
POST   /api/sustainability/calculate          — run & persist metrics
GET    /api/sustainability/{inventory_id}     — retrieve stored metric
GET    /api/sustainability                    — list all stored metrics
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services import sustainability_service
from app.services import benchmark_service                    # Benchmarking Extension
from app.schemas.sustainability import (
    SustainabilityCalculateRequest,
    SustainabilityMetricOut,
    SustainabilityListItem,
    BenchmarkReportOut,                                       # Benchmarking Extension
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/sustainability",
    tags=["Sustainability Intelligence Engine"],
)


# ── POST /api/sustainability/calculate ────────────────────────────────────────

@router.post(
    "/calculate",
    response_model=SustainabilityMetricOut,
    status_code=status.HTTP_200_OK,
    summary="Calculate sustainability metrics for an inventory item",
    description=(
        "Triggers the Sustainability Intelligence Engine for the given inventory item. "
        "Consumes the stored material classification and applies the waste classifier "
        "to derive CO₂ savings, water savings, landfill diversion, resource recovery, "
        "circularity label, and a composite sustainability score. "
        "If metrics already exist for this inventory item they are recalculated and updated."
    ),
)
def calculate_sustainability(
    body: SustainabilityCalculateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SustainabilityMetricOut:
    """
    Calculate and persist sustainability metrics for an inventory item.

    Request body
    ------------
    inventory_id : int — the ID of the inventory item to analyse.

    Returns
    -------
    SustainabilityMetricOut — full computed metrics.

    Raises
    ------
    404 — inventory item not found
    400 — invalid weight (≤ 0)
    422 — unknown material or waste category
    500 — unexpected internal calculation error
    """
    try:
        metric = sustainability_service.calculate_and_save(
            inventory_id=body.inventory_id,
            db=db,
        )
    except ValueError as exc:
        msg = str(exc)
        # Distinguish "not found" from "invalid input" for cleaner HTTP semantics
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    except RuntimeError as exc:
        logger.exception("Sustainability calculation error for inventory_id=%s", body.inventory_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation error: {exc}",
        )

    return SustainabilityMetricOut.from_orm_metric(metric)


# ── GET /api/sustainability/benchmark/{inventory_id} ──────────────────────────
# IMPORTANT: This route is declared BEFORE /{inventory_id} intentionally.
# FastAPI resolves routes top-to-bottom; placing a literal path segment
# ("benchmark") after a dynamic one ({inventory_id}) would cause FastAPI to
# attempt to cast "benchmark" as an integer → HTTP 422.  Correct order:
#   1. /calculate         (POST  — literal)
#   2. /benchmark/{id}    (GET   — literal prefix + dynamic)
#   3. /                  (GET   — empty path → list)
#   4. /{inventory_id}    (GET   — fully dynamic)

@router.get(
    "/benchmark/{inventory_id}",
    response_model=BenchmarkReportOut,
    status_code=200,
    summary="Benchmark sustainability metrics for an inventory item",
    description=(
        "Compares the sustainability metrics of a specific inventory item against "
        "platform-wide historical averages computed from all stored "
        "sustainability_metrics records. "
        "\n\n"
        "Returns a per-metric comparison (CO₂, Water, Resource Recovery, "
        "Landfill Diversion, Sustainability Score) with:\n"
        "- **current** — the value for this inventory item\n"
        "- **average** — the platform-wide average\n"
        "- **difference** — current − average\n"
        "- **status** — 'Above Average' | 'Average' | 'Below Average'\n"
        "\n"
        "Also returns an **overall_rating** summarising performance across all metrics.\n"
        "\n"
        "If fewer than 2 historical records exist, returns a graceful "
        "'Benchmark unavailable' response instead of an error."
    ),
    responses={
        200: {
            "description": "Benchmark report (may contain available=False if insufficient data).",
            "content": {
                "application/json": {
                    "examples": {
                        "benchmark_available": {
                            "summary": "Benchmark available",
                            "value": {
                                "inventory_id": 1,
                                "available": True,
                                "message": "Benchmark generated successfully.",
                                "record_count": 15,
                                "co2": {
                                    "current": 12.5,
                                    "average": 9.3,
                                    "difference": 3.2,
                                    "status": "Above Average",
                                },
                                "water": {
                                    "current": 350.0,
                                    "average": 270.0,
                                    "difference": 80.0,
                                    "status": "Above Average",
                                },
                                "resource_recovery": {
                                    "current": 4.5,
                                    "average": 4.0,
                                    "difference": 0.5,
                                    "status": "Above Average",
                                },
                                "landfill_diversion": {
                                    "current": 92.0,
                                    "average": 81.0,
                                    "difference": 11.0,
                                    "status": "Above Average",
                                },
                                "sustainability_score": {
                                    "current": 82.0,
                                    "average": 74.0,
                                    "difference": 8.0,
                                    "status": "Above Average",
                                },
                                "overall_rating": "Excellent Sustainability Performance",
                            },
                        },
                        "benchmark_unavailable": {
                            "summary": "Insufficient historical data",
                            "value": {
                                "inventory_id": 1,
                                "available": False,
                                "message": (
                                    "Benchmark unavailable. More sustainability analyses "
                                    "are required. At least 2 records are needed."
                                ),
                                "record_count": 0,
                                "co2": None,
                                "water": None,
                                "resource_recovery": None,
                                "landfill_diversion": None,
                                "sustainability_score": None,
                                "overall_rating": None,
                            },
                        },
                    }
                }
            },
        },
        404: {"description": "No sustainability metric found for this inventory item."},
    },
)
def get_sustainability_benchmark(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BenchmarkReportOut:
    """
    Generate a sustainability benchmark report for an inventory item.

    The benchmarking service:
    1. Fetches the stored sustainability metric for this inventory item.
    2. Computes platform-wide averages via a single SQLAlchemy aggregation query.
    3. Compares each KPI against its platform average.
    4. Returns a full BenchmarkReport — gracefully handles insufficient data.

    Path parameter
    --------------
    inventory_id : int — the inventory item to benchmark.

    Returns
    -------
    BenchmarkReportOut — full benchmark report or unavailable notice.

    Raises
    ------
    404 — no sustainability metric exists for this inventory item yet.
          Call POST /api/sustainability/calculate first.
    500 — unexpected internal error (logged server-side).
    """
    try:
        report = benchmark_service.generate_benchmark_report(
            inventory_id=inventory_id,
            db=db,
        )
    except ValueError as exc:
        logger.warning(
            "Benchmark request for inventory_id=%s failed: %s", inventory_id, exc
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception(
            "Unexpected error generating benchmark for inventory_id=%s", inventory_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Benchmark generation failed: {exc}",
        )

    return BenchmarkReportOut.from_benchmark_report(report)


# ── GET /api/sustainability/{inventory_id} ────────────────────────────────────

@router.get(
    "/{inventory_id}",
    response_model=SustainabilityMetricOut,
    summary="Retrieve sustainability metrics for an inventory item",
    description=(
        "Returns the stored sustainability metric for the given inventory item. "
        "Returns 404 if metrics have not yet been calculated for this item — "
        "call POST /api/sustainability/calculate first."
    ),
)
def get_sustainability_by_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SustainabilityMetricOut:
    """
    Retrieve stored sustainability metrics by inventory ID.

    Path parameter
    --------------
    inventory_id : int — the ID of the inventory item.

    Returns
    -------
    SustainabilityMetricOut — stored metrics.

    Raises
    ------
    404 — no metrics found for this inventory item.
    """
    metric = sustainability_service.get_metric_by_inventory_id(
        inventory_id=inventory_id,
        db=db,
    )
    if metric is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No sustainability metrics found for inventory_id={inventory_id}. "
                "Run POST /api/sustainability/calculate first."
            ),
        )
    return SustainabilityMetricOut.from_orm_metric(metric)


# ── GET /api/sustainability ────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[SustainabilityListItem],
    summary="List all sustainability analyses",
    description="Returns all stored sustainability metrics, ordered by most recently created.",
)
def list_all_sustainability_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[SustainabilityListItem]:
    """
    Return a lightweight list of all sustainability metric records.

    Returns
    -------
    List[SustainabilityListItem] — all stored metric summaries.
    """
    metrics = sustainability_service.get_all_metrics(db=db)
    return [
        SustainabilityListItem(
            id=m.id,
            inventory_id=m.inventory_id,
            material=m.material_type,
            waste_category=m.waste_category,
            weight_kg=m.weight_kg,
            sustainability_score=m.sustainability_score,
            circularity=m.circularity_score,
            created_at=m.created_at,
        )
        for m in metrics
    ]
