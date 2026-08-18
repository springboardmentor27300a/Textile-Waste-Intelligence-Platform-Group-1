from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, TextileInventory
from app.services.history_service import HistoryService

router = APIRouter(
    tags=["Dashboard"]
)

# =====================================
# Inventory Dashboard
# =====================================
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_inventory = db.query(TextileInventory).count()

    total_quantity = (
        db.query(func.sum(TextileInventory.quantity))
        .scalar()
    ) or 0

    fabric_types = (
        db.query(TextileInventory.fabric_type)
        .distinct()
        .count()
    )

    today_entries = (
        db.query(TextileInventory)
        .filter(
            TextileInventory.collection_date == date.today()
        )
        .count()
    )

    recent_inventory = (
        db.query(TextileInventory)
        .order_by(TextileInventory.id.desc())
        .limit(5)
        .all()
    )

    return {
        "total_inventory": total_inventory,
        "total_quantity": total_quantity,
        "fabric_types": fabric_types,
        "today_entries": today_entries,
        "recent_inventory": recent_inventory
    }


# =====================================
# AI Dashboard Summary
# =====================================
@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_dashboard_summary()


# =====================================
# Material Distribution
# =====================================
@router.get("/materials")
def material_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_material_distribution()


# =====================================
# Damage Distribution
# =====================================
@router.get("/damage")
def damage_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_damage_distribution()


# =====================================
# Quality Distribution
# =====================================
@router.get("/quality")
def quality_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_quality_distribution()


# =====================================
# Recommendation Distribution
# =====================================
@router.get("/recommendations")
def recommendation_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_recommendation_distribution()


# =====================================
# Analysis History
# =====================================
@router.get("/history")
def analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    history = HistoryService(db)

    return history.get_all_history()

@router.get("/sustainability-summary")
def sustainability_summary(db: Session = Depends(get_db)):
    history = HistoryService(db)
    return history.get_sustainability_summary()