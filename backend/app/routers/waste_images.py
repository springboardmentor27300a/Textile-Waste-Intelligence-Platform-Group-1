from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser
from app.database import get_db
from app.schemas.waste_image import WasteImageResponse
from app.services.waste_image_service import (
    BatchNotFoundError,
    ImageTooLargeError,
    InvalidImageTypeError,
    list_waste_images,
    upload_waste_image,
)


router = APIRouter(
    prefix="/api/waste-batches",
    tags=["Waste Images"],
)


@router.post(
    "/{batch_id}/images",
    response_model=WasteImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_image(
    batch_id: int,
    current_user: CurrentUser,
    file: Annotated[UploadFile, File(...)],
    is_primary: Annotated[bool, Form()] = False,
    db: Session = Depends(get_db),
):
    try:
        return upload_waste_image(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
            file=file,
            is_primary=is_primary,
        )

    except BatchNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except InvalidImageTypeError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(exc),
        ) from exc

    except ImageTooLargeError as exc:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=str(exc),
        ) from exc


@router.get(
    "/{batch_id}/images",
    response_model=list[WasteImageResponse],
)
def get_images(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return list_waste_images(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

    except BatchNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc