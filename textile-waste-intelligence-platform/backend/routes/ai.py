from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import Optional, List
from db import get_db
from models import User, AIAnalysis, AIAnalysisCreate, AIAnalysisResponse, Notification
from routes.auth import get_current_user
from ai_engine import analyze_textile_image
from sustainability_engine import get_circularity_category, get_waste_category_from_circularity

router = APIRouter(prefix="/api/ai", tags=["ai"])

def serialize_analysis(record: AIAnalysis):
    if not record:
        return None

    sustainability_payload = record.sustainability_metrics or {}
    score_payload = sustainability_payload.get("scores", {}) or {}
    circularity_score = score_payload.get("circularity_score")
    derived_circularity_category = sustainability_payload.get("circularity_category")
    if not derived_circularity_category and circularity_score is not None:
        derived_circularity_category = get_circularity_category(circularity_score)
    derived_waste_category = sustainability_payload.get("waste_category") or record.waste_category
    if not derived_waste_category and derived_circularity_category:
        derived_waste_category = get_waste_category_from_circularity(derived_circularity_category)

    return {
        "id": record.id,
        "user_id": record.user_id,
        "image_url": record.image_url,
        "fabric_type": record.fabric_type,
        "fabric_confidence": sustainability_payload.get("fabric_confidence", record.confidence_score),
        "defect_status": sustainability_payload.get("defect_status") or (
            "NoDefect"
            if record.material_prediction.get("NoDefect", 0)
            >= record.material_prediction.get("Defect", 0)
            else "Defect"
        ),
        "defect_confidence": sustainability_payload.get("defect_confidence", max(record.material_prediction.values())),
        "material_prediction": record.material_prediction,
        "waste_category": derived_waste_category,
        "confidence_score": record.confidence_score,
        "sustainability_score": record.sustainability_score,
        "recommendation": record.recommendation,
        "recommendations": sustainability_payload.get("recommendations", record.recommendation or []),
        "visual_features": record.visual_features,
        "sustainability_metrics": sustainability_payload,
        "scores": score_payload,
        "circularity_category": derived_circularity_category,
        "environmental_impact": sustainability_payload.get("environmental_impact", {}),
        "reference_factors": sustainability_payload.get("reference_factors", {}),
        "timestamp": record.timestamp.isoformat() if record.timestamp else None,
        "user": {
            "name": record.user.fullname if record.user else "System",
            "email": record.user.email if record.user else ""
        }
    }

@router.post("/analyze", status_code=201)
def analyze_image(data: AIAnalysisCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    if not data.image:
        raise HTTPException(status_code=400, detail="No image content provided")
        
    try:
        # Run image through prediction pipeline
        result = analyze_textile_image(data.image)
        
        sustainability_payload = {
            **result.get("metrics", {}),
            "scores": result.get("scores", {}),
            "circularity_category": result.get("circularity_category"),
            "environmental_impact": result.get("environmental_impact", {}),
            "fabric_confidence": result.get("fabric_confidence"),
            "defect_status": result.get("defect_status"),
            "defect_confidence": result.get("defect_confidence"),
            "recommendations": result.get("recommendations", []),
            "reference_factors": result.get("reference_factors", {}),
        }

        # Save analysis to database
        analysis = AIAnalysis(
            user_id=current_user.id,
            image_url=data.image,
            fabric_type=result["fabric_type"],
            material_prediction=result["material_prediction"],
            waste_category=result["waste_category"],
            confidence_score=result["confidence_score"],
            sustainability_score=result["metrics"]["sustainability_score"],
            recommendation=result.get("recommendations", []),
            visual_features=result["visual_features"],
            sustainability_metrics=sustainability_payload
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Generate a user notification for completed AI analysis
        notification = Notification(
            user_id=current_user.id,
            title='AI analysis completed',
            message=f'Completed analysis for {result["fabric_type"]} with category {result["waste_category"]}.',
            notification_type='AI Alerts',
            is_read=False,
            context={"analysis_id": analysis.id, "source": "ai"}
        )
        db.add(notification)
        db.commit()
        
        response_payload = {
            "success": True,
            "message": "AI image analysis completed successfully",
            "analysis": serialize_analysis(analysis)
        }
        response_payload["analysis"]["scores"] = result.get("scores", {})
        response_payload["analysis"]["circularity_category"] = result.get("circularity_category")
        response_payload["analysis"]["environmental_impact"] = result.get("environmental_impact", {})
        response_payload["analysis"]["recommendations"] = result.get("recommendations", [])
        response_payload["analysis"]["reference_factors"] = result.get("reference_factors", {})
        response_payload["analysis"]["defect_status"] = result.get("defect_status", "NoDefect")
        response_payload["analysis"]["defect_confidence"] = result.get("defect_confidence", result.get("confidence_score", 0))
        return response_payload
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI inference processing failed: {str(e)}")

@router.get("/history")
def get_analysis_history(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    query = db.query(AIAnalysis)
    
    # Scoping: Standard users only see their own analyses. Admins can see all.
    is_admin = current_user.role in ["admin", "Administrator"]
    if not is_admin:
        query = query.filter(AIAnalysis.user_id == current_user.id)
        
    records = query.order_by(AIAnalysis.timestamp.desc()).all()
    return {
        "success": True,
        "history": [serialize_analysis(r) for r in records]
    }

@router.get("/history/{id}")
def get_analysis_detail(id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    record = db.query(AIAnalysis).filter(AIAnalysis.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="AI Analysis record not found")
        
    # Scoping guard
    is_admin = current_user.role in ["admin", "Administrator"]
    if not is_admin and record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this analysis record")
        
    return {
        "success": True,
        "analysis": serialize_analysis(record)
    }

@router.get("/stats")
def get_ai_stats(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    query = db.query(AIAnalysis)
    
    # Scope check
    is_admin = current_user.role in ["admin", "Administrator"]
    if not is_admin:
        query = query.filter(AIAnalysis.user_id == current_user.id)
        
    records = query.all()
    total_analyzed = len(records)
    
    if total_analyzed > 0:
        avg_sustainability = round(sum(r.sustainability_score for r in records) / total_analyzed, 1)
        avg_circularity = round(
            sum(
                (r.sustainability_metrics or {}).get("scores", {}).get("circularity_score", r.sustainability_score)
                for r in records
            ) / total_analyzed,
            1,
        )
        total_co2_savings = round(
            sum((r.sustainability_metrics or {}).get("environmental_impact", {}).get("co2_savings_kg", 0) for r in records),
            2,
        )
        total_water_savings = round(
            sum((r.sustainability_metrics or {}).get("environmental_impact", {}).get("water_savings_liters", 0) for r in records),
            1,
        )
        waste_diversion_percentage = round(
            sum((r.sustainability_metrics or {}).get("environmental_impact", {}).get("landfill_reduction_percent", 0) for r in records) / total_analyzed,
            1,
        )
        material_recovery_performance = round(
            sum((r.sustainability_metrics or {}).get("scores", {}).get("material_recovery_score", 0) for r in records) / total_analyzed,
            1,
        )
        average_resource_conservation = round(
            sum((r.sustainability_metrics or {}).get("environmental_impact", {}).get("resource_conservation_score", 0) for r in records) / total_analyzed,
            1,
        )
    else:
        avg_sustainability = 0.0
        avg_circularity = 0.0
        average_resource_conservation = 0.0
        total_co2_savings = 0.0
        total_water_savings = 0.0
        waste_diversion_percentage = 0.0
        material_recovery_performance = 0.0

    # Fabric type distribution
    material_distribution = {}
    for r in records:
        material_distribution[r.fabric_type] = material_distribution.get(r.fabric_type, 0) + 1
    material_list = [{"name": k, "value": v} for k, v in material_distribution.items()]

    # Category distribution
    category_distribution = {}
    for r in records:
        category_distribution[r.waste_category] = category_distribution.get(r.waste_category, 0) + 1
    category_list = [{"name": k, "value": v} for k, v in category_distribution.items()]

    circularity_distribution = {}
    for r in records:
        category_label = (r.sustainability_metrics or {}).get("circularity_category") or "Moderate Recovery Potential"
        circularity_distribution[category_label] = circularity_distribution.get(category_label, 0) + 1
    circularity_distribution_list = [{"name": k, "value": v} for k, v in circularity_distribution.items()]

    # Recommendation breakdown
    rec_distribution = {}
    for r in records:
        # Get primary (first ranked) recommendation name
        if r.recommendation and len(r.recommendation) > 0:
            rec_name = r.recommendation[0].get("name", "Unknown")
            rec_distribution[rec_name] = rec_distribution.get(rec_name, 0) + 1
    rec_list = [{"name": k, "value": v} for k, v in rec_distribution.items()]

    # Recent list (5 records)
    sorted_records = sorted(records, key=lambda x: x.timestamp, reverse=True)
    recent = [serialize_analysis(r) for r in sorted_records[:5]]

    return {
        "success": True,
        "stats": {
            "total_analyzed": total_analyzed,
            "average_sustainability": avg_sustainability,
            "average_circularity_score": avg_circularity,
            "average_resource_conservation": average_resource_conservation,
            "total_co2_savings_kg": total_co2_savings,
            "total_water_savings_liters": total_water_savings,
            "waste_diversion_percentage": waste_diversion_percentage,
            "material_recovery_performance": material_recovery_performance,
            "material_distribution": material_list,
            "category_distribution": category_list,
            "circularity_distribution": circularity_distribution_list,
            "recommendation_distribution": rec_list,
            "recent_analyses": recent,
        }
    }
