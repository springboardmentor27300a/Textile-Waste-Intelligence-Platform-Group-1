"""
Circularity Score Router — REST APIs for Milestone 3
======================================================
POST /api/circularity/calculate
GET  /api/circularity
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.sustainability import CircularityScore
from app.sustainability.service import SustainabilityService, _coerce_id

router = APIRouter(prefix="/circularity", tags=["Circular Economy Analytics"])


class CalculateCircularityRequest(BaseModel):
    prediction_id: str


@router.post("/calculate")
def calculate_circularity(
    request: CalculateCircularityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate circular economy metrics for a textile prediction."""
    pred = db.query(Prediction).filter(Prediction.id == _coerce_id(request.prediction_id)).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    circ = SustainabilityService.calculate_circularity_scores(
        pred.material, pred.waste_category, pred.recyclability_score, pred.recovery_difficulty
    )
    return circ


@router.get("")
@router.get("/")
def get_circularity(
    prediction_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves saved circularity scores, optionally filtered by Prediction ID."""
    query = db.query(CircularityScore)
    if prediction_id:
        query = query.filter(CircularityScore.prediction_id == _coerce_id(prediction_id))

    records = query.all()
    return [
        {
            "id": str(r.id),
            "prediction_id": str(r.prediction_id),
            "circularity_score": r.circularity_score,
            "reuse_potential": r.reuse_potential,
            "recovery_efficiency": r.recovery_efficiency,
            "material_retention": r.material_retention,
            "lifecycle_extension": r.lifecycle_extension,
            "circularity_index": r.circularity_index,
            "classification": r.classification
        }
        for r in records
    ]
