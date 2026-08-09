from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.image_record import TextileImage
from app.image_schemas import ImageOut, ImageListOut, ImageAnalysisResponse
from app.services.image_service import validate_image, save_image, delete_image_file
from app.services import image_analyzer, material_classifier, waste_classifier, recommendation_engine
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/image", tags=["Image Upload"])


# ── POST /image/upload ────────────────────────────────────────────────────────

@router.post("/upload", response_model=ImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a textile image.
    - Validates MIME type (JPEG, PNG, WebP, GIF, BMP, TIFF)
    - Validates file size (max 10 MB)
    - Stores file in app/uploads/
    - Returns image metadata and URL
    """
    content = await file.read()
    validate_image(file, content)

    meta = save_image(file, content)

    record = TextileImage(
        **meta,
        uploaded_by_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── GET /image/{id} ───────────────────────────────────────────────────────────

@router.get("/{image_id}", response_model=ImageOut)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve image metadata by ID (only if owned by current user)."""
    record = db.query(TextileImage).filter(
        TextileImage.id == image_id,
        TextileImage.uploaded_by_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")
    return record


# ── GET /image ────────────────────────────────────────────────────────────────

@router.get("", response_model=ImageListOut)
def list_images(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List images uploaded by the current user."""
    base_query = db.query(TextileImage).filter(TextileImage.uploaded_by_id == current_user.id)
    total   = base_query.count()
    records = base_query.order_by(TextileImage.uploaded_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "images": records}


# ── DELETE /image/{id} ────────────────────────────────────────────────────────

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete image record from DB and file from disk (only owner may delete)."""
    record = db.query(TextileImage).filter(
        TextileImage.id == image_id,
        TextileImage.uploaded_by_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")

    delete_image_file(record.file_path)
    db.delete(record)
    db.commit()


# ── POST /image/analyze/{id} ──────────────────────────────────────────────────

@router.post("/analyze/{image_id}", response_model=ImageAnalysisResponse)
def analyze_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Perform unified textile image analysis including material, waste, and recommendations.
    """
    record = db.query(TextileImage).filter(TextileImage.id == image_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")

    # 1. Image Analysis
    analysis = image_analyzer.analyze(record.filename, record.original_name, record.file_path)
    
    # 2. Material Classification
    mat_result = material_classifier.classify(record.filename)
    mat_result["image_id"] = image_id
    
    # 3. Waste Classification
    damage = analysis.get("damage_detection", {}).get("level", "Unknown")
    waste_result = waste_classifier.classify(mat_result["material"], damage_level=damage)
    waste_result["material"] = mat_result["material"]
    
    # 4. Recommendations
    rec_result = recommendation_engine.get_recommendations(
        material=mat_result["material"],
        category=waste_result["category"],
        damage=damage,
        contamination=analysis.get("contamination_detection", {}).get("level", "Unknown"),
        recyclability=waste_result.get("recyclability_assessment", "Unknown"),
        reuse_potential=waste_result.get("reuse_potential", "Unknown")
    )
    
    analysis["material_classification"] = mat_result
    analysis["waste_classification"] = waste_result
    analysis["recommendations"] = rec_result

    return analysis
