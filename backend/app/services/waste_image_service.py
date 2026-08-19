from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import WasteBatch, WasteImage


UPLOAD_DIR = Path("uploads/waste_images")

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


class WasteImageError(Exception):
    pass


class BatchNotFoundError(WasteImageError):
    pass


class InvalidImageTypeError(WasteImageError):
    pass


class ImageTooLargeError(WasteImageError):
    pass


def _get_owned_batch(
    db: Session,
    current_user,
    batch_id: int,
) -> WasteBatch:

    if current_user.organization_id is None:
        raise BatchNotFoundError("Waste batch not found.")

    batch = db.scalar(
        select(WasteBatch).where(
            WasteBatch.id == batch_id,
            WasteBatch.organization_id
            == current_user.organization_id,
        )
    )

    if batch is None:
        raise BatchNotFoundError("Waste batch not found.")

    return batch


def upload_waste_image(
    db: Session,
    current_user,
    batch_id: int,
    file: UploadFile,
    is_primary: bool = False,
) -> WasteImage:

    batch = _get_owned_batch(
        db,
        current_user,
        batch_id,
    )

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise InvalidImageTypeError(
            "Only JPEG, PNG and WebP images are allowed."
        )

    contents = file.file.read()

    if not contents:
        raise InvalidImageTypeError(
            "Uploaded image is empty."
        )

    if len(contents) > MAX_IMAGE_SIZE:
        raise ImageTooLargeError(
            "Image size cannot exceed 10 MB."
        )

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = ALLOWED_IMAGE_TYPES[file.content_type]

    stored_filename = (
        f"{batch.batch_code}_{uuid4().hex}{extension}"
    )

    file_path = UPLOAD_DIR / stored_filename

    try:
        with file_path.open("wb") as output:
            output.write(contents)

        # First image automatically becomes primary.
        existing_images = list(
            db.scalars(
                select(WasteImage).where(
                    WasteImage.batch_id == batch.id
                )
            ).all()
        )

        should_be_primary = (
            is_primary or len(existing_images) == 0
        )

        if should_be_primary:
            for image in existing_images:
                image.is_primary = False

        image = WasteImage(
            batch_id=batch.id,
            original_filename=file.filename or "image",
            stored_filename=stored_filename,
            file_path=str(file_path),
            mime_type=file.content_type,
            file_size_bytes=len(contents),
            is_primary=should_be_primary,
        )

        db.add(image)

        # Image upload should advance a newly registered batch.
        if batch.processing_status == "REGISTERED":
            batch.processing_status = "IMAGE_UPLOADED"

        db.commit()
        db.refresh(image)

        return image

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise


def list_waste_images(
    db: Session,
    current_user,
    batch_id: int,
) -> list[WasteImage]:

    batch = _get_owned_batch(
        db,
        current_user,
        batch_id,
    )

    statement = (
        select(WasteImage)
        .where(
            WasteImage.batch_id == batch.id
        )
        .order_by(
            WasteImage.is_primary.desc(),
            WasteImage.uploaded_at.asc(),
            WasteImage.id.asc(),
        )
    )

    return list(
        db.scalars(statement).all()
    )