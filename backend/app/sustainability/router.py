"""
Sustainability Router — REST APIs for Milestone 3
===================================================
Contains REST endpoints for:
- POST /api/sustainability/analyze
- GET  /api/sustainability/history
- GET  /api/sustainability/{id}
- GET  /api/sustainability/reports
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.auth.deps import get_current_user
from app.sustainability.service import SustainabilityService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sustainability", tags=["Sustainability Intelligence"])


class AnalysisRequest(BaseModel):
    prediction_id: str
    weight_kg: Optional[float] = 100.0
    inventory_id: Optional[str] = None


@router.post("/analyze", status_code=status.HTTP_201_CREATED)
def run_sustainability_analysis(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Runs full sustainability and circular economy analysis on an AI prediction."""
    try:
        result = SustainabilityService.run_full_analysis(
            db=db,
            user_id=str(current_user.id),
            prediction_id=request.prediction_id,
            weight_kg=request.weight_kg or 100.0,
            inventory_id=request.inventory_id
        )
        return result
    except ValueError as e:
        logger.error(f"Analysis parameters error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Sustainability analysis pipeline failed: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis pipeline error")


@router.get("/history")
def get_sustainability_history(
    search: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    waste_category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves paginated sustainability analysis history records."""
    # Admins and Sustainability Managers see all logs. Others see their own.
    user_id = None
    if current_user.role.name not in ["Administrator", "Sustainability Manager"]:
        user_id = str(current_user.id)

    result = SustainabilityService.get_history(
        db=db,
        user_id=user_id,
        search=search,
        material=material,
        waste_category=waste_category,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return result


@router.get("/reports")
def get_sustainability_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves the list of generated sustainability reports."""
    stats = SustainabilityService.get_dashboard_stats(db)
    return stats.get("recent_sustainability_reports", [])


@router.get("/{id}")
def get_sustainability_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves detailed metrics of a single analysis by Prediction ID."""
    result = SustainabilityService.get_analysis_by_prediction_id(db, id)
    if not result:
        # Check by database ID if prediction ID fails
        from app.models.sustainability import SustainabilityAnalysis
        sa = db.query(SustainabilityAnalysis).filter(SustainabilityAnalysis.id == id).first()
        if sa:
            result = SustainabilityService.get_analysis_by_prediction_id(db, str(sa.prediction_id))

    if not result:
        raise HTTPException(status_code=404, detail="Sustainability analysis record not found")

    # Access control
    if current_user.role.name not in ["Administrator", "Sustainability Manager"] and result["user_name"] != current_user.full_name:
        raise HTTPException(status_code=403, detail="Access denied to this report")

    return result


@router.get("/dashboard/stats")
def get_sustainability_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve summarized statistics for dashboard extensions."""
    return SustainabilityService.get_dashboard_stats(db)
