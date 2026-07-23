from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser
from app.database import get_db
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization_service import (
    OrganizationAlreadyAssignedError,
    OrganizationNotFoundError,
    create_organization_for_user,
    get_user_organization,
    update_user_organization,
)


router = APIRouter(
    prefix="/api/organizations",
    tags=["Organizations"],
)


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization(
    data: OrganizationCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    try:
        organization = create_organization_for_user(
            db=db,
            user=current_user,
            data=data,
        )

    except OrganizationAlreadyAssignedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return OrganizationResponse.model_validate(
        organization
    )


@router.get(
    "/me",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
)
def get_my_organization(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    organization = get_user_organization(
        db=db,
        user=current_user,
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user.",
        )

    return OrganizationResponse.model_validate(
        organization
    )


@router.patch(
    "/me",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK,
)
def update_my_organization(
    data: OrganizationUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> OrganizationResponse:
    try:
        organization = update_user_organization(
            db=db,
            user=current_user,
            data=data,
        )

    except OrganizationNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return OrganizationResponse.model_validate(
        organization
    )