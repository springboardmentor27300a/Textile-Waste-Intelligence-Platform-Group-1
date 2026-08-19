"""
Milestone 3: Sustainability Intelligence & Recommendations routes.

POST /api/sustainability/assess/<result_id>  - (re)run the sustainability
                                                assessment for an analysis
                                                result, optionally with a
                                                real quantity_kg
GET  /api/sustainability/<result_id>          - fetch the stored assessment
                                                for an analysis result
GET  /api/sustainability/dashboard            - circular economy analytics
                                                aggregated across all
                                                assessments
GET  /api/sustainability/reference            - reference data: impact
                                                factors, scoring weights,
                                                circularity categories
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import func
import json

from app import db
from app.models.analysis import AnalysisResult
from app.models.sustainability import SustainabilityAssessment
from app.utils.security import token_required
from app.ml import sustainability_engine as engine

sustainability_bp = Blueprint("sustainability", __name__)


def run_assessment_for_result(result: AnalysisResult, quantity_kg: float, created_by=None) -> SustainabilityAssessment:
    """Runs all Milestone 3 engines for a given AnalysisResult and
    creates/updates its linked SustainabilityAssessment row."""
    scores = engine.compute_waste_scores(
        material=result.predicted_material,
        quantity_kg=quantity_kg,
        waste_category=result.waste_category,
        recyclability_score=result.recyclability_score or 0.0,
        quality_score=result.quality_score or 0.0,
        reuse_potential=result.reuse_potential or "Low",
        damage_score=1.0 if result.damage_detected else 0.2,
        contamination_score=1.0 if result.contamination_detected else 0.1,
    )

    assessment = SustainabilityAssessment.query.filter_by(analysis_result_id=result.id).first()
    if assessment is None:
        assessment = SustainabilityAssessment(analysis_result_id=result.id, created_by=created_by)
        db.session.add(assessment)

    assessment.material = scores["material"]
    assessment.waste_category = scores["waste_category"]
    assessment.quantity_kg = scores["quantity_kg"]

    assessment.co2_saved_kg = scores["co2_saved_kg"]
    assessment.water_saved_liters = scores["water_saved_liters"]
    assessment.landfill_diverted_kg = scores["landfill_diverted_kg"]
    assessment.diversion_rate_pct = scores["diversion_rate_pct"]
    assessment.diversion_level = scores["diversion_level"]
    assessment.raw_material_conserved_kg = scores["raw_material_conserved_kg"]
    assessment.energy_conserved_kwh = scores["energy_conserved_kwh"]
    assessment.report_text = scores["report_text"]

    assessment.circular_loop_stage = scores["circular_loop_stage"]
    assessment.loop_closed = scores["loop_closed"]
    assessment.recoverable_material_kg = scores["recoverable_material_kg"]
    assessment.recovery_efficiency_pct = scores["recovery_efficiency_pct"]
    assessment.benchmark_baseline_score = scores["benchmark_baseline_score"]
    assessment.benchmark_delta = scores["benchmark_delta"]
    assessment.benchmark_label = scores["benchmark_label"]

    assessment.recommended_pathway = scores["recommended_pathway"]
    assessment.suggested_partner_type = scores["suggested_partner_type"]
    assessment.recommendation_priority = scores["recommendation_priority"]
    assessment.recommendation_steps_json = json.dumps(scores["recommendation_steps"])

    assessment.recyclability_score = scores["recyclability_score"]
    assessment.material_condition_score = scores["material_condition_score"]
    assessment.reuse_score = scores["reuse_score"]
    assessment.environmental_benefit_score = scores["environmental_benefit_score"]
    assessment.processing_feasibility_score = scores["processing_feasibility_score"]
    assessment.sustainability_score = scores["sustainability_score"]
    assessment.material_recovery_score = scores["material_recovery_score"]
    assessment.circularity_score = scores["circularity_score"]
    assessment.circularity_category = scores["circularity_category"]

    db.session.commit()
    return assessment


@sustainability_bp.route("/assess/<int:result_id>", methods=["POST"])
@token_required
def assess(result_id):
    result = AnalysisResult.query.get(result_id)
    if not result:
        return jsonify({"error": "Analysis result not found"}), 404

    data = request.get_json(silent=True) or {}
    try:
        quantity_kg = float(data.get("quantity_kg", 1.0) or 1.0)
    except (TypeError, ValueError):
        return jsonify({"error": "quantity_kg must be a number"}), 400
    if quantity_kg <= 0:
        return jsonify({"error": "quantity_kg must be greater than 0"}), 400

    assessment = run_assessment_for_result(
        result, quantity_kg, created_by=request.current_user.get("user_id")
    )
    return jsonify({"message": "Sustainability assessment complete", "assessment": assessment.to_dict()}), 200


@sustainability_bp.route("/<int:result_id>", methods=["GET"])
@token_required
def get_assessment(result_id):
    assessment = SustainabilityAssessment.query.filter_by(analysis_result_id=result_id).first()
    if not assessment:
        return jsonify({"error": "No sustainability assessment for this analysis result yet"}), 404
    return jsonify({"assessment": assessment.to_dict()}), 200


@sustainability_bp.route("/recommendations/<int:result_id>", methods=["GET"])
@token_required
def get_recommendations(result_id):
    """Recycling Recommendation Workflow -- the ordered next-step checklist
    plus suggested partner type and handling priority for one item."""
    assessment = SustainabilityAssessment.query.filter_by(analysis_result_id=result_id).first()
    if not assessment:
        return jsonify({"error": "No sustainability assessment for this analysis result yet"}), 404
    return jsonify({
        "analysis_result_id": result_id,
        "recommended_pathway": assessment.recommended_pathway,
        "suggested_partner_type": assessment.suggested_partner_type,
        "priority": assessment.recommendation_priority,
        "steps": json.loads(assessment.recommendation_steps_json) if assessment.recommendation_steps_json else [],
    }), 200


@sustainability_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    rows = SustainabilityAssessment.query.all()

    total_assessments = len(rows)
    total_co2_saved_kg = round(sum(r.co2_saved_kg for r in rows), 1)
    total_water_saved_liters = round(sum(r.water_saved_liters for r in rows), 1)
    total_landfill_diverted_kg = round(sum(r.landfill_diverted_kg for r in rows), 1)
    total_recoverable_material_kg = round(sum(r.recoverable_material_kg or 0 for r in rows), 1)
    avg_circularity_score = round(sum(r.circularity_score for r in rows) / total_assessments, 1) if total_assessments else 0.0

    by_category = {}
    for r in rows:
        by_category[r.circularity_category] = by_category.get(r.circularity_category, 0) + 1

    by_waste_category_co2 = {}
    for r in rows:
        by_waste_category_co2[r.waste_category] = round(
            by_waste_category_co2.get(r.waste_category, 0) + r.co2_saved_kg, 1
        )

    return jsonify({
        "total_assessments": total_assessments,
        "total_co2_saved_kg": total_co2_saved_kg,
        "total_water_saved_liters": total_water_saved_liters,
        "total_landfill_diverted_kg": total_landfill_diverted_kg,
        "total_recoverable_material_kg": total_recoverable_material_kg,
        "avg_circularity_score": avg_circularity_score,
        "by_circularity_category": by_category,
        "co2_saved_by_waste_category": by_waste_category_co2,
    }), 200


@sustainability_bp.route("/reference", methods=["GET"])
@token_required
def reference():
    return jsonify({
        "co2_factors_kg_per_kg": engine._CO2_FACTORS_KG_PER_KG,
        "water_factors_l_per_kg": engine._WATER_FACTORS_L_PER_KG,
        "processing_credit_by_category": engine._PROCESSING_CREDIT_BY_CATEGORY,
        "scoring_weights": engine.SCORING_WEIGHTS,
        "circularity_categories": list(engine.CIRCULARITY_CATEGORIES),
        "industry_benchmark_score": engine._INDUSTRY_BENCHMARK_SCORE,
    }), 200
