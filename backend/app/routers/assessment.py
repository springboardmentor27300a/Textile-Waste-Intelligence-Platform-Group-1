"""
Assessment Router — Milestone 2, Step 3

Endpoints:
  POST /assessment/recyclability  →  recyclability score + status for a textile item
"""

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import User
from app.image_schemas import (
    RecyclabilityRequest,
    RecyclabilityResponse,
)
from app.services.auth_service import get_current_user
from app.services import recyclability_assessor

router = APIRouter(prefix="/assessment", tags=["Assessment"])


# ── POST /assessment/recyclability ────────────────────────────────────────────

@router.post("/recyclability", response_model=RecyclabilityResponse)
def assess_recyclability(
    body: RecyclabilityRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Compute a recyclability score for a textile item.

    Inputs (all strings, case-insensitive):
    - ``material``:      fabric type — e.g. ``"Cotton"``, ``"Polyester"``
    - ``condition``:     ``excellent`` | ``good`` | ``fair`` | ``poor`` | ``unusable``
    - ``contamination``: ``none`` | ``low`` | ``medium`` | ``high``

    Returns the echoed inputs together with a ``score`` (0–100) and a
    human-readable ``status`` string.

    Does **not** require a DB session — all inputs are provided in the
    request body and the scoring is fully deterministic.
    """
    try:
        result = recyclability_assessor.assess(
            material=body.material,
            condition=body.condition,
            contamination=body.contamination,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return RecyclabilityResponse(
        material=body.material,
        condition=body.condition,
        contamination=body.contamination,
        score=result["score"],
        status=result["status"],
    )
