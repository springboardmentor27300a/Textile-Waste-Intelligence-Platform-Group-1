import os
import sys

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ai.scoring import WasteScoringEngine
from app.ai.sustainability import SustainabilityEngine
from app.ai.recommendation import RecommendationEngine

def main():
    print("==========================================")
    print("Testing Engine 7, 8, & 9 Integration")
    print("==========================================")

    scoring = WasteScoringEngine()
    sustainability = SustainabilityEngine()
    recommendation = RecommendationEngine()

    print("\n1. Testing WasteScoringEngine (Engine 9):")
    score_res = scoring.compute_scores(
        material="Cotton",
        condition="good",
        reuse_potential_label="High",
        carbon_saving_kg=3.8,
        water_saving_liters=2400.0,
    )
    print("Recyclability Score:", score_res["recyclability_score"])
    print("Reuse Score:", score_res["reuse_score"])
    print("Environmental Benefit Score:", score_res["environmental_benefit_score"])
    print("Processing Feasibility Score:", score_res["processing_feasibility_score"])
    print("Overall Circularity Score:", score_res["overall_circularity_score"])
    print("Circularity Category:", score_res["circularity_category"])

    assert "overall_circularity_score" in score_res
    assert "circularity_category" in score_res
    assert score_res["circularity_category"] in [
        "Excellent Recovery Potential",
        "High Recovery Potential",
        "Moderate Recovery Potential",
        "Limited Recovery Potential",
        "Disposal Recommended",
    ]

    print("\n2. Testing SustainabilityEngine (Engines 7 & 8):")
    impact_res = sustainability.calculate_impact(material="Cotton", weight_kg=10.0)
    print("Carbon Offset (kg):", impact_res["estimated_carbon_saving_kg"])
    print("Water Saved (L):", impact_res["estimated_water_saving_liters"])
    print("Energy Saved (kWh):", impact_res["estimated_energy_saving_kwh"])
    print("Landfill Diverted (kg):", impact_res["landfill_diverted_kg"])
    print("Diversion Rate (%):", impact_res["waste_diversion_rate_pct"])
    print("Circular Economy Score:", impact_res["circular_economy_score"])

    assert impact_res["estimated_carbon_saving_kg"] == 38.0
    assert impact_res["estimated_water_saving_liters"] == 24000.0

    print("\n3. Testing RecommendationEngine (Combined 7, 8, 9):")
    rec_res = recommendation.generate(material="Cotton", weight_kg=5.0)
    print("Rec Recommendation:", rec_res["recommendation"])
    print("Circularity Category:", rec_res["circularity_category"])
    print("Landfill Diverted:", rec_res["landfill_diverted_kg"])

    print("\n[SUCCESS] All Engine 7, 8, & 9 unit tests passed successfully!")

if __name__ == "__main__":
    main()
