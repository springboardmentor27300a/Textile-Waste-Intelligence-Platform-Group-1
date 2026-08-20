from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.db import get_db
from app.models.models import WasteBatch, User
from app.auth.dependencies import get_current_user
from app.services.impact.engine import (
    estimate_co2_savings,
    estimate_water_savings,
    landfill_reduction,
    generate_sustainability_report
)

router = APIRouter(prefix="/api/impact", tags=["Environmental Impact Assessment"])

@router.get("/{batch_id}", response_model=Dict[str, Any])
def get_batch_impact(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get environmental savings metrics (CO2, water, landfill reduction) for a specific waste batch.
    """
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {batch_id} not found."
        )
        
    strategy = batch.status
    if strategy.lower() in ["collected", "sorting"]:
        strategy = "MECHANICAL_RECYCLING"
        
    co2 = estimate_co2_savings(strategy, batch.fabric_type, batch.quantity)
    water = estimate_water_savings(strategy, batch.fabric_type, batch.quantity)
    
    # Diversion analysis
    diversion_rate = 0.0 if batch.status.lower() == "disposed" else 100.0
    landfill_reduced = landfill_reduction(batch.quantity, diversion_rate)
    
    return {
        "batch_id": batch.id,
        "co2_saved_kg": co2,
        "water_saved_L": water,
        "landfill_reduced_kg": landfill_reduced
    }

@router.get("/report/{entity_id}", response_model=Dict[str, Any])
def get_entity_sustainability_report(
    entity_id: int,
    period: str = Query("monthly", description="Report period: monthly, quarterly, annual"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an aggregated environmental impact and sustainability report for an entity.
    """
    # Fetch batches matching operator_id or inventory_id, fallback to all batches if empty
    batches = db.query(WasteBatch).filter(
        (WasteBatch.operator_id == entity_id) | (WasteBatch.inventory_id == entity_id)
    ).all()
    
    if not batches:
        batches = db.query(WasteBatch).all()
        
    return generate_sustainability_report(entity_id, period, batches)
