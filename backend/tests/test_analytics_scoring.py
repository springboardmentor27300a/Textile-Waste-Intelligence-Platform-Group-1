import pytest
from app.ai.scoring import WasteScoringEngine
from app.ai.sustainability import SustainabilityEngine
from app.ai.recommendation import RecommendationEngine


def test_scoring_engine_weighted_model():
    scoring = WasteScoringEngine()
    result = scoring.compute_scores(
        material="Cotton",
        condition="clean",
        reuse_potential_label="High",
        carbon_saving_kg=3.8,
        water_saving_liters=2400.0,
    )

    assert "recyclability_score" in result
    assert "reuse_score" in result
    assert "sustainability_score" in result
    assert "material_recovery_score" in result
    assert "overall_circularity_score" in result
    assert "circularity_category" in result
    assert 0 <= result["overall_circularity_score"] <= 100
    assert result["circularity_category"] in [
        "Excellent Recovery Potential",
        "High Recovery Potential",
        "Moderate Recovery Potential",
        "Limited Recovery Potential",
        "Disposal Recommended",
    ]


def test_sustainability_engine_lca_calculations():
    engine = SustainabilityEngine()
    impact = engine.calculate_impact(material="Polyester", weight_kg=50.0)

    assert impact["estimated_carbon_saving_kg"] > 0
    assert impact["estimated_water_saving_liters"] > 0
    assert impact["estimated_energy_saving_kwh"] > 0
    assert impact["landfill_diverted_kg"] == 50.0
    assert impact["waste_diversion_rate_pct"] > 0
    assert "circular_economy_score" in impact


def test_recommendation_engine_full_synthesis():
    rec_engine = RecommendationEngine()
    rec = rec_engine.generate(material="Denim", weight_kg=20.0)

    assert rec["waste_category"]
    assert rec["recycling_strategy"]
    assert rec["reuse_opportunity"]
    assert rec["upcycling_suggestion"]
    assert rec["material_recovery_recommendation"]
    assert rec["waste_reduction_strategy"]
    assert rec["circularity_score"] > 0
    assert rec["circularity_category"]
