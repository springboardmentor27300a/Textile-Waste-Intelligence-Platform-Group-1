"""
Prediction CRUD Service
========================
Handles all database operations for AI prediction records.
Handles both PostgreSQL UUID and SQLite String(36) ID types.
"""

import json
import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.prediction import UploadedImage, Prediction, ClassificationResult, PredictionReport
from app.models.user import User
from app.database.session import engine

logger = logging.getLogger(__name__)

_is_postgres = "postgresql" in str(engine.url)


def _coerce_id(val):
    """Convert an ID value to the correct type for the current database.
    PostgreSQL: return uuid.UUID object
    SQLite: return str
    """
    if val is None:
        return None
    if _is_postgres:
        if isinstance(val, uuid.UUID):
            return val
        return uuid.UUID(str(val))
    else:
        return str(val)


class PredictionService:
    """CRUD service for AI prediction data."""

    @staticmethod
    def save_uploaded_image(
        db: Session,
        user_id,
        filename: str,
        original_path: str,
        metadata: Dict[str, Any],
        features: Dict[str, Any],
        inventory_id=None,
    ) -> UploadedImage:
        """Persist an uploaded image with its metadata and extracted features."""
        img = UploadedImage(
            filename=filename,
            original_path=original_path,
            processed_path=features.get("processed_image_path"),
            file_size=metadata.get("file_size"),
            file_hash=metadata.get("file_hash"),
            content_type=metadata.get("content_type"),
            width=metadata.get("width"),
            height=metadata.get("height"),
            format=metadata.get("format"),
            dominant_colors=json.dumps(features.get("dominant_colors", [])),
            texture_complexity=features.get("texture_complexity"),
            fabric_pattern=features.get("fabric_pattern"),
            brightness=features.get("brightness"),
            contrast=features.get("contrast"),
            visible_damage=features.get("visible_damage", False),
            contamination_detected=features.get("contamination_detected", False),
            wrinkle_detected=features.get("wrinkle_detected", False),
            tear_detected=features.get("tear_detected", False),
            surface_quality=features.get("surface_quality"),
            uploader_id=_coerce_id(user_id),
            inventory_id=_coerce_id(inventory_id) if inventory_id else None,
        )
        db.add(img)
        db.commit()
        db.refresh(img)
        logger.info(f"Saved uploaded image: {img.id} ({filename})")
        return img

    @staticmethod
    def save_full_prediction(
        db: Session,
        user_id,
        image_id,
        pipeline_result: Dict[str, Any],
    ) -> Prediction:
        """Save the full AI pipeline result to the database."""
        mat = pipeline_result.get("material_details", {})
        waste = pipeline_result.get("waste_details", {})
        rec = pipeline_result.get("recyclability_details", {})

        pred = Prediction(
            image_id=_coerce_id(image_id),
            user_id=_coerce_id(user_id),
            material=pipeline_result.get("material", "Unknown"),
            material_confidence=pipeline_result.get("confidence", 0.0),
            fabric_category=mat.get("fabric_category"),
            detected_color=mat.get("detected_color"),
            texture_description=mat.get("texture_description"),
            waste_category=pipeline_result.get("waste_category", "Unknown"),
            waste_confidence=waste.get("confidence", 0.0),
            material_quality=waste.get("material_quality"),
            severity_level=waste.get("severity_level"),
            recyclability_score=rec.get("recyclability_score"),
            reuse_potential=rec.get("reuse_potential"),
            recovery_difficulty=rec.get("recovery_difficulty"),
            material_recovery_score=rec.get("material_recovery_score"),
            overall_rating=rec.get("overall_rating"),
            overall_confidence=pipeline_result.get("overall_confidence"),
            status=pipeline_result.get("status", "Success"),
        )
        db.add(pred)
        db.commit()
        db.refresh(pred)

        # ClassificationResult detail record
        detail = ClassificationResult(
            prediction_id=_coerce_id(pred.id),
            material_probabilities=json.dumps(mat.get("probabilities", {})),
            fiber_composition=json.dumps(mat.get("fiber_composition", {})),
            material_properties=json.dumps(mat.get("properties", {})),
            waste_reason=waste.get("reason"),
            waste_description=waste.get("description"),
            status_badge=waste.get("status_badge"),
            recovery_indicator=rec.get("recovery_indicator"),
            image_features_json=json.dumps(pipeline_result.get("image_features", {})),
        )
        db.add(detail)

        # Auto-generate report record
        user = db.query(User).filter(User.id == _coerce_id(user_id)).first()
        org_name = user.organization.name if (user and user.organization) else "WeaveCycle"
        report = PredictionReport(
            prediction_id=_coerce_id(pred.id),
            user_id=_coerce_id(user_id),
            report_title=(
                f"Textile Analysis Report — {pipeline_result.get('material', 'Unknown')} "
                f"({datetime.now().strftime('%Y-%m-%d %H:%M')})"
            ),
            summary=(
                f"Material: {pipeline_result.get('material')} | "
                f"Waste: {pipeline_result.get('waste_category')} | "
                f"Recyclability: {rec.get('recyclability_score', 0):.1f}% | "
                f"Recovery: {rec.get('recovery_difficulty')} | "
                f"Organization: {org_name}"
            ),
            status="Generated",
        )
        db.add(report)
        db.commit()
        db.refresh(pred)

        logger.info(f"Saved full prediction: {pred.id} for image {image_id}")
        return pred

    @staticmethod
    def get_predictions(
        db: Session,
        user_id=None,
        material: Optional[str] = None,
        waste_category: Optional[str] = None,
        page: int = 1,
        per_page: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve paginated prediction list with filters."""
        query = db.query(Prediction)

        if user_id:
            query = query.filter(Prediction.user_id == _coerce_id(user_id))
        if material:
            query = query.filter(Prediction.material.ilike(f"%{material}%"))
        if waste_category:
            query = query.filter(Prediction.waste_category.ilike(f"%{waste_category}%"))
        if search:
            query = query.filter(
                Prediction.material.ilike(f"%{search}%") |
                Prediction.waste_category.ilike(f"%{search}%")
            )

        total = query.count()

        sort_col = getattr(Prediction, sort_by, Prediction.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        items = query.offset((page - 1) * per_page).limit(per_page).all()
        pages = (total + per_page - 1) // per_page if total > 0 else 1

        return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}

    @staticmethod
    def get_prediction_by_id(db: Session, prediction_id) -> Optional[Prediction]:
        return db.query(Prediction).filter(Prediction.id == _coerce_id(prediction_id)).first()

    @staticmethod
    def get_reports(
        db: Session,
        user_id=None,
        page: int = 1,
        per_page: int = 10,
    ) -> Dict[str, Any]:
        """Retrieve paginated reports list."""
        query = db.query(PredictionReport)
        if user_id:
            query = query.filter(PredictionReport.user_id == _coerce_id(user_id))

        total = query.count()
        items = (
            query.order_by(PredictionReport.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return {"items": items, "total": total, "page": page, "per_page": per_page}

    @staticmethod
    def get_image_by_id(db: Session, image_id) -> Optional[UploadedImage]:
        return db.query(UploadedImage).filter(UploadedImage.id == _coerce_id(image_id)).first()

    @staticmethod
    def get_dashboard_ai_stats(db: Session) -> Dict[str, Any]:
        """Get AI prediction stats for dashboard integration."""
        from sqlalchemy import func

        total_predictions = db.query(Prediction).count()

        material_counts = (
            db.query(Prediction.material, func.count(Prediction.id))
            .group_by(Prediction.material)
            .order_by(func.count(Prediction.id).desc())
            .first()
        )
        most_common_material = material_counts[0] if material_counts else "N/A"

        waste_counts = (
            db.query(Prediction.waste_category, func.count(Prediction.id))
            .group_by(Prediction.waste_category)
            .order_by(func.count(Prediction.id).desc())
            .first()
        )
        most_common_waste = waste_counts[0] if waste_counts else "N/A"

        avg_confidence = db.query(func.avg(Prediction.overall_confidence)).scalar() or 0.0

        recent_preds = (
            db.query(Prediction)
            .order_by(Prediction.created_at.desc())
            .limit(5)
            .all()
        )

        recent_images = (
            db.query(UploadedImage)
            .order_by(UploadedImage.created_at.desc())
            .limit(5)
            .all()
        )

        return {
            "total_predictions": total_predictions,
            "most_common_material": most_common_material,
            "most_common_waste_category": most_common_waste,
            "average_confidence": round(float(avg_confidence), 1),
            "recent_predictions": [
                {
                    "id": str(p.id),
                    "material": p.material,
                    "waste_category": p.waste_category,
                    "confidence": p.overall_confidence,
                    "recyclability": p.recyclability_score,
                    "status": p.status,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                for p in recent_preds
            ],
            "recent_images": [
                {
                    "id": str(i.id),
                    "filename": i.filename,
                    "path": i.original_path,
                    "surface_quality": i.surface_quality,
                    "created_at": i.created_at.isoformat() if i.created_at else None,
                }
                for i in recent_images
            ],
        }
