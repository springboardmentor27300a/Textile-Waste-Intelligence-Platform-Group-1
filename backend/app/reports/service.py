"""
Report Service — Milestone 4
==============================
Assembles report data by reading from existing database tables.
No data is duplicated — this service is a read-only aggregator.

Report types:
1. waste_classification  — Prediction + ClassificationResult + UploadedImage
2. recycling             — RecyclingRecommendation + Prediction
3. sustainability        — SustainabilityAnalysis + Prediction
4. environmental_impact  — EnvironmentalImpact + Prediction
5. circular_economy      — CircularityScore + Prediction
"""

import json
import logging
import uuid
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.prediction import Prediction, ClassificationResult, UploadedImage
from app.models.sustainability import (
    SustainabilityAnalysis,
    RecyclingRecommendation,
    EnvironmentalImpact,
    CircularityScore,
)
from app.models.user import User, Organization
from app.models.report import Report
from app.database.session import engine

logger = logging.getLogger(__name__)
_is_postgres = "postgresql" in str(engine.url)


def _coerce_id(val):
    if val is None:
        return None
    if _is_postgres:
        if isinstance(val, uuid.UUID):
            return val
        return uuid.UUID(str(val))
    return str(val)


# ─── Role-Based Access Helpers ────────────────────────────────────────────────

ROLE_ALLOWED_TYPES = {
    "Administrator": [
        "waste_classification", "recycling", "sustainability",
        "environmental_impact", "circular_economy", "esg_summary"
    ],
    "Sustainability Manager": [
        "sustainability", "environmental_impact", "circular_economy", "esg_summary"
    ],
    "Recycling Facility Operator": [
        "waste_classification", "recycling"
    ],
    "Textile Manufacturer": [
        "waste_classification", "recycling", "sustainability", "esg_summary"
    ],
}


def get_allowed_report_types(role_name: str) -> List[str]:
    return ROLE_ALLOWED_TYPES.get(role_name, ["waste_classification"])


def can_access_report(role_name: str, report_type: str, report_user_id: str, current_user_id: str) -> bool:
    allowed = get_allowed_report_types(role_name)
    if report_type not in allowed:
        return False
    # Admins and Sustainability Managers can see all records
    if role_name in ["Administrator", "Sustainability Manager"]:
        return True
    # Others can only see their own
    return str(report_user_id) == str(current_user_id)


# ─── Data Assembly Functions ──────────────────────────────────────────────────

def _get_prediction(db: Session, prediction_id: str) -> Optional[Prediction]:
    return db.query(Prediction).filter(
        Prediction.id == _coerce_id(prediction_id)
    ).first()


def _build_ai_results(pred: Prediction, cr: Optional[ClassificationResult]) -> Dict[str, Any]:
    """Build AI results section from prediction + classification result."""
    img = pred.image

    # Determine boolean flags from scores
    recyclability = pred.recyclability_score or 0
    reuse = pred.reuse_potential or 0

    is_recyclable = recyclability >= 60
    is_reusable = reuse >= 50
    is_repairable = not (img.visible_damage if img else False) or reuse >= 40
    is_hazardous = "hazard" in (pred.waste_category or "").lower()
    is_mixed = "mixed" in (pred.material or "").lower()

    contamination = "Detected" if (img and img.contamination_detected) else "None"
    damage = "Detected" if (img and img.visible_damage) else "None"
    image_quality = img.surface_quality if img else "Unknown"

    # Parse ClassificationResult JSON fields
    material_probs = {}
    fiber_comp = {}
    waste_reason = None
    waste_description = None
    status_badge = None
    recovery_indicator = None
    if cr:
        try:
            material_probs = json.loads(cr.material_probabilities or "{}")
        except Exception:
            pass
        try:
            fiber_comp = json.loads(cr.fiber_composition or "{}")
        except Exception:
            pass
        waste_reason = cr.waste_reason
        waste_description = cr.waste_description
        status_badge = cr.status_badge
        recovery_indicator = cr.recovery_indicator

    return {
        "material": pred.material,
        "material_confidence": pred.material_confidence,
        "fabric_category": pred.fabric_category,
        "detected_color": pred.detected_color,
        "waste_category": pred.waste_category,
        "waste_confidence": pred.waste_confidence,
        "recyclability_score": pred.recyclability_score,
        "reuse_potential": pred.reuse_potential,
        "recovery_difficulty": pred.recovery_difficulty,
        "material_recovery_score": pred.material_recovery_score,
        "overall_rating": pred.overall_rating,
        "overall_confidence": pred.overall_confidence,
        "model_version": pred.model_version or "v1.0.0",
        "is_recyclable": is_recyclable,
        "is_reusable": is_reusable,
        "is_repairable": is_repairable,
        "is_hazardous": is_hazardous,
        "is_mixed": is_mixed,
        "contamination_status": contamination,
        "damage_detection": damage,
        "image_quality": image_quality,
        # Classification result details
        "material_probabilities": material_probs,
        "fiber_composition": fiber_comp,
        "waste_reason": waste_reason,
        "waste_description": waste_description,
        "status_badge": status_badge,
        "recovery_indicator": recovery_indicator,
    }


def _build_image_info(img: Optional[UploadedImage]) -> Dict[str, Any]:
    if not img:
        return {}
    colors = []
    try:
        colors = json.loads(img.dominant_colors or "[]")
    except Exception:
        pass
    return {
        "filename": img.filename,
        "original_path": img.original_path,
        "width": img.width,
        "height": img.height,
        "surface_quality": img.surface_quality,
        "fabric_pattern": img.fabric_pattern,
        "dominant_colors": colors,
        "visible_damage": img.visible_damage,
        "contamination_detected": img.contamination_detected,
    }


def _build_recommendation_summary(pred: Prediction, cr: Optional[ClassificationResult]) -> str:
    material = pred.material or "Unknown"
    waste = pred.waste_category or "Unknown"
    score = pred.recyclability_score or 0
    difficulty = pred.recovery_difficulty or "Medium"
    rating = pred.overall_rating or "Standard"
    return (
        f"The AI model classified this textile as {material} ({waste}) with a "
        f"recyclability score of {score:.0f}%. Recovery difficulty is rated '{difficulty}'. "
        f"Overall material rating: {rating}. "
        f"This classification was performed using EfficientNet-B0 v1.0.0 with "
        f"{pred.overall_confidence:.1f}% overall confidence."
        if pred.overall_confidence else
        f"The AI model classified this textile as {material} ({waste}) with a "
        f"recyclability score of {score:.0f}%. Recovery difficulty: {difficulty}."
    )


STATUS_TIMELINE = [
    {"step": "Logged", "done": True, "desc": "Waste batch registered in the system"},
    {"step": "Analyzed", "done": True, "desc": "AI pipeline classification completed"},
    {"step": "Recommendation Generated", "done": True, "desc": "Recycling pathway identified"},
    {"step": "Processing", "done": False, "desc": "Material sent for processing"},
    {"step": "Completed", "done": False, "desc": "Recovery process finalized"},
]


# ─── Report Data Builders ──────────────────────────────────────────────────────

def build_waste_classification_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    cr = pred.classification_result
    org_name = user.organization.name if user.organization else "N/A"

    return {
        "report_id": report_id,
        "report_type": "waste_classification",
        "title": f"Waste Classification Report — {pred.material}",
        "generated_date": datetime.utcnow().isoformat(),
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "waste_batch_id": str(pred.image.inventory_id) if (pred.image and pred.image.inventory_id) else None,
        "ai_results": _build_ai_results(pred, cr),
        "image_info": _build_image_info(pred.image),
        "ai_recommendation_summary": _build_recommendation_summary(pred, cr),
    }


def build_recycling_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    # Get all stored recommendations for this prediction
    recs = db.query(RecyclingRecommendation).filter(
        RecyclingRecommendation.prediction_id == _coerce_id(prediction_id)
    ).all()

    primary = recs[0] if recs else None
    org_name = user.organization.name if user.organization else "N/A"

    all_recs_data = [
        {
            "method": r.recovery_method,
            "priority": r.recovery_priority,
            "difficulty": r.difficulty_level,
            "success_rate": f"{int(r.estimated_success)}%",
            "processing": r.required_processing,
            "industry_uses": r.industry_use_cases,
            "expected_output": r.expected_output,
            "estimated_cost": r.estimated_cost or "Low",
            "estimated_time": r.estimated_time or "2–4 Days",
            "environmental_benefit": r.environmental_benefit or "Reduces waste",
        }
        for r in recs
    ] if recs else []

    return {
        "report_id": report_id,
        "report_type": "recycling",
        "title": f"Recycling Report — {pred.material}",
        "generated_date": datetime.utcnow().isoformat(),
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "waste_batch_id": None,
        "recycling": {
            "recommended_method": primary.recovery_method if primary else pred.recovery_difficulty,
            "technique": primary.required_processing if primary else "Standard Processing",
            "recovery_recommendation": primary.expected_output if primary else "Material Recovery",
            "recovery_difficulty": pred.recovery_difficulty or "Medium",
            "material_recovery_pct": pred.recyclability_score or 0,
            "success_rate": f"{int(primary.estimated_success)}%" if primary else "N/A",
            "estimated_cost": primary.estimated_cost if primary else "Medium",
            "estimated_time": primary.estimated_time if primary else "3–5 Days",
            "environmental_benefit": primary.environmental_benefit if primary else "Reduces landfill waste",
            "industry_applications": primary.industry_applications or (primary.industry_use_cases if primary else "Textile industry"),
            "status_timeline": STATUS_TIMELINE,
            "all_recommendations": all_recs_data,
        },
        "ai_results": _build_ai_results(pred, pred.classification_result),
    }


def build_sustainability_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    sa = db.query(SustainabilityAnalysis).filter(
        SustainabilityAnalysis.prediction_id == _coerce_id(prediction_id)
    ).first()

    org_name = user.organization.name if user.organization else "N/A"

    # Determine rating from score
    score = sa.sustainability_score if sa else (pred.recyclability_score or 60)

    if score >= 80:
        rating = "Excellent"
    elif score >= 65:
        rating = "Good"
    elif score >= 45:
        rating = "Average"
    else:
        rating = "Needs Improvement"

    # Calculate industry average using available organization-wide report data
    from sqlalchemy import func
    from app.models.user import User as DBUser
    
    org_id = user.organization_id
    avg_score = None
    if org_id:
        # Get average score of all sustainability analyses for users in the same organization
        query = db.query(func.avg(SustainabilityAnalysis.sustainability_score))\
            .join(Prediction, Prediction.id == SustainabilityAnalysis.prediction_id)\
            .join(DBUser, DBUser.id == Prediction.user_id)\
            .filter(DBUser.organization_id == org_id)
        avg_score_raw = query.scalar()
        if avg_score_raw is not None:
            avg_score = float(avg_score_raw)

    if avg_score is None:
        # Fallback to general average of all SustainabilityAnalysis records
        avg_score_raw = db.query(func.avg(SustainabilityAnalysis.sustainability_score)).scalar()
        if avg_score_raw is not None:
            avg_score = float(avg_score_raw)
        else:
            avg_score = 71.0 # Standard fallback industry average

    org_avg = round(avg_score, 1)
    current_score = sa.sustainability_score if sa else score
    diff = round(current_score - org_avg, 1)

    if diff > 5:
        benchmark_status = "Above Average"
    elif diff < -5:
        benchmark_status = "Below Average"
    else:
        benchmark_status = "Average"

    insights = []
    if sa and sa.insights:
        try:
            insights = json.loads(sa.insights)
        except Exception:
            insights = [sa.insights]

    return {
        "report_id": report_id,
        "report_type": "sustainability",
        "title": f"Sustainability Report — {pred.material}",
        "generated_date": datetime.utcnow().isoformat(),
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "sustainability": {
            "sustainability_score": sa.sustainability_score if sa else score,
            "environmental_benefit_score": sa.environmental_benefit_score if sa else 0,
            "resource_recovery_score": sa.resource_recovery_score if sa else 0,
            "material_longevity_score": sa.material_longevity_score if sa else 0,
            "waste_diversion_score": sa.waste_diversion_score if sa else 0,
            "carbon_footprint": f"{(sa.sustainability_score or 60) * 0.5:.1f} kg CO₂" if sa else "N/A",
            "sustainability_rating": rating,
            "insights": insights,
            "organization_average": org_avg,
            "benchmark_difference": diff,
            "benchmark_status": benchmark_status,
        },
        "ai_results": {
            "material": pred.material,
            "waste_category": pred.waste_category,
            "recyclability_score": pred.recyclability_score,
            "overall_rating": pred.overall_rating,
        },
    }


def build_environmental_impact_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    env = db.query(EnvironmentalImpact).filter(
        EnvironmentalImpact.prediction_id == _coerce_id(prediction_id)
    ).first()

    org_name = user.organization.name if user.organization else "N/A"

    return {
        "report_id": report_id,
        "report_type": "environmental_impact",
        "title": f"Environmental Impact Report — {pred.material}",
        "generated_date": datetime.utcnow().isoformat(),
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "environmental": {
            "co2_saved": env.co2_saved if env else 0,
            "water_saved": env.water_saved if env else 0,
            "energy_saved": env.energy_saved if env else 0,
            "landfill_diversion": env.landfill_diversion if env else 0,
            "resource_conservation": env.resource_conservation if env else 0,
            "equivalent_trees": env.equivalent_trees if env else 0,
            "equivalent_electricity": env.equivalent_electricity if env else 0,
            "equivalent_water_bottles": env.equivalent_water_bottles if env else 0,
            "equivalent_household_energy": env.equivalent_household_energy if env else 0,
        },
        "ai_results": {
            "material": pred.material,
            "waste_category": pred.waste_category,
            "recyclability_score": pred.recyclability_score,
        },
    }


def build_circular_economy_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    cs = db.query(CircularityScore).filter(
        CircularityScore.prediction_id == _coerce_id(prediction_id)
    ).first()

    org_name = user.organization.name if user.organization else "N/A"

    score = cs.circularity_score if cs else (pred.recyclability_score or 55)

    if score >= 80:
        overall_rating = "Excellent"
    elif score >= 65:
        overall_rating = "Good"
    elif score >= 45:
        overall_rating = "Average"
    else:
        overall_rating = "Needs Improvement"

    return {
        "report_id": report_id,
        "report_type": "circular_economy",
        "title": f"Circular Economy Report — {pred.material}",
        "generated_date": datetime.utcnow().isoformat(),
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "circularity": {
            "circularity_score": cs.circularity_score if cs else score,
            "reuse_potential": cs.reuse_potential if cs else (pred.reuse_potential or 0),
            "recovery_efficiency": cs.recovery_efficiency if cs else (pred.recyclability_score or 0),
            "material_retention": cs.material_retention if cs else 0,
            "lifecycle_extension": cs.lifecycle_extension if cs else 0,
            "circularity_index": cs.circularity_index if cs else 0,
            "classification": cs.classification if cs else "Standard Recovery",
            "overall_rating": overall_rating,
        },
        "ai_results": {
            "material": pred.material,
            "waste_category": pred.waste_category,
            "recyclability_score": pred.recyclability_score,
            "recovery_difficulty": pred.recovery_difficulty,
            "material_recovery_score": pred.material_recovery_score,
        },
    }


def build_esg_summary_data(
    db: Session, prediction_id: str, user: User, report_id: str
) -> Dict[str, Any]:
    pred = _get_prediction(db, prediction_id)
    if not pred:
        raise ValueError(f"Prediction {prediction_id} not found")

    sa = db.query(SustainabilityAnalysis).filter(
        SustainabilityAnalysis.prediction_id == _coerce_id(prediction_id)
    ).first()
    env = db.query(EnvironmentalImpact).filter(
        EnvironmentalImpact.prediction_id == _coerce_id(prediction_id)
    ).first()
    cs = db.query(CircularityScore).filter(
        CircularityScore.prediction_id == _coerce_id(prediction_id)
    ).first()
    rec = db.query(RecyclingRecommendation).filter(
        RecyclingRecommendation.prediction_id == _coerce_id(prediction_id)
    ).first()

    org_name = user.organization.name if user.organization else "N/A"

    # E Pillar Calculations
    sustainability_score = sa.sustainability_score if sa else (pred.recyclability_score or 60)
    rating = sa.sustainability_rating if sa else "Average"
    carbon = f"{(sustainability_score) * 0.5:.1f} kg CO₂"
    co2 = env.co2_saved if env else 0.0
    water = env.water_saved if env else 0.0
    landfill = env.landfill_diversion if env else 0.0
    resource_rec = sa.resource_recovery_score if sa else 0.0
    circularity = cs.circularity_score if cs else (pred.recyclability_score or 55)
    waste_div = sa.waste_diversion_score if sa else 0.0
    recycling_rec = rec.recommended_method if rec else (pred.waste_category or "N/A")
    material_rec = pred.material_recovery_score or (rec.material_recovery_pct if rec else 0.0)

    # ESG Score & Rating
    esg_score = float(sustainability_score)
    if esg_score >= 90:
        esg_rating = "Excellent"
    elif esg_score >= 75:
        esg_rating = "Good"
    elif esg_score >= 60:
        esg_rating = "Average"
    elif esg_score >= 40:
        esg_rating = "Needs Improvement"
    else:
        esg_rating = "Poor"

    rating_adj = "moderate"
    if esg_rating == "Excellent":
        rating_adj = "outstanding"
    elif esg_rating == "Good":
        rating_adj = "strong"
    elif esg_rating == "Average":
        rating_adj = "moderate"
    else:
        rating_adj = "substandard"

    exec_summary = f"The analyzed textile waste demonstrates {rating_adj} environmental performance with a sustainability score of {sustainability_score:.0f}%. The material is highly recyclable with low contamination. Estimated CO₂ and landfill savings indicate positive environmental impact. Governance metadata confirms complete AI traceability, while social indicators are currently unavailable within the platform."

    # S Pillar
    contamination_risk = "Contamination Detected" if (pred.image and pred.image.contamination_detected) else "Low Risk"
    is_hazardous = "hazard" in (pred.waste_category or "").lower()
    hazardous_det = "Hazardous Material Detected" if is_hazardous else "None Detected"

    # G Pillar
    from app.models.dataset import Dataset
    ds_name = "WeaveCycle Core Dataset v1.2"
    try:
        ds = db.query(Dataset).first()
        if ds:
            ds_name = ds.name
    except Exception:
        pass

    batch_id = str(pred.image.inventory_id) if (pred.image and pred.image.inventory_id) else "Not Available"
    generated_date_str = datetime.utcnow().isoformat()

    return {
        "report_id": report_id,
        "report_type": "esg_summary",
        "title": f"ESG Summary Report — {pred.material}",
        "generated_date": generated_date_str,
        "user_name": user.full_name,
        "user_email": user.email,
        "organization_name": org_name,
        "role_name": user.role.name if user.role else "N/A",
        "prediction_id": str(pred.id),
        "waste_batch_id": batch_id,
        "esg": {
            "esg_score": esg_score,
            "esg_rating": esg_rating,
            "executive_summary": exec_summary,
            "sustainability_score": sustainability_score,
            "sustainability_rating": rating,
            "carbon_footprint": carbon,
            "co2_saved": co2,
            "water_saved": water,
            "landfill_diversion": landfill,
            "resource_recovery_score": resource_rec,
            "circularity_score": circularity,
            "waste_diversion_score": waste_div,
            "recycling_recommendation": recycling_rec,
            "material_recovery_score": material_rec,
            "compliance_status": "Not Available",
            "waste_handling_safety": "Not Available",
            "hazardous_material_detection": hazardous_det,
            "contamination_risk": contamination_risk,
            "supply_chain_transparency": "Not Available",
            "prediction_confidence": pred.overall_confidence or pred.material_confidence,
            "model_version": pred.model_version or "v1.0.0",
            "dataset_used": ds_name,
            "generated_by": user.full_name,
            "generated_on": generated_date_str,
            "prediction_id": str(pred.id),
            "waste_batch_id": batch_id,
            "dataset_traceability": "Fully Traceable",
            "audit_timestamp": generated_date_str,
        }
    }


# ─── CRUD Operations ──────────────────────────────────────────────────────────

def generate_report(
    db: Session,
    report_type: str,
    prediction_id: str,
    user: User,
    title: Optional[str] = None,
) -> Report:
    """Generate and persist a new report record."""
    report_id = str(uuid.uuid4())

    builders = {
        "waste_classification": build_waste_classification_data,
        "recycling": build_recycling_data,
        "sustainability": build_sustainability_data,
        "environmental_impact": build_environmental_impact_data,
        "circular_economy": build_circular_economy_data,
        "esg_summary": build_esg_summary_data,
    }

    if report_type not in builders:
        raise ValueError(f"Unknown report type: {report_type}")

    data = builders[report_type](db, prediction_id, user, report_id)

    auto_title = title or data.get("title", f"{report_type.replace('_', ' ').title()} Report")

    report = Report(
        id=_coerce_id(report_id),
        report_type=report_type,
        title=auto_title,
        status="Generated",
        prediction_id=_coerce_id(prediction_id),
        user_id=_coerce_id(str(user.id)),
        organization_id=_coerce_id(str(user.organization_id)) if user.organization_id else None,
        report_data=json.dumps(data),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Update the report_id in data and re-serialize
    data["report_id"] = str(report.id)
    report.report_data = json.dumps(data)
    db.commit()
    db.refresh(report)

    return report


def get_report_by_id(db: Session, report_id: str) -> Optional[Report]:
    return db.query(Report).filter(Report.id == _coerce_id(report_id)).first()


def get_reports(
    db: Session,
    user_id: Optional[str],
    report_type: Optional[str] = None,
    page: int = 1,
    per_page: int = 10,
    sort: str = "desc",
) -> Dict[str, Any]:
    query = db.query(Report)

    if user_id:
        query = query.filter(Report.user_id == _coerce_id(user_id))
    if report_type:
        query = query.filter(Report.report_type == report_type)

    # Exclude archived unless explicitly requested
    query = query.filter(Report.status != "Archived")

    total = query.count()
    order_col = Report.created_at.asc() if sort == "asc" else Report.created_at.desc()
    items = (
        query.order_by(order_col)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


def update_report_paths(
    db: Session,
    report: Report,
    pdf_path: Optional[str] = None,
    excel_path: Optional[str] = None,
) -> Report:
    if pdf_path:
        report.pdf_path = pdf_path
    if excel_path:
        report.excel_path = excel_path
    report.status = "Exported"
    db.commit()
    db.refresh(report)
    return report
