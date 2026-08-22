import os
import uuid

import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_roles
from ..vision import analyze_image
from ..material_classifier import classify_material
from ..recyclability import classify
from ..reports import build_classification_report_pdf, build_single_analysis_report_pdf

router = APIRouter(prefix="/api/inventory", tags=["Material Classification"])

CAN_ANALYZE = (models.UserRole.ADMIN, models.UserRole.RECYCLING_OPERATOR)
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _attach_computed_fields(analysis: models.ImageAnalysis) -> models.ImageAnalysis:
    return analysis


@router.post("/{batch_id}/analyze", response_model=schemas.ImageAnalysisOut, status_code=201)
async def analyze_batch_photo(batch_id: str, file: UploadFile = File(...), db: Session = Depends(get_db),
                               current_user: models.User = Depends(require_roles(*CAN_ANALYZE))):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPEG, PNG, or WEBP image.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large (max 8MB).")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    import traceback
    try:
        features = analyze_image(image_bytes)
        from ..vision import _load_image
        img_array = _load_image(image_bytes)
        material_prediction = classify_material(img_array, features, declared_fabric_type=batch.fabric_type)

        result = classify(material_prediction.predicted_fabric_type or batch.fabric_type, batch.condition, features)

        ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp"):
            ext = ".jpg"
        saved_name = f"{uuid.uuid4()}{ext}"
        with open(os.path.join(UPLOAD_DIR, saved_name), "wb") as f:
            f.write(image_bytes)

        analysis = models.ImageAnalysis(
            batch_id=batch.id, image_filename=file.filename, image_path=saved_name,
            dominant_color_hex=features.dominant_color_hex, brightness=features.brightness,
            texture_score=features.texture_score, contamination_score=features.contamination_score,
            damage_score=features.damage_score, predicted_fabric_type=material_prediction.predicted_fabric_type,
            fabric_confidence=material_prediction.confidence, classification_method=models.ClassificationMethod.HEURISTIC,
            material_rationale=material_prediction.rationale, recommended_category=result.recommended_category,
            recyclability_score=result.recyclability_score, rationale=result.rationale,
        )
        db.add(analysis)
        batch.category = result.recommended_category
        batch.status = models.BatchStatus.CLASSIFIED
        db.commit(); db.refresh(analysis)
        return _attach_computed_fields(analysis)
    except Exception as exc:
        print("ANALYZE EXCEPTION TRACEBACK:")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Image analysis error: {str(exc)}")


@router.get("/{batch_id}/analyses", response_model=list[schemas.ImageAnalysisOut])
def list_batch_analyses(batch_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found.")
    analyses = db.query(models.ImageAnalysis).filter(models.ImageAnalysis.batch_id == batch_id).order_by(models.ImageAnalysis.created_at.desc()).all()
    return [_attach_computed_fields(a) for a in analyses]


@router.get("/reports/classification-summary", response_model=schemas.ClassificationReportSummary)
def classification_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batches = db.query(models.WasteBatch).all()
    analyses = db.query(models.ImageAnalysis).all()

    def bucket(items, attr):
        result = {}
        for item in items:
            value = getattr(item, attr)
            if value is None: continue
            key = value.value if hasattr(value, "value") else str(value)
            result[key] = result.get(key, 0) + 1
        return result

    scores = [a.recyclability_score for a in analyses if a.recyclability_score is not None]
    return schemas.ClassificationReportSummary(
        total_batches=len(batches), total_analyzed=len(analyses),
        by_predicted_fabric_type=bucket(analyses, "predicted_fabric_type"),
        by_recommended_category=bucket(analyses, "recommended_category"),
        average_recyclability_score=round(sum(scores)/len(scores), 1) if scores else None,
        high_contamination_count=sum(1 for a in analyses if (a.contamination_score or 0) > 0.5),
        high_damage_count=sum(1 for a in analyses if (a.damage_score or 0) > 0.5),
    )


@router.get("/reports/classification-report.pdf")
def download_classification_report(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    analyses = db.query(models.ImageAnalysis).join(models.WasteBatch).order_by(models.ImageAnalysis.created_at.desc()).all()
    pdf_bytes = build_classification_report_pdf(analyses)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=waste-classification-report.pdf"})


@router.get("/{batch_id}/analyses/{analysis_id}/report.pdf")
def download_single_analysis_report(batch_id: str, analysis_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    analysis = db.query(models.ImageAnalysis).filter(models.ImageAnalysis.id == analysis_id, models.ImageAnalysis.batch_id == batch_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    pdf_bytes = build_single_analysis_report_pdf(analysis)
    filename = f"classification-{analysis.batch.batch_code}-{analysis.created_at.strftime('%Y%m%d-%H%M')}.pdf"
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})
