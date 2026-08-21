"""
AnalysisResult model - stores the output of one image-analysis run through
the Milestone 2 Material Classification + Waste Classification pipeline,
so results can be browsed as history and optionally linked to an
InventoryItem.
"""

import json
from datetime import datetime
from app import db


class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"

    id = db.Column(db.Integer, primary_key=True)

    thumbnail_base64 = db.Column(db.Text, nullable=True)

    # Material Classification Engine output
    predicted_material = db.Column(db.String(40), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    fiber_category = db.Column(db.String(20), nullable=True)
    blend_type = db.Column(db.String(20), nullable=True)
    fiber_composition_json = db.Column(db.Text, nullable=True)
    quality_estimate = db.Column(db.String(20), nullable=True)
    quality_score = db.Column(db.Float, nullable=True)

    # Waste Classification Engine output
    waste_category = db.Column(db.String(40), nullable=False)
    recyclability_score = db.Column(db.Float, nullable=True)
    reuse_potential = db.Column(db.String(20), nullable=True)
    contamination_detected = db.Column(db.Boolean, default=False)
    damage_detected = db.Column(db.Boolean, default=False)
    disposal_recommendation = db.Column(db.Text, nullable=True)
    recommended_routes_json = db.Column(db.Text, nullable=True)

    # Raw visual features (for transparency / debugging in the UI)
    features_json = db.Column(db.Text, nullable=True)

    inventory_item_id = db.Column(db.Integer, db.ForeignKey("inventory_items.id"), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "thumbnail_base64": self.thumbnail_base64,
            "predicted_material": self.predicted_material,
            "confidence": self.confidence,
            "fiber_category": self.fiber_category,
            "blend_type": self.blend_type,
            "fiber_composition": json.loads(self.fiber_composition_json) if self.fiber_composition_json else {},
            "quality_estimate": self.quality_estimate,
            "quality_score": self.quality_score,
            "waste_category": self.waste_category,
            "recyclability_score": self.recyclability_score,
            "reuse_potential": self.reuse_potential,
            "contamination_detected": self.contamination_detected,
            "damage_detected": self.damage_detected,
            "disposal_recommendation": self.disposal_recommendation,
            "recommended_recycling_routes": json.loads(self.recommended_routes_json) if self.recommended_routes_json else [],
            "features": json.loads(self.features_json) if self.features_json else {},
            "inventory_item_id": self.inventory_item_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
