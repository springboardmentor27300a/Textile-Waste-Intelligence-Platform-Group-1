"""
Recommendations Router — REST APIs for Milestone 3
===================================================
POST /api/recommendations/generate
GET  /api/recommendations
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.session import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.sustainability import RecyclingRecommendation
from app.sustainability.service import SustainabilityService, _coerce_id

router = APIRouter(prefix="/recommendations", tags=["Recycling Recommendations"])


class RecommendRequest(BaseModel):
    prediction_id: str


@router.post("/generate")
def generate_recommendations(
    request: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and returns recycling recommendations for a prediction."""
    pred = db.query(Prediction).filter(Prediction.id == _coerce_id(request.prediction_id)).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    condition = {
        "visible_damage": pred.image.visible_damage if pred.image else False,
        "contamination_detected": pred.image.contamination_detected if pred.image else False,
        "wrinkle_detected": pred.image.wrinkle_detected if pred.image else False,
        "tear_detected": pred.image.tear_detected if pred.image else False,
        "surface_quality": pred.image.surface_quality if pred.image else "Good",
    }

    recs = SustainabilityService.generate_recommendations(
        pred.material, pred.waste_category, pred.recyclability_score, pred.recovery_difficulty, condition
    )
    return [
        {
            "recovery_method": r["recovery_method"],
            "method": r["recovery_method"],
            "recovery_priority": r["recovery_priority"],
            "priority": r["recovery_priority"],
            "difficulty_level": r["difficulty_level"],
            "difficulty": r["difficulty_level"],
            "estimated_success": r["estimated_success"],
            "success_rate": f"{int(r['estimated_success'])}%" if isinstance(r['estimated_success'], (int, float)) else str(r['estimated_success']),
            "required_processing": r["required_processing"],
            "processing_description": r["required_processing"],
            "industry_use_cases": r["industry_use_cases"],
            "industry_applications": r.get("industry_applications", r["industry_use_cases"]),
            "industry_application": r.get("industry_applications", r["industry_use_cases"]),
            "expected_output": r["expected_output"],
            "expected_output_material": r["expected_output"],
            "reason": r.get("reason", "Chosen based on material composition and condition parameters."),
            "environmental_benefit": r.get("environmental_benefit", "Reduces virgin fiber consumption."),
            "estimated_cost": r.get("estimated_cost", "Low"),
            "estimated_time": r.get("estimated_time", "2–4 Days")
        }
        for r in recs
    ]


@router.get("")
@router.get("/")
def get_recommendations(
    prediction_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves stored recycling recommendations, optionally filtered by Prediction ID."""
    query = db.query(RecyclingRecommendation)
    if prediction_id:
        query = query.filter(RecyclingRecommendation.prediction_id == _coerce_id(prediction_id))

    recs = query.all()
    return [
        {
            "id": str(r.id),
            "prediction_id": str(r.prediction_id),
            "recovery_method": r.recovery_method,
            "method": r.recovery_method,
            "recovery_priority": r.recovery_priority,
            "priority": r.recovery_priority,
            "difficulty_level": r.difficulty_level,
            "difficulty": r.difficulty_level,
            "estimated_success": r.estimated_success,
            "success_rate": f"{int(r.estimated_success)}%" if isinstance(r.estimated_success, (int, float)) else str(r.estimated_success),
            "required_processing": r.required_processing,
            "processing_description": r.required_processing,
            "industry_use_cases": r.industry_use_cases,
            "industry_applications": r.industry_applications or r.industry_use_cases,
            "industry_application": r.industry_applications or r.industry_use_cases,
            "expected_output": r.expected_output,
            "expected_output_material": r.expected_output,
            "reason": r.reason or "Chosen based on material composition and condition parameters.",
            "environmental_benefit": r.environmental_benefit or "Reduces virgin fiber consumption.",
            "estimated_cost": r.estimated_cost or "Low",
            "estimated_time": r.estimated_time or "2–4 Days",
            "cost_estimate": r.estimated_cost or "Low",
            "time_estimate": r.estimated_time or "2–4 Days",
            "created_at": r.created_at.isoformat()
        }
        for r in recs
    ]
