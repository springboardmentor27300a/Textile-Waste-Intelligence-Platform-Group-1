"""
Report Router — Milestone 2, Steps 4 & 5

Endpoints:
  GET /report/stats/summary  →  aggregate AI stats across all uploaded images
  GET /report/{image_id}     →  full AI report for a single uploaded image
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image_record import TextileImage
from app.image_schemas import TextileReport, AIStatsResponse
from app.services.auth_service import get_current_user
from app.services import material_classifier
from app.services import waste_classifier
from app.services import recyclability_assessor

router = APIRouter(prefix="/report", tags=["Report"])

# ── Defaults used when generating a report without explicit condition inputs ───
# A report is generated automatically from the image alone, so we apply
# "good" condition / "none" contamination as the conservative baseline.
# The recyclability score therefore reflects material type only, which is
# the correct semantic for a fully-automated AI report.
_DEFAULT_CONDITION      = "good"
_DEFAULT_CONTAMINATION  = "none"


# ── GET /report/stats/summary ────────────────────────────────────────────────

@router.get("/stats/summary", response_model=AIStatsResponse)
def get_ai_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return aggregate AI analysis statistics across all uploaded textile images.

    For each stored image the same three-service pipeline used by
    ``get_report()`` is applied (material → waste category → recyclability).
    Results are then aggregated into distribution counts and averages.

    Returns sensible zero-state defaults (empty dicts, score 0.0) when
    no images have been uploaded yet, so callers never receive an error.
    """
    records = db.query(TextileImage).order_by(TextileImage.uploaded_at.desc()).all()

    if not records:
        return AIStatsResponse(
            total_images=0,
            material_distribution={},
            waste_category_distribution={},
            average_recyclability_score=0.0,
            recyclability_status_counts={},
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    # ── Run the pipeline for every image and accumulate ───────────────────────
    material_counts:     dict = {}
    waste_cat_counts:    dict = {}
    status_counts:       dict = {}
    score_total:         int  = 0

    for record in records:
        # Step 1: material
        mat_result = material_classifier.classify(record.filename)
        material   = mat_result["material"]

        # Step 2: waste category
        try:
            waste_result   = waste_classifier.classify(material)
            waste_category = waste_result["category"]
        except ValueError:
            waste_category = "unknown"

        # Step 3: recyclability (same defaults as get_report)
        try:
            rec_result = recyclability_assessor.assess(
                material=material,
                condition=_DEFAULT_CONDITION,
                contamination=_DEFAULT_CONTAMINATION,
            )
            score  = rec_result["score"]
            status = rec_result["status"]
        except ValueError:
            score, status = 0, "Unknown"

        # Accumulate
        material_counts[material]       = material_counts.get(material, 0) + 1
        waste_cat_counts[waste_category] = waste_cat_counts.get(waste_category, 0) + 1
        status_counts[status]           = status_counts.get(status, 0) + 1
        score_total                    += score

    total    = len(records)
    avg_score = round(score_total / total, 1)

    return AIStatsResponse(
        total_images=total,
        material_distribution=material_counts,
        waste_category_distribution=waste_cat_counts,
        average_recyclability_score=avg_score,
        recyclability_status_counts=status_counts,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


# ── GET /report/{image_id} ────────────────────────────────────────────────────

@router.get("/{image_id}", response_model=TextileReport)
def get_report(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a complete AI analysis report for an uploaded textile image.

    Pipeline (all using existing services, no duplicated logic):
    1. Retrieve the ``TextileImage`` record — 404 if not found.
    2. ``material_classifier.classify(filename)``  →  material + confidence.
    3. ``waste_classifier.classify(material)``      →  waste category + confidence.
    4. ``recyclability_assessor.assess(material, condition, contamination)``
       →  recyclability score + recovery status.
       Uses defaults: condition=``"good"``, contamination=``"none"``.
    5. Return a ``TextileReport`` combining all of the above.

    Args:
        image_id: Primary key of the ``textile_images`` table row.

    Returns:
        ``TextileReport`` with image metadata, material prediction,
        waste category, recyclability score, and timestamp.

    Raises:
        HTTP 404: if no image with ``image_id`` exists.
        HTTP 422: if any service raises a ``ValueError`` (e.g. unrecognised
                  material returned by the classifier — should not happen in
                  practice since both services share the same material list).
    """
    # ── 1. Fetch image record ─────────────────────────────────────────────────
    record = db.query(TextileImage).filter(TextileImage.id == image_id).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Image #{image_id} not found. Upload an image first.",
        )

    # ── 2. Material classification ────────────────────────────────────────────
    mat_result = material_classifier.classify(record.filename)
    material   = mat_result["material"]
    mat_conf   = mat_result["confidence"]

    # ── 3. Waste category classification ─────────────────────────────────────
    try:
        waste_result = waste_classifier.classify(material)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    waste_category = waste_result["category"]
    waste_conf     = waste_result["confidence"]

    # ── 4. Recyclability assessment ───────────────────────────────────────────
    try:
        recycle_result = recyclability_assessor.assess(
            material=material,
            condition=_DEFAULT_CONDITION,
            contamination=_DEFAULT_CONTAMINATION,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    recycle_score  = recycle_result["score"]
    recovery_status = recycle_result["status"]

    # ── 5. Assemble and return report ─────────────────────────────────────────
    return TextileReport(
        image_id=record.id,
        user_sequence_num=record.user_sequence_num,
        image_url=record.file_url,
        original_name=record.original_name,
        material=material,
        material_confidence=mat_conf,
        waste_category=waste_category,
        waste_confidence=waste_conf,
        waste_handling=waste_result.get("handling", ""),
        waste_disposal=waste_result.get("disposal", ""),
        recyclability_score=recycle_score,
        recovery_status=recovery_status,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
