from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.image_service import ImageService
from ..services.prediction_service import PredictionService

router = APIRouter(prefix="/api/predictions", tags=["AI Predictions"])

image_service = ImageService()
prediction_service = PredictionService()


@router.post("/", response_model=schemas.PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    image_path = None
    try:
        image_path = image_service.save_image(image)
        result = prediction_service.predict(image_path=image_path, db=db, user_id=current_user.id)
        return result
    except (ValueError, FileNotFoundError, RuntimeError, OSError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Prediction processing failed. Please upload a valid image and try again.",
        ) from exc
    finally:
        if image_path:
            try:
                image_service.delete_image(image_path)
            except Exception:
                pass


@router.get("/history", response_model=list[schemas.PredictionHistoryResponse])
def prediction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == current_user.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )
