"""
Classification Router — Milestone 2

Endpoints:
  POST /classification/material  → material type prediction from an uploaded image
  POST /classification/waste     → waste category prediction from a material name
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image_record import TextileImage
from app.image_schemas import (
    MaterialClassifyRequest,
    MaterialClassifyResponse,
    WasteClassifyRequest,
    WasteClassifyResponse,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.auth_service import get_current_user
from app.services import material_classifier
from app.services import waste_classifier
from app.services import recommendation_engine
from app.services import image_analyzer

router = APIRouter(prefix="/classification", tags=["Classification"])


# ── POST /classification/material ────────────────────────────────────────────

@router.post("/material", response_model=MaterialClassifyResponse)
def classify_material(
    body: MaterialClassifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Predict the material type of an uploaded textile image.

    - Looks up the image record by ``image_id``.
    - Passes the stored filename to ``material_classifier.classify()``.
    - Returns the predicted material and confidence score.
    """
    record = db.query(TextileImage).filter(TextileImage.id == body.image_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Image #{body.image_id} not found")

    result = material_classifier.classify(record.filename)

    return MaterialClassifyResponse(
        image_id=record.id,
        user_sequence_num=record.user_sequence_num,
        material=result["material"],
        confidence=result["confidence"],
        fabric_type=result["fabric_type"],
        fiber_composition=result["fiber_composition"],
        blend_identification=result["blend_identification"],
        material_quality=result["material_quality"],
        fabric_category=result["fabric_category"]
    )


# ── POST /classification/waste ────────────────────────────────────────────────

@router.post("/waste", response_model=WasteClassifyResponse)
def classify_waste(
    body: WasteClassifyRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Predict the waste category for a given textile material.

    - Accepts a ``material`` string (e.g. ``"Cotton"``, ``"Polyester"``).
    - Delegates to ``waste_classifier.classify()`` — same deterministic,
      pluggable pattern as ``material_classifier``.
    - Returns the waste ``category`` (aligned with the project WasteType enum)
      and a ``confidence`` score.
    - Does **not** require a DB session — material name is sufficient input.
    """
    try:
        result = waste_classifier.classify(body.material)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return WasteClassifyResponse(
        material=body.material,
        category=result["category"],
        confidence=result["confidence"],
        handling=result.get("handling", ""),
        disposal=result.get("disposal", ""),
        recyclability_assessment=result.get("recyclability_assessment", ""),
        reuse_potential=result.get("reuse_potential", ""),
        contamination_detection=result.get("contamination_detection", ""),
    )


# ── POST /classification/recommendations ──────────────────────────────────────

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    body: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get dynamic rule-based recycling recommendations based on material, waste category,
    and optional image analysis context (damage, contamination, recyclability).
    """
    damage = "Unknown"
    contamination = "Unknown"
    recyclability = "Unknown"
    reuse = "Unknown"
    
    # 1. Get waste category details for baseline recyclability/reuse
    try:
        waste_result = waste_classifier.classify(body.material)
        if waste_result["category"].lower() == body.category.lower():
            recyclability = waste_result.get("recyclability_assessment", "Unknown")
            reuse = waste_result.get("reuse_potential", "Unknown")
    except ValueError:
        pass
        
    # 2. Get image analysis for damage/contamination if image_id is provided
    if body.image_id:
        record = db.query(TextileImage).filter(TextileImage.id == body.image_id).first()
        if record:
            try:
                analysis = image_analyzer.analyze(record.filename)
                damage = analysis.get("damage_detection", {}).get("level", "Unknown")
                contamination = analysis.get("contamination_detection", {}).get("level", "Unknown")
            except Exception:
                pass

    result = recommendation_engine.get_recommendations(
        material=body.material,
        category=body.category,
        damage=damage,
        contamination=contamination,
        recyclability=recyclability,
        reuse_potential=reuse
    )
    return RecommendationResponse(**result)
