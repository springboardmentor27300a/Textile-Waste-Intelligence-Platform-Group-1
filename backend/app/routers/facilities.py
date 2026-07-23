from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser
from app.database import get_db
from app.schemas.facility import (
    FacilityCreate,
    FacilityResponse,
    FacilityUpdate,
)
from app.services.facility_service import (
    FacilityCodeAlreadyExistsError,
    FacilityNotFoundError,
    OrganizationRequiredError,
    create_facility_for_user,
    get_user_facilities,
    get_user_facility,
    update_user_facility,
)


router = APIRouter(
    prefix="/api/facilities",
    tags=["Facilities"],
)


@router.post(
    "",
    response_model=FacilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_facility(
    data: FacilityCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> FacilityResponse:
    try:
        return create_facility_for_user(
            db=db,
            user=current_user,
            data=data,
        )

    except OrganizationRequiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except FacilityCodeAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "",
    response_model=list[FacilityResponse],
)
def list_facilities(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> list[FacilityResponse]:
    try:
        return get_user_facilities(
            db=db,
            user=current_user,
        )

    except OrganizationRequiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/{facility_id}",
    response_model=FacilityResponse,
)
def get_facility(
    facility_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> FacilityResponse:
    try:
        return get_user_facility(
            db=db,
            user=current_user,
            facility_id=facility_id,
        )

    except OrganizationRequiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except FacilityNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{facility_id}",
    response_model=FacilityResponse,
)
def update_facility(
    facility_id: int,
    data: FacilityUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> FacilityResponse:
    try:
        return update_user_facility(
            db=db,
            user=current_user,
            facility_id=facility_id,
            data=data,
        )

    except OrganizationRequiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except FacilityNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc