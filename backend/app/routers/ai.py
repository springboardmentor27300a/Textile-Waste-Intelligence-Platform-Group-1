from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PredictionResponse
from app.services.image_service import ImageService
from app.services.prediction_service import PredictionService

router = APIRouter(
    prefix="/ai",
    tags=["Artificial Intelligence"]
)

image_service = ImageService()
prediction_service = PredictionService()


@router.get("/")
def health_check():
    return {
        "status": "running",
        "service": "Textile AI Engine"
    }


@router.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict_textile(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_path = None

    try:

        image_path = image_service.save_image(image)

        result = prediction_service.predict(
            image_path=image_path,
            db=db,
            user_id=None
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if image_path:
            try:
                image_service.delete_image(image_path)
            except:
                pass


@router.delete("/delete")
def delete_uploaded_image(path: str):

    try:

        image_service.delete_image(path)

        return {
            "success": True,
            "message": "Image deleted successfully."
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )