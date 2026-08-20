"""
SustainabilityAssessment model - stores the output of one Milestone 3
Sustainability Intelligence + Environmental Impact + Waste Scoring run,
tied 1:1 to the AnalysisResult it was computed from.
"""

from datetime import datetime
import json
from app import db


class SustainabilityAssessment(db.Model):
    __tablename__ = "sustainability_assessments"

    id = db.Column(db.Integer, primary_key=True)

    analysis_result_id = db.Column(
        db.Integer, db.ForeignKey("analysis_results.id"), nullable=False, unique=True
    )
    inventory_item_id = db.Column(db.Integer, db.ForeignKey("inventory_items.id"), nullable=True)

    material = db.Column(db.String(40), nullable=False)
    waste_category = db.Column(db.String(40), nullable=False)
    quantity_kg = db.Column(db.Float, nullable=False, default=1.0)

    # Environmental Impact Assessment Engine
    co2_saved_kg = db.Column(db.Float, nullable=False)
    water_saved_liters = db.Column(db.Float, nullable=False)
    landfill_diverted_kg = db.Column(db.Float, nullable=False)
    diversion_rate_pct = db.Column(db.Float, nullable=False)
    diversion_level = db.Column(db.String(30), nullable=False)
    raw_material_conserved_kg = db.Column(db.Float, nullable=False)
    energy_conserved_kwh = db.Column(db.Float, nullable=False)
    report_text = db.Column(db.Text, nullable=False)

    # Sustainability Intelligence Engine
    circular_loop_stage = db.Column(db.String(120), nullable=True)
    loop_closed = db.Column(db.Boolean, default=True)
    recoverable_material_kg = db.Column(db.Float, nullable=True)
    recovery_efficiency_pct = db.Column(db.Float, nullable=True)
    benchmark_baseline_score = db.Column(db.Float, nullable=True)
    benchmark_delta = db.Column(db.Float, nullable=True)
    benchmark_label = db.Column(db.String(40), nullable=True)

    # Recycling Recommendation Workflow
    recommended_pathway = db.Column(db.String(40), nullable=True)
    suggested_partner_type = db.Column(db.String(80), nullable=True)
    recommendation_priority = db.Column(db.String(10), nullable=True)
    recommendation_steps_json = db.Column(db.Text, nullable=True)

    # Waste Scoring Engine
    recyclability_score = db.Column(db.Float, nullable=False)
    material_condition_score = db.Column(db.Float, nullable=False)
    reuse_score = db.Column(db.Float, nullable=False)
    environmental_benefit_score = db.Column(db.Float, nullable=False)
    processing_feasibility_score = db.Column(db.Float, nullable=False)
    sustainability_score = db.Column(db.Float, nullable=False)
    material_recovery_score = db.Column(db.Float, nullable=False)
    circularity_score = db.Column(db.Float, nullable=False)
    circularity_category = db.Column(db.String(40), nullable=False)

    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "analysis_result_id": self.analysis_result_id,
            "inventory_item_id": self.inventory_item_id,
            "material": self.material,
            "waste_category": self.waste_category,
            "quantity_kg": self.quantity_kg,

            "co2_saved_kg": self.co2_saved_kg,
            "water_saved_liters": self.water_saved_liters,
            "landfill_diverted_kg": self.landfill_diverted_kg,
            "diversion_rate_pct": self.diversion_rate_pct,
            "diversion_level": self.diversion_level,
            "raw_material_conserved_kg": self.raw_material_conserved_kg,
            "energy_conserved_kwh": self.energy_conserved_kwh,
            "report_text": self.report_text,

            "circular_loop_stage": self.circular_loop_stage,
            "loop_closed": self.loop_closed,
            "recoverable_material_kg": self.recoverable_material_kg,
            "recovery_efficiency_pct": self.recovery_efficiency_pct,
            "benchmark_baseline_score": self.benchmark_baseline_score,
            "benchmark_delta": self.benchmark_delta,
            "benchmark_label": self.benchmark_label,

            "recommended_pathway": self.recommended_pathway,
            "suggested_partner_type": self.suggested_partner_type,
            "recommendation_priority": self.recommendation_priority,
            "recommendation_steps": json.loads(self.recommendation_steps_json) if self.recommendation_steps_json else [],

            "recyclability_score": self.recyclability_score,
            "material_condition_score": self.material_condition_score,
            "reuse_score": self.reuse_score,
            "environmental_benefit_score": self.environmental_benefit_score,
            "processing_feasibility_score": self.processing_feasibility_score,
            "sustainability_score": self.sustainability_score,
            "material_recovery_score": self.material_recovery_score,
            "circularity_score": self.circularity_score,
            "circularity_category": self.circularity_category,

            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
