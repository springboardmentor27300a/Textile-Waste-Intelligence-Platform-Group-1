from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/material-insights", tags=["Material Insights"])


@router.get("", response_model=list[schemas.MaterialInsightOut])
def list_insights(fabric_type: str | None = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    q = db.query(models.MaterialInsight)
    if fabric_type: q = q.filter(models.MaterialInsight.matched_fabric_type == fabric_type)
    return q.order_by(models.MaterialInsight.sample_size.desc()).all()
