"""
AI Analysis Router — Image analysis, material & waste classification
Milestone 4: Added file size validation, type checking, better error messages
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import os, shutil, uuid, logging
from app.database import get_db
from app.models.ai_log import AILog
from app.services.auth_service import get_current_active_user
from app.services import ai_service
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/ai", tags=["AI Analysis"])
logger = logging.getLogger("twip.ai")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze an uploaded textile image using AI.
    Returns material detection, waste classification, sustainability scores.
    """
    # ── Validate content type ──────────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        logger.warning("Rejected upload: invalid content_type=%s user=%s", file.content_type, current_user.email)
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Allowed types: JPG, JPEG, PNG, WebP, GIF"
        )

    # ── Validate extension ─────────────────────────────────────────────────
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # ── Validate file size ─────────────────────────────────────────────────
    content = await file.read()
    max_bytes = settings.max_upload_bytes
    if len(content) > max_bytes:
        logger.warning(
            "Rejected upload: file too large size=%d max=%d user=%s",
            len(content), max_bytes, current_user.email
        )
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB. "
                   f"Your file: {len(content) / (1024*1024):.1f} MB"
        )

    # ── Save file ──────────────────────────────────────────────────────────
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    try:
        with open(filepath, "wb") as f:
            f.write(content)
    except IOError as e:
        logger.error("Failed to save uploaded file: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to save uploaded file. Please try again.")

    # ── Run AI analysis ────────────────────────────────────────────────────
    logger.info("AI analysis started: file=%s user=%s", file.filename, current_user.email)
    result = ai_service.analyze_image(file.filename)
    result["image_url"] = f"/uploads/{filename}"

    # ── Log to DB ──────────────────────────────────────────────────────────
    try:
        log = AILog(
            user_id=current_user.id,
            analysis_type="image_analysis",
            input_data=file.filename,
            output_data=str(result["ai_result"]),
            confidence=result["ai_result"]["confidence_pct"] / 100,
            processing_time_ms=result["processing_time_ms"],
            image_url=result["image_url"]
        )
        db.add(log)
        await db.commit()
    except Exception as e:
        logger.error("Failed to log AI analysis to DB: %s", str(e))
        # Don't fail the request if logging fails

    logger.info(
        "AI analysis complete: material=%s confidence=%.1f%% time=%dms user=%s",
        result["ai_result"]["material"],
        result["ai_result"]["confidence_pct"],
        result["processing_time_ms"],
        current_user.email
    )
    return result


@router.post("/classify-material")
async def classify_material(
    fabric_type: str,
    quantity: float = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Classify a textile material type and return properties."""
    if not fabric_type or not fabric_type.strip():
        raise HTTPException(status_code=400, detail="fabric_type cannot be empty")

    result = ai_service.classify_material(fabric_type, quantity)
    log = AILog(
        user_id=current_user.id,
        analysis_type="material_classification",
        input_data=fabric_type,
        output_data=str(result["primary_classification"]),
        confidence=result["confidence"]
    )
    db.add(log)
    await db.commit()
    logger.info("Material classified: %s -> %s user=%s", fabric_type, result["primary_classification"], current_user.email)
    return result


@router.post("/classify-waste")
async def classify_waste(
    fabric_type: str,
    condition: str = "Fair",
    quantity: float = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Classify waste category for a textile material."""
    if not fabric_type or not fabric_type.strip():
        raise HTTPException(status_code=400, detail="fabric_type cannot be empty")
    valid_conditions = {"Good", "Fair", "Poor", "Critical"}
    if condition not in valid_conditions:
        raise HTTPException(status_code=400, detail=f"Invalid condition. Must be one of: {', '.join(valid_conditions)}")

    result = ai_service.classify_waste(fabric_type, condition, quantity)
    log = AILog(
        user_id=current_user.id,
        analysis_type="waste_classification",
        input_data=f"{fabric_type},{condition}",
        output_data=result["waste_category"],
        confidence=result["confidence"]
    )
    db.add(log)
    await db.commit()
    return result


@router.get("/logs")
async def get_ai_logs(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Return recent AI analysis logs."""
    from sqlalchemy import select
    result = await db.execute(
        select(AILog).order_by(AILog.created_at.desc()).limit(50)
    )
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "type": l.analysis_type,
            "input": l.input_data,
            "confidence": l.confidence,
            "processing_ms": l.processing_time_ms,
            "image_url": l.image_url,
            "created_at": str(l.created_at)
        }
        for l in logs
    ]
