from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from database import get_db
from models import User, AIAnalysis, Inventory
from routes.auth import get_current_user
from routes.admin import get_platform_reports
from sqlalchemy import func

router = APIRouter(prefix="/api/sustainability", tags=["sustainability"])


def _ensure_manager(user: User):
    if user.role != "Sustainability Manager" and user.role not in ["Administrator", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to access sustainability dashboard")


@router.get("/dashboard")
def sustainability_dashboard(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    _ensure_manager(current_user)

    reports = get_platform_reports(db)

    # Aggregate CO2 and water savings from AIAnalysis records
    records = db.query(AIAnalysis).all()
    total_co2 = round(sum((r.sustainability_metrics or {}).get('environmental_impact', {}).get('co2_savings_kg', 0) for r in records), 2)
    by_material = {}
    by_batch = []
    for r in records:
        mat = r.fabric_type
        by_material[mat] = by_material.get(mat, 0) + ((r.sustainability_metrics or {}).get('environmental_impact', {}).get('co2_savings_kg', 0) or 0)
        by_batch.append({
            "id": r.id,
            "batch_id": getattr(r, 'batch_id', None) or None,
            "fabric_type": r.fabric_type,
            "co2_savings_kg": (r.sustainability_metrics or {}).get('environmental_impact', {}).get('co2_savings_kg', 0)
        })

    material_list = [{"name": k, "value": round(v, 2)} for k, v in by_material.items()]

    # Waste diversion metrics from inventory & AIAnalysis
    total_waste = db.query(func.sum(Inventory.quantity)).scalar() or 0.0
    diverted = db.query(func.sum(Inventory.quantity)).filter(Inventory.status.in_(["Processing", "Recycled"])).scalar() or 0.0
    diversion_percent = round((diverted / total_waste) * 100, 1) if total_waste else 0.0

    payload = {
        "success": True,
        "summary": reports.get('summary', {}),
        "totals": {
            "total_co2_savings_kg": total_co2,
            "co2_by_material": material_list,
            "co2_by_batch": by_batch,
            "total_waste_kg": reports['summary'].get('total_waste_kg', total_waste),
            "total_waste_diverted_kg": round(diverted, 1),
            "waste_diversion_percent": diversion_percent,
        }
    }

    return payload


@router.get("/carbon")
def carbon_breakdown(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    _ensure_manager(current_user)
    records = db.query(AIAnalysis).all()
    total_co2 = 0.0
    by_material = {}
    by_batch = []
    for r in records:
        env = (r.sustainability_metrics or {}).get('environmental_impact', {})
        co2 = env.get('co2_savings_kg', 0) or 0
        total_co2 += co2
        by_material[r.fabric_type] = by_material.get(r.fabric_type, 0) + co2
        by_batch.append({"id": r.id, "fabric_type": r.fabric_type, "co2_savings_kg": co2})

    return {"success": True, "total_co2_savings_kg": round(total_co2, 2), "by_material": [{"name": k, "value": round(v, 2)} for k, v in by_material.items()], "by_batch": by_batch}


@router.get("/diversion")
def diversion_stats(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    _ensure_manager(current_user)
    total = db.query(func.sum(Inventory.quantity)).scalar() or 0.0
    diverted = db.query(func.sum(Inventory.quantity)).filter(Inventory.status.in_(["Processing", "Recycled"])).scalar() or 0.0
    reusable = db.query(func.sum(Inventory.quantity)).filter(Inventory.condition.in_(["Reusable", "Recyclable"])).scalar() or 0.0
    recyclable = db.query(func.sum(Inventory.quantity)).filter(Inventory.condition == "Recyclable").scalar() or 0.0

    return {
        "success": True,
        "total_waste_kg": round(total, 1),
        "total_diverted_kg": round(diverted, 1),
        "diversion_percent": round((diverted / total) * 100, 1) if total else 0.0,
        "reusable_kg": round(reusable, 1),
        "recyclable_kg": round(recyclable, 1),
    }
