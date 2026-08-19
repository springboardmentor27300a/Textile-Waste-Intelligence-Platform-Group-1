# from fastapi import APIRouter, Depends, HTTPException, status
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser
from app.database import get_db
from app.schemas.waste_batch import (
    BatchStatusHistoryResponse,
    BatchStatusUpdate,
    WasteBatchCreate,
    WasteBatchListResponse,
    WasteBatchResponse,
    WasteBatchUpdate,
)
from app.services.waste_batch_service import (
    FacilityNotFoundError,
    InvalidStatusTransitionError,
    OrganizationRequiredError,
    WasteBatchNotFoundError,
    create_waste_batch,
    get_batch_status_history,
    get_waste_batch,
    list_waste_batches,
    update_batch_status,
    update_waste_batch,
)


router = APIRouter(
    prefix="/api/waste-batches",
    tags=["Waste Inventory"],
)


def handle_organization_error(exc: OrganizationRequiredError):
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=str(exc),
    ) from exc


def handle_facility_error(exc: FacilityNotFoundError):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=str(exc),
    ) from exc


def handle_batch_not_found(exc: WasteBatchNotFoundError):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=str(exc),
    ) from exc


@router.post(
    "",
    response_model=WasteBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_batch(
    data: WasteBatchCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return create_waste_batch(
            db=db,
            current_user=current_user,
            data=data,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)

    except FacilityNotFoundError as exc:
        handle_facility_error(exc)


# @router.get(
#     "",
#     response_model=list[WasteBatchResponse],
# )
# def list_batches(
#     current_user: CurrentUser,
#     db: Session = Depends(get_db),
# ):
#     try:
#         return list_waste_batches(
#             db=db,
#             current_user=current_user,
#         )

#     except OrganizationRequiredError as exc:
#         handle_organization_error(exc)

@router.get(
    "",
    response_model=WasteBatchListResponse,
)
def list_batches(
    current_user: CurrentUser,
    db: Session = Depends(get_db),

    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    search: str | None = Query(
        default=None,
        max_length=100,
    ),

    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),

    facility_id: int | None = Query(
        default=None,
        ge=1,
    ),

    source: str | None = Query(
        default=None,
        max_length=100,
    ),

    material: str | None = Query(
        default=None,
        max_length=100,
    ),

    date_from: date | None = Query(
        default=None,
    ),

    date_to: date | None = Query(
        default=None,
    ),

    is_archived: bool = Query(
        default=False,
    ),

    sort_by: str = Query(
        default="created_at",
        pattern="^(created_at|collection_date|quantity_kg|batch_code|status|material)$",
    ),

    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    try:
        return list_waste_batches(
            db=db,
            current_user=current_user,
            page=page,
            page_size=page_size,
            search=search,
            status=status_filter,
            facility_id=facility_id,
            source=source,
            material=material,
            date_from=date_from,
            date_to=date_to,
            is_archived=is_archived,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)


@router.get(
    "/{batch_id}",
    response_model=WasteBatchResponse,
)
def get_batch(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return get_waste_batch(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)

    except WasteBatchNotFoundError as exc:
        handle_batch_not_found(exc)


@router.patch(
    "/{batch_id}",
    response_model=WasteBatchResponse,
)
def update_batch(
    batch_id: int,
    data: WasteBatchUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return update_waste_batch(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
            data=data,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)

    except WasteBatchNotFoundError as exc:
        handle_batch_not_found(exc)

    except FacilityNotFoundError as exc:
        handle_facility_error(exc)


@router.patch(
    "/{batch_id}/status",
    response_model=WasteBatchResponse,
)
def change_batch_status(
    batch_id: int,
    data: BatchStatusUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return update_batch_status(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
            data=data,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)

    except WasteBatchNotFoundError as exc:
        handle_batch_not_found(exc)

    except InvalidStatusTransitionError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/{batch_id}/status-history",
    response_model=list[BatchStatusHistoryResponse],
)
def status_history(
    batch_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    try:
        return get_batch_status_history(
            db=db,
            current_user=current_user,
            batch_id=batch_id,
        )

    except OrganizationRequiredError as exc:
        handle_organization_error(exc)

    except WasteBatchNotFoundError as exc:
        handle_batch_not_found(exc)