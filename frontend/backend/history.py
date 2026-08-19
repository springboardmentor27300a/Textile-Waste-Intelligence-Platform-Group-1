from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import PredictionHistory

router = APIRouter(
    prefix="/history",
    tags=["Prediction History"]
)


@router.get("/")
def get_history(db: Session = Depends(get_db)):

    predictions = db.query(
        PredictionHistory
    ).order_by(
        PredictionHistory.created_at.desc()
    ).all()

    result = []

    for item in predictions:

        result.append({

            "id": item.id,

            "image_name": item.image_name,

            "fabric_type": item.fabric_type,

            "confidence": item.confidence,

            "waste_category": item.waste_category,

            "carbon_saved": item.carbon_saved,

            "sustainability_score": item.sustainability_score,

            "environmental_impact": item.environmental_impact,

            "created_at": item.created_at

        })

    return result