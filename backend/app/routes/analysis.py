import os
import shutil

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.services.analysis_service import AnalysisService
from app.services.history_service import HistoryService
from app.services.decision_engine import DecisionEngine
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis"]
)

analysis_service = AnalysisService()
decision_engine = DecisionEngine()


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ===============================
    # Create uploads folder
    # ===============================

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join(
        "uploads",
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ===============================
    # AI Analysis
    # ===============================

    result = analysis_service.analyze(file_path)

    # ===============================
    # Decision Engine
    # ===============================

    decision_result = decision_engine.classify(
        material=result["material"],
        damage=result["damage"],
        quality=result["quality"]
    )

    # Merge AI result + Decision Engine
    result.update(decision_result)

    # ===============================
    # Save History
    # ===============================

    history_service = HistoryService(db)

    print("========== DEBUG ==========")
    print(result["waste_scoring"])
    print(result["circular_economy"])
    print("===========================")

    history_service.save_analysis(
        image_name=file.filename,
        material=result["material"],
        damage=result["damage"],
        quality=result["quality"],
        recommendation=result["recommendation"],
        material_classification=result["material_classification"],
        waste_classification=result["waste_classification"],
        recycling_engine=result["recycling_engine"],
        sustainability=result["sustainability"],
        environmental_analytics=result["environmental_analytics"],
        waste_scoring=result["waste_scoring"],
        circular_economy=result["circular_economy"],
        benchmark=result["benchmark"],
        analyzed_by=current_user.id
)
    # ===============================
    # Recycling Opportunity Alert
    # ===============================

    waste_scoring = result.get(
        "waste_scoring",
        {}
    )

    recommendation = result.get(
        "recommendation",
        {}
    )

    recycling_engine = result.get(
        "recycling_engine",
        {}
    )

    circularity_score = waste_scoring.get(
        "circularity_score",
        0
    )

    recommended_action = recommendation.get(
        "recommended_action",
        ""
    )

    recommended_method = recycling_engine.get(
        "recommended_method",
        ""
    )

    fabric_reuse = recycling_engine.get(
        "fabric_reuse",
        ""
    )

    if (
        circularity_score >= 75
        and (
            recommended_action in [
                "Recycle",
                "Reuse",
                "Upcycle",
                "Repair"
            ]
            or recommended_method
            or fabric_reuse == "Recommended"
        )
    ):

        NotificationService.create_notification(

            db=db,

            user_id=current_user.id,

            title="Recycling Opportunity",

            message=(
                f"Analysis of {file.filename} shows "
                f"strong textile recovery potential "
                f"with a circularity score of "
                f"{circularity_score}/100. "
                f"Recommended action: "
                f"{recommended_action}."
            ),

            notification_type="recycling_opportunity",

            priority="high"
        )
    # ===============================
    # Return Final Result
    # ===============================

    return result