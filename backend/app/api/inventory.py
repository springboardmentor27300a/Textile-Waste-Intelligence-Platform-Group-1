from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.core.logger import logger
from app.database.database import get_db
from app.models.user import User

from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
)

from app.services.inventory_service import InventoryService
from app.services.notification_service import (
    NotificationService,
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "/",
    response_model=list[InventoryResponse],
)
def get_inventory(
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

    return InventoryService.get_all(db)


# =========================================================
# STATISTICS
# =========================================================

@router.get("/statistics")
def get_inventory_statistics(
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

    return InventoryService.get_statistics(db)


# =========================================================
# GET ONE
# =========================================================

@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def get_inventory_by_id(
    inventory_id: int,

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

    return InventoryService.get_by_id(
        inventory_id,
        db,
    )


# =========================================================
# CREATE
# =========================================================

@router.post(
    "/",
    response_model=InventoryResponse,
)
def create_inventory(
    inventory: InventoryCreate,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manufacturer",
        )
    ),

    db: Session = Depends(get_db),
):

    item = InventoryService.create(
        inventory,
        db,
    )

    logger.info(
        f"{current_user.email} "
        f"created inventory batch "
        f"{item.batch_id}"
    )

    # ---------------------------------------------------------
    # Notification is secondary.
    #
    # A notification failure MUST NOT turn a successful
    # inventory creation into HTTP 500.
    # ---------------------------------------------------------

    try:

        NotificationService.inventory_created(
            db=db,
            inventory=item,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Inventory notification failed: %s",
            notification_error,
        )

    return item


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,

    current_user: User = Depends(
        require_roles(
            "administrator",
            "manufacturer",
        )
    ),

    db: Session = Depends(get_db),
):

    item = InventoryService.update(
        inventory_id,
        inventory,
        db,
    )

    logger.info(
        f"{current_user.email} "
        f"updated inventory batch "
        f"{item.batch_id}"
    )

    try:

        NotificationService.inventory_updated(
            db=db,
            inventory=item,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Inventory update notification failed: %s",
            notification_error,
        )

    return item


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{inventory_id}"
)
def delete_inventory(
    inventory_id: int,

    current_user: User = Depends(
        require_roles(
            "administrator"
        )
    ),

    db: Session = Depends(get_db),
):

    # ---------------------------------------------------------
    # Fetch before deleting so batch_id is available.
    # ---------------------------------------------------------

    item = InventoryService.get_by_id(
        inventory_id,
        db,
    )

    if item is None:

        return {
            "message": "Inventory not found."
        }

    batch_id = item.batch_id

    result = InventoryService.delete(
        inventory_id,
        db,
    )

    logger.info(
        f"{current_user.email} "
        f"deleted inventory ID "
        f"{inventory_id}"
    )

    try:

        NotificationService.inventory_deleted(
            db=db,
            batch_id=batch_id,
            inventory_id=inventory_id,
            actor=current_user,
        )

    except Exception as notification_error:

        logger.exception(
            "Inventory delete notification failed: %s",
            notification_error,
        )

    return result