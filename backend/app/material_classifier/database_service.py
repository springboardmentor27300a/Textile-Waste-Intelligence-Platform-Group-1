from sqlalchemy.orm import Session
from datetime import datetime

from app.models.predictions import Prediction


class PredictionDatabaseService:

    @staticmethod
    def save_prediction(
        db: Session,
        image_path: str,
        material: str,
        confidence: float,
        processing_time: float,
        user_id: int = None
    ):
        """
        Save AI prediction into database.
        """

        prediction = Prediction(
            image_path=image_path,
            material=material,
            confidence=confidence,
            processing_time=processing_time,
            created_at=datetime.utcnow(),
            user_id=user_id
        )

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return prediction