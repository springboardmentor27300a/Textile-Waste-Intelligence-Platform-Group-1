from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse


from app.config import settings
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import authenticate_user

from app.core.dependencies import CurrentUser

from app.services.auth_service import (
    DefaultRoleNotFoundError,
    EmailAlreadyRegisteredError,
    register_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    registration: RegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    try:
        user = register_user(
            db=db,
            registration=registration,
        )

        return UserResponse.model_validate(user)

    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except DefaultRoleNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration configuration is unavailable.",
        ) from exc
    

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:

    user = authenticate_user(
        db=db,
        email=str(credentials.email),
        password=credentials.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={
            "role": user.role.name,
        },
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role.name,
    )

@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: CurrentUser,
) -> UserResponse:

    return UserResponse.model_validate(
        current_user
    )