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

from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
)

from app.services.collection_service import (
    CollectionService,
)

from app.services.event_notification_service import (
    EventNotificationService,
)


router = APIRouter(
    prefix="/collections",
    tags=["Collections"],
)


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "/",
    response_model=list[CollectionResponse],
)
def get_all_collections(
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

    return CollectionService.get_all_collections(
        db
    )


# =========================================================
# GET ONE
# =========================================================

@router.get(
    "/{collection_id}",
    response_model=CollectionResponse,
)
def get_collection_by_id(
    collection_id: int,

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

    return CollectionService.get_collection_by_id(
        collection_id,
        db,
    )


# =========================================================
# CREATE
# =========================================================

@router.post(
    "/",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_collection(
    collection: CollectionCreate,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
            "manufacturer",
        )
    ),

    db: Session = Depends(get_db),
):

    created_collection = (
        CollectionService.create_collection(
            collection,
            db,
        )
    )

    logger.info(
        f"{current_user.email} "
        f"created collection "
        f"{created_collection.collection_code}"
    )

    try:

        EventNotificationService.collection_created(
            db=db,
            collection=created_collection,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Collection notification failed: %s",
            notification_error,
        )

    return created_collection


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{collection_id}",
    response_model=CollectionResponse,
)
def update_collection(
    collection_id: int,
    collection: CollectionUpdate,

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

    updated_collection = (
        CollectionService.update_collection(
            collection_id,
            collection,
            db,
        )
    )

    logger.info(
        f"{current_user.email} "
        f"updated collection "
        f"{updated_collection.collection_code}"
    )

    try:

        EventNotificationService.collection_updated(
            db=db,
            collection=updated_collection,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Collection update notification failed: %s",
            notification_error,
        )

    return updated_collection


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{collection_id}"
)
def delete_collection(
    collection_id: int,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manager",
        )
    ),

    db: Session = Depends(get_db),
):

    collection = (
        CollectionService.get_collection_by_id(
            collection_id,
            db,
        )
    )

    if collection is None:

        return {
            "message": "Collection not found."
        }

    collection_code = collection.collection_code

    result = CollectionService.delete_collection(
        collection_id,
        db,
    )

    logger.info(
        f"{current_user.email} "
        f"deleted collection "
        f"{collection_code}"
    )

    try:

        EventNotificationService.collection_deleted(
            db=db,
            collection_code=collection_code,
            collection_id=collection_id,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Collection delete notification failed: %s",
            notification_error,
        )

    return result