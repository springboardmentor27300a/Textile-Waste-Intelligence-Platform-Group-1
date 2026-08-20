from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.db import get_db
from app.models.models import WasteBatch, User, RecyclingRecommendation
from app.auth.dependencies import get_current_user
from app.services.recommendation.engine import recommend_strategy
from app.schemas.sustainability import RecyclingRecommendationResponse, RecommendationCreateRequest, RecommendationDetail

router = APIRouter(prefix="/api/recommendation", tags=["Recycling Recommendation Engine"])
router_plural = APIRouter(prefix="/api/recommendations", tags=["Recycling Recommendation Engine Plural"])

@router.get("/{batch_id}", response_model=Dict[str, Any])
def get_batch_recommendations(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get ranked recycling strategy recommendations, upcycling ideas, and recovery tips for a batch.
    """
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {batch_id} not found."
        )
        
    return recommend_strategy(batch)

@router_plural.post("", response_model=RecyclingRecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendations(
    req: RecommendationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate and save recommendations for a batch.
    """
    # 1. Validate ID
    batch = db.query(WasteBatch).filter(WasteBatch.id == req.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Waste batch with ID {req.batch_id} not found."
        )
        
    # 2. Validate positive quantity
    if batch.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate/calculation error: Batch quantity must be positive."
        )
        
    # 3. Validate fabric type
    from app.services.sustainability.emission_factors import EMISSION_FACTORS
    if batch.fabric_type.lower() not in EMISSION_FACTORS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid fabric type: {batch.fabric_type}."
        )
        
    # 4. Validate duplicate calculation
    existing = db.query(RecyclingRecommendation).filter(RecyclingRecommendation.waste_batch_id == req.batch_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate calculation error: Recommendations already generated for this batch."
        )
        
    # Calculate
    recs_res = recommend_strategy(batch)
    ranked = recs_res["ranked_recommendations"]
    
    r1_strat = ranked[0]["strategy"] if len(ranked) > 0 else "DISPOSAL"
    r1_conf = ranked[0]["confidence_score"] if len(ranked) > 0 else 50
    r1_rat = ranked[0]["rationale"] if len(ranked) > 0 else "Default disposal recommendation."

    r2_strat = ranked[1]["strategy"] if len(ranked) > 1 else None
    r2_conf = ranked[1]["confidence_score"] if len(ranked) > 1 else 0
    r2_rat = ranked[1]["rationale"] if len(ranked) > 1 else None

    r3_strat = ranked[2]["strategy"] if len(ranked) > 2 else None
    r3_conf = ranked[2]["confidence_score"] if len(ranked) > 2 else 0
    r3_rat = ranked[2]["rationale"] if len(ranked) > 2 else None

    db_rec = RecyclingRecommendation(
        waste_batch_id=batch.id,
        recommendation_1_strategy=r1_strat,
        recommendation_1_confidence=float(r1_conf),
        recommendation_1_rationale=r1_rat,
        recommendation_2_strategy=r2_strat,
        recommendation_2_confidence=float(r2_conf),
        recommendation_2_rationale=r2_rat,
        recommendation_3_strategy=r3_strat,
        recommendation_3_confidence=float(r3_conf),
        recommendation_3_rationale=r3_rat
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    
    # Format response
    details = []
    details.append(RecommendationDetail(strategy=r1_strat, confidence=float(r1_conf), rationale=r1_rat))
    if r2_strat:
        details.append(RecommendationDetail(strategy=r2_strat, confidence=float(r2_conf), rationale=r2_rat))
    if r3_strat:
        details.append(RecommendationDetail(strategy=r3_strat, confidence=float(r3_conf), rationale=r3_rat))
        
    return {
        "id": db_rec.id,
        "waste_batch_id": db_rec.waste_batch_id,
        "recommendations": details
    }

@router_plural.get("/{batch_id}", response_model=RecyclingRecommendationResponse)
def get_saved_recommendations(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the saved recommendation for a batch.
    """
    db_rec = db.query(RecyclingRecommendation).filter(RecyclingRecommendation.waste_batch_id == batch_id).first()
    if not db_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendations for batch with ID {batch_id} not found."
        )
        
    details = []
    details.append(RecommendationDetail(
        strategy=db_rec.recommendation_1_strategy,
        confidence=db_rec.recommendation_1_confidence,
        rationale=db_rec.recommendation_1_rationale
    ))
    if db_rec.recommendation_2_strategy:
        details.append(RecommendationDetail(
            strategy=db_rec.recommendation_2_strategy,
            confidence=db_rec.recommendation_2_confidence,
            rationale=db_rec.recommendation_2_rationale
        ))
    if db_rec.recommendation_3_strategy:
        details.append(RecommendationDetail(
            strategy=db_rec.recommendation_3_strategy,
            confidence=db_rec.recommendation_3_confidence,
            rationale=db_rec.recommendation_3_rationale
        ))
        
    return {
        "id": db_rec.id,
        "waste_batch_id": db_rec.waste_batch_id,
        "recommendations": details
    }
