from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user, normalize_role
from app.core.security import hash_password
from app.schemas.user import UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ============================================================
# ADMIN ACCESS
# ============================================================

def require_admin(
    current_user: User = Depends(get_current_user),
):
    role = normalize_role(current_user.role)

    if role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required.",
        )

    return current_user


# ============================================================
# GET ALL USERS
# ============================================================

@router.get("/", response_model=list[UserResponse])
def get_users(
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User)

    # Search by name or email
    if search and search.strip():
        search_value = f"%{search.strip()}%"

        query = query.filter(
            (User.full_name.ilike(search_value))
            | (User.email.ilike(search_value))
        )

    # Filter by role
    if role and role.lower() not in {
        "all",
        "all roles",
    }:
        normalized_role = normalize_role(role)

        query = query.filter(
            User.role == normalized_role
        )

    return (
        query
        .order_by(User.id.desc())
        .all()
    )


# ============================================================
# USER STATISTICS
# ============================================================

@router.get("/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).all()

    total_users = len(users)

    administrators = sum(
        1
        for user in users
        if normalize_role(user.role) == "administrator"
    )

    managers = sum(
        1
        for user in users
        if normalize_role(user.role) == "manager"
    )

    # Your current User table does not contain a status column.
    # Therefore all existing accounts are treated as active.
    active_users = total_users

    return {
        "total_users": total_users,
        "active_users": active_users,
        "administrators": administrators,
        "managers": managers,
    }


# ============================================================
# GET SINGLE USER
# ============================================================

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


# ============================================================
# CREATE USER
# ============================================================

@router.post(
    "/",
    response_model=UserResponse,
    status_code=201,
)
def create_user(
    user_data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    # Required fields
    if not user_data.get("full_name"):
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )

    if not user_data.get("email"):
        raise HTTPException(
            status_code=400,
            detail="Email is required.",
        )

    if not user_data.get("password"):
        raise HTTPException(
            status_code=400,
            detail="Password is required.",
        )

    email = str(
        user_data["email"]
    ).strip().lower()

    # Check duplicate email
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    # Normalize role
    role = normalize_role(
        str(
            user_data.get(
                "role",
                "operator",
            )
        )
    )

    allowed_roles = {
        "administrator",
        "manager",
        "manufacturer",
        "recycler",
        "operator",
    }

    if role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role.",
        )

    # Create user
    new_user = User(
        full_name=str(
            user_data["full_name"]
        ).strip(),

        email=email,

        password=hash_password(
            str(
                user_data["password"]
            )
        ),

        role=role,

        organization_name=user_data.get(
            "organization_name"
        ),

        organization_type=user_data.get(
            "organization_type"
        ),

        business_category=user_data.get(
            "business_category"
        ),

        organization_contact=user_data.get(
            "organization_contact"
        ),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create user. Email may already exist.",
        )

    return new_user


# ============================================================
# UPDATE USER
# ============================================================

@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Full name
    if user_data.get("full_name") is not None:
        user.full_name = str(
            user_data["full_name"]
        ).strip()

    # Email
    if user_data.get("email") is not None:

        email = str(
            user_data["email"]
        ).strip().lower()

        duplicate = (
            db.query(User)
            .filter(
                User.email == email,
                User.id != user_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Email already exists.",
            )

        user.email = email

    # Role
    if user_data.get("role") is not None:

        role = normalize_role(
            str(
                user_data["role"]
            )
        )

        allowed_roles = {
            "administrator",
            "manager",
            "manufacturer",
            "recycler",
            "operator",
        }

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid role.",
            )

        user.role = role

    # Password
    if user_data.get("password"):
        user.password = hash_password(
            str(
                user_data["password"]
            )
        )

    # Organization information
    if "organization_name" in user_data:
        user.organization_name = (
            user_data["organization_name"]
        )

    if "organization_type" in user_data:
        user.organization_type = (
            user_data["organization_type"]
        )

    if "business_category" in user_data:
        user.business_category = (
            user_data["business_category"]
        )

    if "organization_contact" in user_data:
        user.organization_contact = (
            user_data["organization_contact"]
        )

    db.commit()
    db.refresh(user)

    return user


# ============================================================
# DELETE USER
# ============================================================

@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Prevent administrator from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own administrator account.",
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully.",
        "id": user_id,
    }