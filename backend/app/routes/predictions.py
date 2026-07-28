"""
Predictions Router — All AI Endpoints for Milestone 2
=======================================================
POST /api/v1/image/upload
POST /api/v1/material/predict
POST /api/v1/waste/classify
POST /api/v1/recyclability/predict
GET  /api/v1/predictions
GET  /api/v1/predictions/{id}
GET  /api/v1/reports
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.prediction import UploadedImage, Prediction, ClassificationResult, PredictionReport
from app.auth.deps import get_current_user
from app.config import settings

from app.image_processing.processor import ImageProcessor
from app.ai.inference_service import inference_service
from app.predictions.service import PredictionService

from app.schemas.prediction import (
    ImageUploadResponse,
    MaterialPredictRequest, MaterialPredictResponse,
    WasteClassifyRequest, WasteClassifyResponse,
    RecyclabilityRequest, RecyclabilityResponse,
    FullPredictionResponse,
    PredictionListResponse, PredictionListItem, PredictionImageInfo,
    ReportListResponse, ReportItem,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Predictions"])

# Singleton processor
image_processor = ImageProcessor(upload_dir=settings.UPLOAD_DIR)


# ─── Helper: Image → Feature dict ────────────────────────────────────────────

def _get_image_features(db: Session, image_id: str) -> dict:
    """Load an uploaded image record and reconstruct feature dict for inference."""
    img = PredictionService.get_image_by_id(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail=f"Image {image_id} not found")

    colors = []
    try:
        colors = json.loads(img.dominant_colors or "[]")
    except Exception:
        pass

    return {
        "file_hash": img.file_hash or "",
        "filename": img.filename,
        "file_size": img.file_size or 0,
        "width": img.width or 0,
        "height": img.height or 0,
        "dominant_colors": colors,
        "texture_complexity": img.texture_complexity or "Medium",
        "fabric_pattern": img.fabric_pattern or "Solid",
        "brightness": img.brightness or 128.0,
        "contrast": img.contrast or 40.0,
        "visible_damage": img.visible_damage,
        "contamination_detected": img.contamination_detected,
        "wrinkle_detected": img.wrinkle_detected,
        "tear_detected": img.tear_detected,
        "surface_quality": img.surface_quality or "Good",
    }


# ─── POST /image/upload ───────────────────────────────────────────────────────

@router.post("/image/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_textile_image(
    file: UploadFile = File(...),
    inventory_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a textile image for AI analysis.
    Validates format, processes the image, extracts features, and stores to DB.
    """
    file_data = await file.read()
    filename = file.filename or "upload.jpg"
    content_type = file.content_type or "image/jpeg"

    # Validate
    validation = image_processor.validate_image(filename, len(file_data), content_type)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["error"])

    # Extract metadata
    metadata = image_processor.get_metadata(file_data, filename, content_type)

    # Save original file
    original_path = image_processor.save_original(file_data, filename)

    # Process image and extract features
    features = image_processor.process_image(original_path, file_data)
    features["file_hash"] = metadata["file_hash"]
    features["file_size"] = metadata["file_size"]

    # Save to database
    img_record = PredictionService.save_uploaded_image(
        db=db,
        user_id=str(current_user.id),
        filename=filename,
        original_path=original_path,
        metadata=metadata,
        features=features,
        inventory_id=inventory_id,
    )

    # Build response
    colors = json.loads(img_record.dominant_colors or "[]") if img_record.dominant_colors else []

    return ImageUploadResponse(
        id=str(img_record.id),
        filename=img_record.filename,
        original_path=img_record.original_path,
        processed_path=img_record.processed_path,
        file_size=img_record.file_size,
        file_size_mb=round((img_record.file_size or 0) / (1024 * 1024), 2),
        width=img_record.width,
        height=img_record.height,
        format=img_record.format,
        dominant_colors=colors,
        texture_complexity=img_record.texture_complexity,
        fabric_pattern=img_record.fabric_pattern,
        brightness=img_record.brightness,
        contrast=img_record.contrast,
        visible_damage=img_record.visible_damage,
        contamination_detected=img_record.contamination_detected,
        wrinkle_detected=img_record.wrinkle_detected,
        tear_detected=img_record.tear_detected,
        surface_quality=img_record.surface_quality,
        created_at=img_record.created_at,
        message="Image uploaded and processed successfully",
    )


# ─── POST /material/predict ───────────────────────────────────────────────────

@router.post("/material/predict", response_model=MaterialPredictResponse)
def predict_material(
    request: MaterialPredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run material classification on an uploaded image."""
    features = _get_image_features(db, request.image_id)
    result = inference_service.predict_material_only(features)

    return MaterialPredictResponse(
        image_id=request.image_id,
        material=result["material"],
        confidence=result["confidence"],
        fabric_category=result["fabric_category"],
        detected_color=result["detected_color"],
        texture_description=result["texture_description"],
        fiber_composition=result["fiber_composition"],
        properties=result["properties"],
        probabilities=result["probabilities"],
    )


# ─── POST /waste/classify ─────────────────────────────────────────────────────

@router.post("/waste/classify", response_model=WasteClassifyResponse)
def classify_waste(
    request: WasteClassifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run waste classification on an uploaded image."""
    features = _get_image_features(db, request.image_id)

    # Build minimal material prediction dict from request or re-predict
    if request.material:
        mat_pred = {"material": request.material, "confidence": request.material_confidence or 90.0}
    else:
        mat_pred = inference_service.predict_material_only(features)

    result = inference_service.classify_waste_only(mat_pred, features)

    return WasteClassifyResponse(
        image_id=request.image_id,
        waste_category=result["waste_category"],
        confidence=result["confidence"],
        reason=result["reason"],
        material_quality=result["material_quality"],
        severity_level=result["severity_level"],
        description=result["description"],
        status_badge=result["status_badge"],
    )


# ─── POST /recyclability/predict ─────────────────────────────────────────────

@router.post("/recyclability/predict", response_model=RecyclabilityResponse)
def predict_recyclability(
    request: RecyclabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate recyclability assessment."""
    features = _get_image_features(db, request.image_id)

    mat_pred = {"material": request.material or "Mixed Fabric"}
    waste_pred = {"waste_category": request.waste_category or "Recyclable"}

    result = inference_service.predict_recyclability_only(mat_pred, waste_pred)

    return RecyclabilityResponse(
        image_id=request.image_id,
        recyclability_score=result["recyclability_score"],
        reuse_potential=result["reuse_potential"],
        recovery_difficulty=result["recovery_difficulty"],
        material_recovery_score=result["material_recovery_score"],
        overall_rating=result["overall_rating"],
        recovery_indicator=result["recovery_indicator"],
    )


# ─── POST /predictions/full (Full Pipeline) ───────────────────────────────────

@router.post("/predictions/analyze", response_model=FullPredictionResponse, status_code=status.HTTP_201_CREATED)
def run_full_analysis(
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run the complete AI pipeline on an uploaded image and store results.
    This is the primary endpoint that chains all classification steps.
    """
    features = _get_image_features(db, image_id)

    # Run full pipeline
    pipeline_result = inference_service.run_full_pipeline(features)

    # Save to DB
    pred = PredictionService.save_full_prediction(
        db=db,
        user_id=str(current_user.id),
        image_id=image_id,
        pipeline_result=pipeline_result,
    )

    return FullPredictionResponse(
        prediction_id=str(pred.id),
        image_id=image_id,
        material=pred.material,
        confidence=pred.material_confidence,
        waste_category=pred.waste_category,
        recyclability=pred.recyclability_score or 0.0,
        recovery=pred.recovery_difficulty or "Medium",
        status=pred.status,
        overall_confidence=pred.overall_confidence or 0.0,
        material_details=pipeline_result.get("material_details", {}),
        waste_details=pipeline_result.get("waste_details", {}),
        recyclability_details=pipeline_result.get("recyclability_details", {}),
        image_features=pipeline_result.get("image_features", {}),
        created_at=pred.created_at,
    )


# ─── GET /predictions ─────────────────────────────────────────────────────────

@router.get("/predictions", response_model=PredictionListResponse)
def list_predictions(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    material: Optional[str] = Query(None),
    waste_category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve paginated prediction history with search, filter, and sort.
    Administrators see all predictions. Others see only their own.
    """
    user_id = None
    if current_user.role.name != "Administrator":
        user_id = str(current_user.id)

    result = PredictionService.get_predictions(
        db=db,
        user_id=user_id,
        material=material,
        waste_category=waste_category,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
    )

    items = []
    for pred in result["items"]:
        img_info = None
        if pred.image:
            img_info = PredictionImageInfo(
                id=str(pred.image.id),
                filename=pred.image.filename,
                original_path=pred.image.original_path,
                surface_quality=pred.image.surface_quality,
            )
        items.append(PredictionListItem(
            id=str(pred.id),
            image=img_info,
            material=pred.material,
            waste_category=pred.waste_category,
            material_confidence=pred.material_confidence,
            waste_confidence=pred.waste_confidence,
            overall_confidence=pred.overall_confidence,
            recyclability_score=pred.recyclability_score,
            recovery_difficulty=pred.recovery_difficulty,
            overall_rating=pred.overall_rating,
            status=pred.status,
            user_name=pred.user.full_name if pred.user else None,
            created_at=pred.created_at,
        ))

    return PredictionListResponse(
        items=items,
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
        pages=result["pages"],
    )


# ─── GET /predictions/{id} ────────────────────────────────────────────────────

@router.get("/predictions/{prediction_id}")
def get_prediction_detail(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full details for a single prediction including classification result."""
    pred = PredictionService.get_prediction_by_id(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Access control
    if current_user.role.name != "Administrator" and str(pred.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    # Parse JSON fields from ClassificationResult
    cr = pred.classification_result
    mat_probs = {}
    fiber_comp = {}
    mat_props = {}
    img_features = {}
    if cr:
        try:
            mat_probs = json.loads(cr.material_probabilities or "{}")
            fiber_comp = json.loads(cr.fiber_composition or "{}")
            mat_props = json.loads(cr.material_properties or "{}")
            img_features = json.loads(cr.image_features_json or "{}")
        except Exception:
            pass

    img = pred.image
    colors = []
    if img and img.dominant_colors:
        try:
            colors = json.loads(img.dominant_colors)
        except Exception:
            pass

    return {
        "id": str(pred.id),
        "status": pred.status,
        "created_at": pred.created_at.isoformat() if pred.created_at else None,
        "material": pred.material,
        "confidence": pred.material_confidence,
        "overall_confidence": pred.overall_confidence,
        "fabric_category": pred.fabric_category,
        "detected_color": pred.detected_color,
        "texture_description": pred.texture_description,
        "waste_category": pred.waste_category,
        "waste_confidence": pred.waste_confidence,
        "material_quality": pred.material_quality,
        "severity_level": pred.severity_level,
        "recyclability_score": pred.recyclability_score,
        "reuse_potential": pred.reuse_potential,
        "recovery_difficulty": pred.recovery_difficulty,
        "material_recovery_score": pred.material_recovery_score,
        "overall_rating": pred.overall_rating,
        "image": {
            "id": str(img.id) if img else None,
            "filename": img.filename if img else None,
            "original_path": img.original_path if img else None,
            "processed_path": img.processed_path if img else None,
            "width": img.width if img else None,
            "height": img.height if img else None,
            "surface_quality": img.surface_quality if img else None,
            "fabric_pattern": img.fabric_pattern if img else None,
            "dominant_colors": colors,
            "visible_damage": img.visible_damage if img else False,
            "contamination_detected": img.contamination_detected if img else False,
            "wrinkle_detected": img.wrinkle_detected if img else False,
            "tear_detected": img.tear_detected if img else False,
        } if img else None,
        "user_name": pred.user.full_name if pred.user else None,
        "organization": pred.user.organization.name if (pred.user and pred.user.organization) else None,
        "material_details": {
            "probabilities": mat_probs,
            "fiber_composition": fiber_comp,
            "properties": mat_props,
        },
        "waste_details": {
            "reason": cr.waste_reason if cr else None,
            "description": cr.waste_description if cr else None,
            "status_badge": cr.status_badge if cr else None,
        },
        "recyclability_details": {
            "recovery_indicator": cr.recovery_indicator if cr else None,
        },
        "image_features": img_features,
        "report": {
            "id": str(pred.report.id) if pred.report else None,
            "title": pred.report.report_title if pred.report else None,
            "summary": pred.report.summary if pred.report else None,
            "status": pred.report.status if pred.report else None,
        } if pred.report else None,
    }


# ─── GET /reports ─────────────────────────────────────────────────────────────

@router.get("/reports", response_model=ReportListResponse)
def list_reports(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all generated prediction reports."""
    user_id = None
    if current_user.role.name != "Administrator":
        user_id = str(current_user.id)

    result = PredictionService.get_reports(db=db, user_id=user_id, page=page, per_page=per_page)

    items = []
    for rpt in result["items"]:
        pred = rpt.prediction
        items.append(ReportItem(
            id=str(rpt.id),
            prediction_id=str(rpt.prediction_id),
            report_title=rpt.report_title,
            summary=rpt.summary,
            status=rpt.status,
            material=pred.material if pred else None,
            waste_category=pred.waste_category if pred else None,
            recyclability_score=pred.recyclability_score if pred else None,
            user_name=rpt.user.full_name if rpt.user else None,
            organization_name=rpt.user.organization.name if (rpt.user and rpt.user.organization) else None,
            created_at=rpt.created_at,
        ))

    return ReportListResponse(items=items, total=result["total"])


# ─── GET /images/{id} (serve image) ──────────────────────────────────────────

@router.get("/images/{image_id}")
def get_image_info(
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get image metadata by ID."""
    img = PredictionService.get_image_by_id(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    colors = []
    try:
        colors = json.loads(img.dominant_colors or "[]")
    except Exception:
        pass

    return {
        "id": str(img.id),
        "filename": img.filename,
        "original_path": img.original_path,
        "processed_path": img.processed_path,
        "file_size": img.file_size,
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "dominant_colors": colors,
        "texture_complexity": img.texture_complexity,
        "fabric_pattern": img.fabric_pattern,
        "brightness": img.brightness,
        "contrast": img.contrast,
        "visible_damage": img.visible_damage,
        "contamination_detected": img.contamination_detected,
        "wrinkle_detected": img.wrinkle_detected,
        "tear_detected": img.tear_detected,
        "surface_quality": img.surface_quality,
        "created_at": img.created_at.isoformat() if img.created_at else None,
    }
