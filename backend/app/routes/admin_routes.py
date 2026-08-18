from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text


from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, TextileInventory, AnalysisHistory


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# USER MANAGEMENT
# =========================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # Admin-only access
    # =====================================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # =====================================================
    # Get all users
    # =====================================================

    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    # =====================================================
    # Return safe user information
    # =====================================================

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
            "auth_provider": user.auth_provider,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]


# =========================================================
# CHANGE USER ROLE
# =========================================================

class RoleUpdate(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # Admin-only access
    # =====================================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # =====================================================
    # Validate role
    # =====================================================

    allowed_roles = [
        "manufacturer",
        "sustainability_manager",
        "recycling_operator",
        "admin"
    ]

    if role_data.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role."
        )

    # =====================================================
    # Find user
    # =====================================================

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # =====================================================
    # Prevent admin from changing own role
    # =====================================================

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own admin role."
        )

    # =====================================================
    # Update role
    # =====================================================

    user.role = role_data.role

    db.commit()
    db.refresh(user)

    # =====================================================
    # Return updated user
    # =====================================================

    return {
        "message": "User role updated successfully.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
            "auth_provider": user.auth_provider,
            "is_active": user.is_active
        }
    }


# =========================================================
# ACTIVATE / DEACTIVATE USER
# =========================================================

class UserStatusUpdate(BaseModel):
    is_active: bool


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # Admin-only access
    # =====================================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # =====================================================
    # Find user
    # =====================================================

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # =====================================================
    # Prevent admin from changing own account status
    # =====================================================

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own account status."
        )

    # =====================================================
    # Update status
    # =====================================================

    user.is_active = status_data.is_active

    db.commit()
    db.refresh(user)

    # =====================================================
    # Return updated user
    # =====================================================

    return {
        "message": (
            "User activated successfully."
            if user.is_active
            else "User deactivated successfully."
        ),
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "organization": user.organization,
            "auth_provider": user.auth_provider,
            "is_active": user.is_active
        }
    }


# =========================================================
# PLATFORM ANALYTICS
# =========================================================

@router.get("/analytics")
def get_platform_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # Admin-only access
    # =====================================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # =====================================================
    # USER ANALYTICS
    # =====================================================

    total_users = (
        db.query(User)
        .count()
    )

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = (
        db.query(User)
        .filter(User.is_active == False)
        .count()
    )

    # =====================================================
    # INVENTORY ANALYTICS
    # =====================================================

    total_inventory = (
        db.query(TextileInventory)
        .count()
    )

    total_waste_quantity = (
        db.query(
            func.sum(TextileInventory.quantity)
        )
        .scalar()
    ) or 0

    # =====================================================
    # ANALYSIS ANALYTICS
    # =====================================================

    total_analyses = (
        db.query(AnalysisHistory)
        .count()
    )

    recyclable_items = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.recommended_action.ilike(
                "%recycle%"
            )
        )
        .count()
    )

    reusable_items = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.recommended_action.ilike(
                "%reuse%"
            )
        )
        .count()
    )

    # =====================================================
    # SUSTAINABILITY ANALYTICS
    # =====================================================

    average_sustainability = (
        db.query(
            func.avg(
                AnalysisHistory.sustainability_score
            )
        )
        .scalar()
    ) or 0

    total_co2_saved = (
        db.query(
            func.sum(
                AnalysisHistory.co2_saved
            )
        )
        .scalar()
    ) or 0

    total_water_saved = (
        db.query(
            func.sum(
                AnalysisHistory.water_saved
            )
        )
        .scalar()
    ) or 0

    total_landfill_saved = (
        db.query(
            func.sum(
                AnalysisHistory.landfill_saved
            )
        )
        .scalar()
    ) or 0

    # =====================================================
    # RETURN PLATFORM ANALYTICS
    # =====================================================

    return {

        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users
        },

        "inventory": {
            "total_batches": total_inventory,
            "total_quantity": round(
                total_waste_quantity,
                2
            )
        },

        "analysis": {
            "total_analyses": total_analyses,
            "recyclable_items": recyclable_items,
            "reusable_items": reusable_items
        },

        "sustainability": {
            "average_score": round(
                average_sustainability,
                1
            ),
            "co2_saved": round(
                total_co2_saved,
                2
            ),
            "water_saved": round(
                total_water_saved,
                2
            ),
            "landfill_saved": round(
                total_landfill_saved,
                2
            )
        }

    }

# =========================================================
# SYSTEM MONITORING
# =========================================================

@router.get("/system-monitoring")
def get_system_monitoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # Admin-only access
    # =====================================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # =====================================================
    # DATABASE HEALTH
    # =====================================================

    try:
        db.execute(text("SELECT 1"))
        database_status = "Connected"

    except Exception:
        return {
            "system": {
                "platform_status": "Warning",
                "backend_status": "Online",
                "database_status": "Disconnected"
            },

            "users": {
                "total": 0,
                "active": 0,
                "inactive": 0
            },

            "inventory": {
                "total_batches": 0,
                "total_quantity": 0
            },

            "analysis": {
                "total_analyses": 0
            },

            "sustainability": {
                "average_score": 0,
                "co2_saved": 0,
                "water_saved": 0,
                "landfill_saved": 0
            }
        }

    # =====================================================
    # USER MONITORING
    # =====================================================

    total_users = (
        db.query(User)
        .count()
    )

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = (
        db.query(User)
        .filter(User.is_active == False)
        .count()
    )

    # =====================================================
    # INVENTORY MONITORING
    # =====================================================

    total_batches = (
        db.query(TextileInventory)
        .count()
    )

    total_quantity = (
        db.query(
            func.sum(TextileInventory.quantity)
        )
        .scalar()
    ) or 0

    # =====================================================
    # AI ANALYSIS MONITORING
    # =====================================================

    total_analyses = (
        db.query(AnalysisHistory)
        .count()
    )

    # =====================================================
    # SUSTAINABILITY MONITORING
    # =====================================================

    average_sustainability = (
        db.query(
            func.avg(
                AnalysisHistory.sustainability_score
            )
        )
        .scalar()
    ) or 0

    total_co2_saved = (
        db.query(
            func.sum(
                AnalysisHistory.co2_saved
            )
        )
        .scalar()
    ) or 0

    total_water_saved = (
        db.query(
            func.sum(
                AnalysisHistory.water_saved
            )
        )
        .scalar()
    ) or 0

    total_landfill_saved = (
        db.query(
            func.sum(
                AnalysisHistory.landfill_saved
            )
        )
        .scalar()
    ) or 0

    # =====================================================
    # PLATFORM HEALTH
    # =====================================================

    platform_status = (
        "Healthy"
        if database_status == "Connected"
        else "Warning"
    )

    # =====================================================
    # RETURN SYSTEM MONITORING
    # =====================================================

    return {

        "system": {
            "platform_status": platform_status,
            "backend_status": "Online",
            "database_status": database_status
        },

        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users
        },

        "inventory": {
            "total_batches": total_batches,
            "total_quantity": round(
                total_quantity,
                2
            )
        },

        "analysis": {
            "total_analyses": total_analyses
        },

        "sustainability": {
            "average_score": round(
                average_sustainability,
                1
            ),
            "co2_saved": round(
                total_co2_saved,
                2
            ),
            "water_saved": round(
                total_water_saved,
                2
            ),
            "landfill_saved": round(
                total_landfill_saved,
                2
            )
        }

    }

# ==========================================
# Admin - Report Management
# ==========================================

@router.get("/reports")
def get_admin_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # Admin-only access
    # ==========================================

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    # ==========================================
    # User Report
    # ==========================================

    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = (
        db.query(User)
        .filter(User.is_active == False)
        .count()
    )

    # ==========================================
    # Inventory Report
    # ==========================================

    total_batches = (
        db.query(TextileInventory)
        .count()
    )

    total_quantity = (
        db.query(
            func.sum(TextileInventory.quantity)
        )
        .scalar()
    ) or 0
    # ==========================================
    # Analysis Report
    # ==========================================

    total_analyses = (
        db.query(AnalysisHistory)
        .count()
    )

    # ==========================================
    # Sustainability Report
    # ==========================================

    sustainability_data = (
        db.query(
            func.avg(
                AnalysisHistory.sustainability_score
            ),
            func.sum(
                AnalysisHistory.co2_saved
            ),
            func.sum(
                AnalysisHistory.water_saved
            ),
            func.sum(
                AnalysisHistory.landfill_saved
            )
        )
        .first()
    )

    average_score = sustainability_data[0] or 0
    co2_saved = sustainability_data[1] or 0
    water_saved = sustainability_data[2] or 0
    landfill_saved = sustainability_data[3] or 0

    # ==========================================
    # Return Report Data
    # ==========================================

    return {

        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users
        },

        "inventory": {
            "total_batches": total_batches,
            "total_quantity": total_quantity
        },

        "analysis": {
            "total_analyses": total_analyses
        },

        "sustainability": {
            "average_score": round(
                float(average_score), 2
            ),

            "co2_saved": round(
                float(co2_saved), 2
            ),

            "water_saved": round(
                float(water_saved), 2
            ),

            "landfill_saved": round(
                float(landfill_saved), 2
            )
        }
    }