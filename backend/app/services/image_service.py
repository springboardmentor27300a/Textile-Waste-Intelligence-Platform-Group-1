import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException

# ── Constants ─────────────────────────────────────────────────────────────────

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB
BASE_URL = "http://localhost:8000"


# ── Validation ────────────────────────────────────────────────────────────────

def validate_image(file: UploadFile, content: bytes) -> None:
    """Raise HTTP 400 if file fails MIME type or size checks."""
    # MIME type check
    mime = file.content_type or ""
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{mime}'. Allowed: JPEG, PNG, WebP, GIF, BMP, TIFF.",
        )
    # Size check
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) // (1024*1024)} MB). Maximum allowed is 10 MB.",
        )


# ── Save ──────────────────────────────────────────────────────────────────────

def save_image(file: UploadFile, content: bytes) -> dict:
    """
    Persist the image to disk and return metadata dict.
    Returns: { filename, original_name, file_path, file_url, file_size, mime_type }
    """
    ext = Path(file.filename or "upload.jpg").suffix.lower()
    if not ext:
        ext = ".jpg"

    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_path   = UPLOADS_DIR / unique_name

    with open(dest_path, "wb") as f:
        f.write(content)

    return {
        "filename":      unique_name,
        "original_name": file.filename or "upload",
        "file_path":     str(dest_path),
        "file_url":      f"{BASE_URL}/uploads/{unique_name}",
        "file_size":     len(content),
        "mime_type":     file.content_type or "image/jpeg",
    }


# ── Delete ────────────────────────────────────────────────────────────────────

def delete_image_file(file_path: str) -> None:
    """Remove image from disk. Silently ignores missing files."""
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass


# ── URL helper ────────────────────────────────────────────────────────────────

def get_image_url(filename: str) -> str:
    return f"{BASE_URL}/uploads/{filename}"
