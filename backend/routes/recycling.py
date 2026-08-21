from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
from database import get_db
from models import User, Inventory, AIAnalysis
from routes.auth import get_current_user
from routes.admin import get_role_dashboard_summary
from sqlalchemy import func

router = APIRouter(prefix="/api/recycling", tags=["recycling"])


@router.get("/dashboard")
def recycling_dashboard(date_from: Optional[str] = None, date_to: Optional[str] = None, material: Optional[str] = None, status: Optional[str] = None, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Role guard - allow Recycling Facility Operators and Administrators
    allowed_roles = ["Recycling Facility Operator", "Administrator", "admin"]
    if current_user.role not in allowed_roles:
        # Allow Textile Manufacturers to view their own inventory
        if current_user.role != "Textile Manufacturer":
            raise HTTPException(status_code=403, detail="Not authorized to access recycling dashboard")

    # Reuse existing summary generator
    summary = get_role_dashboard_summary(current_user, db)

    # Get inventory based on role
    if current_user.role == "Textile Manufacturer":
        # Textile Manufacturers only see their own inventory
        query = db.query(Inventory).filter(Inventory.user_id == current_user.id)
    else:
        # Recycling Facility Operators and Administrators see all inventory
        query = db.query(Inventory)

    # Apply filters
    if material:
        query = query.filter(Inventory.fabric_type == material)
    if status:
        query = query.filter(Inventory.status == status)
    if date_from:
        try:
            df = datetime.fromisoformat(date_from)
            query = query.filter(Inventory.collection_date >= df)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date_from format")
    if date_to:
        try:
            end_date = datetime.fromisoformat(date_to)
            query = query.filter(Inventory.collection_date <= end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date_to format")

    records = query.order_by(Inventory.collection_date.desc()).all()

    # Build inventory list with AI analysis data
    inventory = []
    for r in records:
        # Try to find related AIAnalysis if exists
        ai = db.query(AIAnalysis).filter(AIAnalysis.user_id == r.user_id, AIAnalysis.fabric_type == r.fabric_type).order_by(AIAnalysis.timestamp.desc()).first()
        sustainability = ai.sustainability_metrics if ai else None
        scores = (sustainability or {}).get('scores', {}) if sustainability else {}
        inventory.append({
            "batch_id": r.batch_id,
            "fabric_type": r.fabric_type,
            "waste_category": r.condition,
            "quantity_kg": round(float(r.quantity or 0), 1),
            "condition": r.condition,
            "recyclability_score": scores.get('recyclability_score'),
            "circularity_score": scores.get('circularity_score'),
            "recovery_category": (sustainability or {}).get('waste_category') if sustainability else None,
            "processing_status": r.status,
            "recommended_action": (sustainability or {}).get('recommendations', []) if sustainability else [],
            "collection_date": r.collection_date.isoformat() if r.collection_date else None,
        })

    return {"success": True, "summary": summary, "inventory": inventory}


@router.get("/opportunities")
def recycling_opportunities(material: Optional[str] = None, min_score: Optional[float] = 60.0, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Role guard
    if current_user.role != "Recycling Facility Operator" and current_user.role not in ["Administrator", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to access recycling opportunities")

    # Join AIAnalysis and Inventory to find high-potential batches
    query = db.query(AIAnalysis, Inventory).join(Inventory, AIAnalysis.fabric_type == Inventory.fabric_type)
    if material:
        query = query.filter(AIAnalysis.fabric_type == material)

    results = []
    for analysis, inv in query.all():
        metrics = analysis.sustainability_metrics or {}
        scores = metrics.get('scores', {})
        recs = metrics.get('recommendations', analysis.recommendation or [])
        results.append({
            "batch_id": inv.batch_id,
            "material": analysis.fabric_type,
            "quantity_kg": round(float(inv.quantity or 0), 1),
            "recyclability_score": scores.get('recyclability_score', analysis.sustainability_score),
            "material_recovery_score": scores.get('material_recovery_score'),
            "circularity_score": scores.get('circularity_score'),
            "recommended_method": recs[0]['name'] if recs and len(recs) > 0 else None,
            "recommendation_confidence": recs[0].get('confidence') if recs and len(recs) > 0 else None,
            "processing_status": inv.status,
        })

    # Prioritize by recyclability, material recovery, circularity, and status
    def score_key(item):
        return (
            item.get('recyclability_score') or 0,
            item.get('material_recovery_score') or 0,
            item.get('circularity_score') or 0,
            1 if item.get('processing_status') in {'Pending', 'Collected'} else 0,
        )

    sorted_results = sorted(results, key=score_key, reverse=True)
    # Filter by min_score
    filtered = [r for r in sorted_results if (r.get('recyclability_score') or 0) >= (min_score or 0)]

    return {"success": True, "opportunities": filtered}
