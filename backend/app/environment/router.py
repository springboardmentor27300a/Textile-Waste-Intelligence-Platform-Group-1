"""
Environmental Impact Router — REST APIs for Milestone 3
=========================================================
POST /api/environment/assess
GET  /api/environment
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.sustainability import EnvironmentalImpact
from app.sustainability.service import SustainabilityService, _coerce_id

router = APIRouter(prefix="/environment", tags=["Environmental Impact Assessment"])


class AssessRequest(BaseModel):
    prediction_id: str
    weight_kg: Optional[float] = 100.0


@router.post("/assess")
def assess_environmental_impact(
    request: AssessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assess and estimate ecological savings based on material and weight."""
    pred = db.query(Prediction).filter(Prediction.id == _coerce_id(request.prediction_id)).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    env = SustainabilityService.assess_environmental_impact(
        pred.material, pred.waste_category, request.weight_kg or 100.0
    )
    return env


@router.get("")
@router.get("/")
def get_environmental_impact(
    prediction_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves saved environmental impact records, optionally filtered by Prediction ID."""
    query = db.query(EnvironmentalImpact)
    if prediction_id:
        query = query.filter(EnvironmentalImpact.prediction_id == _coerce_id(prediction_id))

    records = query.all()
    return [
        {
            "id": str(r.id),
            "prediction_id": str(r.prediction_id),
            "co2_saved": r.co2_saved,
            "water_saved": r.water_saved,
            "energy_saved": r.energy_saved,
            "landfill_diversion": r.landfill_diversion,
            "resource_conservation": r.resource_conservation,
            "equivalent_trees": r.equivalent_trees,
            "equivalent_electricity": r.equivalent_electricity,
            "equivalent_water_bottles": r.equivalent_water_bottles,
            "equivalent_household_energy": r.equivalent_household_energy
        }
        for r in records
    ]
