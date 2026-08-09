"""
upload_router.py
────────────────
Minimal Textile Image Upload endpoint.

POST /upload/image
  • Accepts multipart/form-data with a single `file` field.
  • Validates MIME type  → only image/jpeg and image/png are accepted.
  • Validates file size  → max 10 MB.
  • Saves the file to   app/uploads/  with a UUID-based name.
  • Returns JSON        { filename, original_name, url, size_bytes, mime_type }

No authentication required.  Does NOT touch any existing router or DB table.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

# ── Constants ─────────────────────────────────────────────────────────────────

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png"}
MAX_BYTES = 10 * 1024 * 1024   # 10 MB
BASE_URL  = "http://localhost:8000"

router = APIRouter(prefix="/upload", tags=["Image Upload (Simple)"])


# ── POST /upload/image ────────────────────────────────────────────────────────

@router.post(
    "/image",
    status_code=status.HTTP_201_CREATED,
    summary="Upload a textile image (JPG/PNG, max 10 MB)",
    response_description="Saved filename and public URL",
)
async def upload_textile_image(file: UploadFile = File(...)):
    """
    Upload a JPG or PNG textile image.

    - **file**: multipart file field (JPEG or PNG, ≤ 10 MB)

    Returns the stored `filename` (UUID-based) and a `url` you can use
    to retrieve the image from the `/uploads/` static directory.
    """
    # ── 1. Read raw bytes ──────────────────────────────────────────────────────
    content = await file.read()

    # ── 2. Validate MIME type ─────────────────────────────────────────────────
    mime = (file.content_type or "").lower().strip()
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{mime}'. "
                "Only image/jpeg and image/png are accepted."
            ),
        )

    # ── 3. Validate file size ──────────────────────────────────────────────────
    if len(content) > MAX_BYTES:
        mb = len(content) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({mb:.2f} MB). Maximum allowed size is 10 MB.",
        )

    # ── 4. Build a safe, unique filename ──────────────────────────────────────
    original = file.filename or "upload"
    ext = Path(original).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png"}:
        ext = ".jpg" if "jpeg" in mime else ".png"

    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest        = UPLOADS_DIR / stored_name

    # ── 5. Write to disk ──────────────────────────────────────────────────────
    dest.write_bytes(content)

    # ── 6. Return metadata ────────────────────────────────────────────────────
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "filename":      stored_name,
            "original_name": original,
            "url":           f"{BASE_URL}/uploads/{stored_name}",
            "size_bytes":    len(content),
            "mime_type":     mime,
        },
    )
