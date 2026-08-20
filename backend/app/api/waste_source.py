from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.core.logger import logger
from app.database.database import get_db
from app.models.user import User

from app.schemas.waste_source import (
    WasteSourceCreate,
    WasteSourceUpdate,
    WasteSourceResponse,
)

from app.services.waste_source_service import (
    WasteSourceService,
)

from app.services.event_notification_service import (
    EventNotificationService,
)


router = APIRouter(
    prefix="/waste-sources",
    tags=["Waste Sources"],
)


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "/",
    response_model=list[WasteSourceResponse],
)
def get_all_sources(
    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),
):

    return WasteSourceService.get_all_sources(
        db
    )


# =========================================================
# GET ONE
# =========================================================

@router.get(
    "/{source_id}",
    response_model=WasteSourceResponse,
)
def get_source_by_id(
    source_id: int,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
        )
    ),

    db: Session = Depends(get_db),
):

    return WasteSourceService.get_source_by_id(
        source_id,
        db,
    )


# =========================================================
# CREATE
# =========================================================

@router.post(
    "/",
    response_model=WasteSourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_source(
    source: WasteSourceCreate,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
        )
    ),

    db: Session = Depends(get_db),
):

    created_source = (
        WasteSourceService.create_source(
            source,
            db,
        )
    )

    logger.info(
        f"{current_user.email} "
        f"created waste source "
        f"{created_source.source_code}"
    )

    try:

        EventNotificationService.waste_source_created(
            db=db,
            source=created_source,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Waste source notification failed: %s",
            notification_error,
        )

    return created_source


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{source_id}",
    response_model=WasteSourceResponse,
)
def update_source(
    source_id: int,
    source: WasteSourceUpdate,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
        )
    ),

    db: Session = Depends(get_db),
):

    updated_source = (
        WasteSourceService.update_source(
            source_id,
            source,
            db,
        )
    )

    logger.info(
        f"{current_user.email} "
        f"updated waste source "
        f"{updated_source.source_code}"
    )

    try:

        EventNotificationService.waste_source_updated(
            db=db,
            source=updated_source,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Waste source update notification failed: %s",
            notification_error,
        )

    return updated_source


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{source_id}"
)
def delete_source(
    source_id: int,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
        )
    ),

    db: Session = Depends(get_db),
):

    source = WasteSourceService.get_source_by_id(
        source_id,
        db,
    )

    if source is None:

        return {
            "message": "Waste source not found."
        }

    source_code = source.source_code

    result = WasteSourceService.delete_source(
        source_id,
        db,
    )

    logger.info(
        f"{current_user.email} "
        f"deleted waste source "
        f"{source_code}"
    )

    try:

        EventNotificationService.waste_source_deleted(
            db=db,
            source_code=source_code,
            source_id=source_id,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Waste source delete notification failed: %s",
            notification_error,
        )

    return result