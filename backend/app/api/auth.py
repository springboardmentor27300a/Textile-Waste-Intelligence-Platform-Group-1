from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.core.logger import logger

from app.schemas.user import (
    UserRegister,
    UserResponse,
    UserLogin,
    UserUpdate,
    PasswordUpdate,
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.core.dependencies import (
    get_current_user,
    normalize_role,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


PUBLIC_ROLES = {
    "manager",
    "manufacturer",
    "recycler",
    "operator",
}


@router.post(
    "/register",
    response_model=UserResponse,
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    requested_role = (
        user.role or "manufacturer"
    ).strip().lower()

    if requested_role == "administrator":
        raise HTTPException(
            status_code=403,
            detail=(
                "Administrator accounts cannot be created "
                "through public registration."
            ),
        )

    if requested_role not in PUBLIC_ROLES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid role. Choose manager, manufacturer, "
                "or recycler."
            ),
        )

    role = normalize_role(requested_role)

    new_user = User(
        full_name=user.full_name.strip(),
        email=str(user.email).lower(),
        password=hash_password(user.password),
        role=role,
        organization_name=user.organization_name,
        organization_type=user.organization_type,
        business_category=user.business_category,
        organization_contact=user.organization_contact,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(
        f"New user registered: "
        f"{new_user.email} ({new_user.role})"
    )

    return new_user


@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    email = str(user.email).lower()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if (
        not existing_user
        or not verify_password(
            user.password,
            existing_user.password,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    role = normalize_role(existing_user.role)

    if role not in {
        "administrator",
        "manager",
        "manufacturer",
        "recycler",
    }:
        raise HTTPException(
            status_code=403,
            detail="This account has an unsupported role.",
        )

    if existing_user.role != role:
        existing_user.role = role

        db.commit()
        db.refresh(existing_user)

    access_token = create_access_token(
        {
            "sub": existing_user.email,
            "role": role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email,
            "role": role,
            "organization_name": existing_user.organization_name,
            "organization_type": existing_user.organization_type,
            "business_category": existing_user.business_category,
            "organization_contact": existing_user.organization_contact,
        },
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse,
)
def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = user_data.full_name
    current_user.organization_name = (
        user_data.organization_name
    )
    current_user.organization_type = (
        user_data.organization_type
    )
    current_user.business_category = (
        user_data.business_category
    )
    current_user.organization_contact = (
        user_data.organization_contact
    )

    db.commit()
    db.refresh(current_user)

    return current_user


@router.patch("/password")
def change_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        password_data.current_password,
        current_user.password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    current_user.password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully."
    }