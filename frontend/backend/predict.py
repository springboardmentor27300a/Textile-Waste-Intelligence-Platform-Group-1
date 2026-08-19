from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import shutil
import os

from ai.predict import predict_fabric
from backend.sustainability import calculate_sustainability
from backend.database import get_db
from backend.models import PredictionHistory

router = APIRouter(
    prefix="/predict",
    tags=["AI Prediction"]
)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/")
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ------------------------------------------
    # Validate Image
    # ------------------------------------------

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are allowed."
        )

    # ------------------------------------------
    # Save Uploaded Image
    # ------------------------------------------

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ------------------------------------------
    # AI Prediction
    # ------------------------------------------

    result = predict_fabric(file_path)

    fabric = result["fabric_type"]
    confidence = result["confidence"]

    # ------------------------------------------
    # Rule-Based Fabric Information
    # ------------------------------------------

    fabric_info = {

        "Cotton": {
            "composition": "80% Cotton, 20% Linen",
            "visual_assessment": "No major visible defects",
            "category": "Reusable",
            "recommended_disposal": "Reuse as cleaning cloth or recycle into textile fibers."
        },

        "Linen": {
            "composition": "95% Linen, 5% Cotton",
            "visual_assessment": "Minor wrinkles observed",
            "category": "Reusable",
            "recommended_disposal": "Reuse or recycle into natural textile fibers."
        },

        "Silk": {
            "composition": "90% Silk, 10% Cotton",
            "visual_assessment": "No visible defects",
            "category": "Reusable",
            "recommended_disposal": "Luxury textile recycling or garment reuse."
        },

        "Wool": {
            "composition": "85% Wool, 15% Cotton",
            "visual_assessment": "Minor tear observed",
            "category": "Recyclable",
            "recommended_disposal": "Mechanical fiber recycling."
        },

        "Hessian": {
            "composition": "95% Hessian, 5% Jute",
            "visual_assessment": "Surface wear detected",
            "category": "Recyclable",
            "recommended_disposal": "Chemical fiber recovery or industrial recycling."
        },

        "Abaca": {
            "composition": "100% Abaca",
            "visual_assessment": "No visible defects",
            "category": "Biodegradable",
            "recommended_disposal": "Industrial composting or natural biodegradation."
        }

    }

    info = fabric_info.get(
        fabric,
        {
            "composition": "Unknown",
            "visual_assessment": "Manual inspection recommended",
            "category": "Unknown",
            "recommended_disposal": "Consult textile waste management guidelines."
        }
    )

    # ------------------------------------------
    # Sustainability Engine
    # ------------------------------------------

    sustainability = calculate_sustainability(
        fabric=fabric,
        quantity=1
    )

    # ------------------------------------------
    # Save Prediction History
    # ------------------------------------------

    prediction = PredictionHistory(

        image_name=file.filename,

        fabric_type=fabric,

        confidence=confidence,

        composition=info["composition"],

        visual_assessment=info["visual_assessment"],

        waste_category=info["category"],

        recommendation=info["recommended_disposal"],

        carbon_saved=f'{sustainability["carbon_saved"]} kg CO₂',

        estimated_emission=f'{sustainability["estimated_emission"]} kg CO₂',

        waste_diversion=f'{sustainability["waste_diversion"]}%',

        circular_economy=sustainability["circular_economy"],

        sustainability_score=sustainability["sustainability_score"],

        environmental_impact=sustainability["environmental_impact"],

        water_usage=sustainability["water_usage"]

    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # ------------------------------------------
    # Final Response
    # ------------------------------------------

    return {

        "fabric_type": fabric,

        "confidence": confidence,

        "estimated_composition": info["composition"],

        "visual_assessment": info["visual_assessment"],

        "waste_category": info["category"],

        "recommended_disposal": info["recommended_disposal"],

        "carbon_saved": f'{sustainability["carbon_saved"]} kg CO₂',

        "estimated_emission": f'{sustainability["estimated_emission"]} kg CO₂',

        "waste_diversion": f'{sustainability["waste_diversion"]}%',

        "circular_economy": sustainability["circular_economy"],

        "sustainability_score": sustainability["sustainability_score"],

        "rating": (
            "★★★★★ Excellent"
            if sustainability["sustainability_score"] >= 90
            else "★★★★ Good"
            if sustainability["sustainability_score"] >= 80
            else "★★★ Average"
        ),

        "environmental_impact": sustainability["environmental_impact"],

        "water_usage": sustainability["water_usage"]

    }