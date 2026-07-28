from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, date

from app.database.session import get_db
from app.models.user import User
from app.models.waste_batch import WasteBatch, TextileInventory
from app.models.support import ActivityLog
from app.auth.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.name
    
    # Generic stats needed across dashboards
    total_waste_kg = db.query(func.sum(WasteBatch.quantity)).scalar() or 0.0
    total_batches = db.query(WasteBatch).count()
    active_inventory_items = db.query(TextileInventory).count()
    
    # Fetch recent activities (limit to 6) only for Administrator
    activities_json = []
    if role == "Administrator":
        recent_activities = (
            db.query(ActivityLog)
            .order_by(ActivityLog.timestamp.desc())
            .limit(6)
            .all()
        )
        activities_json = [
            {
                "id": str(log.id),
                "user_name": log.user.full_name,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in recent_activities
        ]


    # Initialize stats payload
    stats = {}
    charts = {}

    # Standard Chart Aggregations
    # 1. Fabric Type breakdown
    fabric_types = (
        db.query(WasteBatch.fabric_type, func.sum(WasteBatch.quantity))
        .group_by(WasteBatch.fabric_type)
        .all()
    )
    fabric_breakdown = {f[0]: f[1] for f in fabric_types if f[0]}
    
    # 2. Status counts
    status_counts = (
        db.query(WasteBatch.status, func.count(WasteBatch.id))
        .group_by(WasteBatch.status)
        .all()
    )
    status_breakdown = {s[0]: s[1] for s in status_counts if s[0]}

    if role == "Administrator":
        # System status, user counts, inventory summary, database health
        total_users = db.query(User).count()
        manufacturers_count = db.query(User).join(User.role).filter(User.role.has(name="Textile Manufacturer")).count()
        recyclers_count = db.query(User).join(User.role).filter(User.role.has(name="Recycling Facility Operator")).count()
        
        stats = {
            "total_users": total_users,
            "manufacturers_count": manufacturers_count,
            "recyclers_count": recyclers_count,
            "total_waste_batches": total_batches,
            "total_inventory_items": active_inventory_items,
            "system_health": "Optimal"
        }
        
    elif role == "Sustainability Manager":
        # Waste summaries, carbon offset placeholders, water offsets, recycling rate
        # Let's compute placeholder sustainability indexes:
        # e.g. Cotton saves ~2600 liters of water per kg. Recycling saves CO2.
        co2_saved_kg = total_waste_kg * 4.2 # e.g. 4.2kg CO2 saved per kg of textile recycled
        water_saved_liters = total_waste_kg * 2500 # e.g. 2500L saved per kg
        landfill_diverted_kg = total_waste_kg
        
        # Calculate recycling rate
        recycled_batches = db.query(WasteBatch).filter(WasteBatch.status == "Recycled").count()
        recycling_rate = (recycled_batches / total_batches * 100) if total_batches > 0 else 0.0

        stats = {
            "total_waste_registered_kg": total_waste_kg,
            "co2_saved_kg": round(co2_saved_kg, 1),
            "water_saved_liters": round(water_saved_liters, 1),
            "landfill_diverted_kg": round(landfill_diverted_kg, 1),
            "recycling_rate": round(recycling_rate, 1)
        }

    elif role == "Recycling Facility Operator":
        # Today's collections, pending batches, inventory locations
        today = date.today()
        todays_batches = db.query(WasteBatch).filter(WasteBatch.collection_date == today).count()
        todays_quantity = db.query(func.sum(WasteBatch.quantity)).filter(WasteBatch.collection_date == today).scalar() or 0.0
        pending_batches = db.query(WasteBatch).filter(WasteBatch.status == "Pending").count()
        sorting_batches = db.query(WasteBatch).filter(WasteBatch.status == "Sorting").count()
        
        stats = {
            "todays_collections_count": todays_batches,
            "todays_collections_kg": todays_quantity,
            "pending_batches_count": pending_batches,
            "sorting_batches_count": sorting_batches,
            "total_inventory_items": active_inventory_items
        }
        
    elif role == "Textile Manufacturer":
        # Batches submitted, quantity submitted, reports indicators
        # Filter metrics specifically to their organization
        org_id = current_user.organization_id
        org_waste_kg = db.query(func.sum(WasteBatch.quantity)).filter(WasteBatch.organization_id == org_id).scalar() or 0.0
        org_batches = db.query(WasteBatch).filter(WasteBatch.organization_id == org_id).count()
        org_recycled_kg = db.query(func.sum(WasteBatch.quantity)).filter(
            WasteBatch.organization_id == org_id,
            WasteBatch.status == "Recycled"
        ).scalar() or 0.0
        
        stats = {
            "submitted_batches": org_batches,
            "submitted_quantity_kg": org_waste_kg,
            "recycled_quantity_kg": org_recycled_kg,
            "available_recycled_yarn_kg": round(org_recycled_kg * 0.85, 1) # 85% yield estimation
        }
        
    charts = {
        "fabric_breakdown": fabric_breakdown,
        "status_breakdown": status_breakdown,
        "monthly_waste": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            "data": [1200, 1900, 3000, 2500, 3200, total_waste_kg, total_waste_kg * 1.1]
        }
    }

    # ─── Milestone 2: AI Intelligence Stats ─────────────────────────────────
    ai_stats = {}
    try:
        from app.predictions.service import PredictionService
        ai_stats = PredictionService.get_dashboard_ai_stats(db)
    except Exception as e:
        logger.warning(f"Could not load AI stats for dashboard: {e}")
        ai_stats = {
            "total_predictions": 0,
            "most_common_material": "N/A",
            "most_common_waste_category": "N/A",
            "average_confidence": 0.0,
            "recent_predictions": [],
            "recent_images": [],
        }

    return {
        "role": role,
        "stats": stats,
        "charts": charts,
        "activities": activities_json,
        "ai_stats": ai_stats,  # Milestone 2
    }
