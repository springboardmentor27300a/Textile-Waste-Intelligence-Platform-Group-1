import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..deps import current_user
from ..models import Analysis, BatchStatus, Notification, User, WasteBatch, WasteCategory
from ..ml.engines import analyse_image
from ..schemas import AnalysisOut
from .inventory import _visible

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_BYTES = 12 * 1024 * 1024


def _save_upload(upload: UploadFile) -> Path:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(status_code=415,
                            detail="Upload a JPG, PNG, WebP or BMP image of the textile.")
    upload.file.seek(0, 2)
    if upload.file.tell() > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image is over the 12 MB limit.")
    upload.file.seek(0)

    directory = Path(settings.upload_dir)
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / f"{uuid.uuid4().hex}{suffix}"
    with destination.open("wb") as handle:
        shutil.copyfileobj(upload.file, handle)
    return destination


@router.post("/batches/{batch_id}", response_model=AnalysisOut, status_code=201)
def analyse_batch(batch_id: int, image: UploadFile = File(...),
                  db: Session = Depends(get_db), user: User = Depends(current_user)):
    """Run the full pipeline over one textile photo and attach it to a batch."""
    batch = _visible(db, user).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch with that id in your inventory.")

    path = _save_upload(image)
    try:
        result = analyse_image(str(path), batch.condition, batch.quantity_kg)
    except ValueError as exc:
        path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    record = Analysis(
        batch_id=batch.id,
        image_path=str(path),
        visual_features=result["visual_features"],
        dominant_colour=result["dominant_colour"],
        texture_class=result["texture_class"],
        pattern_class=result["pattern_class"],
        damage_score=result["damage_score"],
        contamination_score=result["contamination_score"],
        defect_detection=result.get("defect_detection"),
        garment_recognition=result.get("garment_recognition"),
        material=result["material"],
        material_confidence=result["material_confidence"],
        material_probabilities=result["material_probabilities"],
        fibre_composition=result["fibre_composition"],
        is_blend=result["is_blend"],
        material_quality=result["material_quality"],
        waste_category=WasteCategory(result["waste_category"]),
        waste_probabilities=result["waste_probabilities"],
        recyclability_score=result["recyclability_score"],
        reuse_score=result["reuse_score"],
        sustainability_score=result["sustainability_score"],
        material_recovery_score=result["material_recovery_score"],
        circularity_score=result["circularity_score"],
        circularity_band=result["circularity_band"],
        score_components=result["score_components"],
        score_weights=result["score_weights"],
        recommendations=result["recommendations"],
        environmental_impact=result["environmental_impact"],
        inference_ms=result["inference_ms"],
    )
    db.add(record)

    if batch.fabric_type in ("", "Unknown"):
        batch.fabric_type = result["material"]
    if not batch.colour:
        batch.colour = result["dominant_colour"]
    batch.status = BatchStatus.analysed

    if record.waste_category is WasteCategory.hazardous:
        db.add(Notification(
            user_id=user.id, kind="alert",
            title=f"{batch.batch_code} flagged as hazardous",
            body="Contamination is above the safe-handling threshold. Hold the batch and "
                 "route it to a licensed handler.",
        ))
    elif record.circularity_score >= 85:
        db.add(Notification(
            user_id=user.id, kind="opportunity",
            title=f"{batch.batch_code} scores {record.circularity_score:.0f} for circularity",
            body=f"Top route: {record.recommendations[0]['route']}. "
                 f"Worth prioritising in this week's schedule.",
        ))

    db.commit()
    db.refresh(record)
    return record


@router.post("/quick", status_code=200)
def quick_analyse(image: UploadFile = File(...), condition: str = Form("good"),
                  quantity_kg: float = Form(0.0), user: User = Depends(current_user)):
    """Analyse an image without attaching it to a batch.

    Backs the drag-and-drop Image Analysis screen: an operator can read a swatch
    before deciding whether it is worth registering.
    """
    path = _save_upload(image)
    try:
        return analyse_image(str(path), condition, quantity_kg)
    except ValueError as exc:
        path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/batches/{batch_id}", response_model=list[AnalysisOut])
def batch_history(batch_id: int, db: Session = Depends(get_db),
                  user: User = Depends(current_user)):
    batch = _visible(db, user).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="No batch with that id in your inventory.")
    return batch.analyses


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: int, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    record = db.get(Analysis, analysis_id)
    if not record or not _visible(db, user).filter(WasteBatch.id == record.batch_id).first():
        raise HTTPException(status_code=404, detail="No analysis with that id.")
    return record
