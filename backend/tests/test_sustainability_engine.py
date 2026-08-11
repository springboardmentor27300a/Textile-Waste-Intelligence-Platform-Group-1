import pytest
from app.services.sustainability.emission_factors import get_emission_factors, EMISSION_FACTORS
from app.services.sustainability.engine import (
    estimate_carbon_footprint,
    analyze_waste_diversion,
    estimate_resource_recovery,
    circular_economy_analysis,
    sustainability_benchmark
)
from app.services.recommendation.engine import (
    recommend_strategy,
    detect_reuse_opportunity,
    suggest_upcycling,
    recommend_material_recovery,
    waste_reduction_tips
)
from app.services.impact.engine import (
    estimate_co2_savings,
    estimate_water_savings,
    landfill_reduction,
    resource_conservation,
    generate_sustainability_report
)
from app.services.circular.analytics import aggregate_circularity, material_flow_analysis

class MockTextileWaste:
    def __init__(self, material_composition="100% Cotton", recyclability_rate=0.85, has_contaminants=False):
        self.material_composition = material_composition
        self.recyclability_rate = recyclability_rate
        self.has_contaminants = has_contaminants

class MockWasteBatch:
    def __init__(self, id=1, fabric_type="Cotton", source="Post-consumer", quantity=100.0, condition="Clean", status="Collected", collection_date=None, textile_wastes=None):
        self.id = id
        self.fabric_type = fabric_type
        self.source = source
        self.quantity = quantity
        self.condition = condition
        self.status = status
        self.collection_date = collection_date
        self.textile_wastes = textile_wastes or []

# ==========================================
# PHASE 1 TESTS: EMISSION FACTORS
# ==========================================
def test_emission_factors_retrieval():
    # Exact match
    factors = get_emission_factors("cotton")
    assert factors["CO2e_per_kg"] == 8.3
    
    # Case insensitivity
    factors = get_emission_factors(" Polyester ")
    assert factors["water_L_per_kg"] == 60.0
    
    # Fallback/Blend handling
    factors = get_emission_factors("UnknownFabric")
    assert factors["CO2e_per_kg"] == 9.0

# ==========================================
# PHASE 2 TESTS: SUSTAINABILITY ENGINE
# ==========================================
def test_carbon_footprint_calculation():
    res = estimate_carbon_footprint("Cotton", 10.0)
    assert res["co2e_kg"] == 83.0
    assert res["water_L"] == 100000.0

def test_waste_diversion_scenarios():
    # Diverted batch
    batch_ok = MockWasteBatch(quantity=50.0, status="Recycled")
    res_ok = analyze_waste_diversion(batch_ok)
    assert res_ok["diverted_kg"] == 50.0
    assert res_ok["landfill_kg"] == 0.0
    assert res_ok["diversion_rate"] == 100.0
    
    # Landfill disposed batch
    batch_fail = MockWasteBatch(quantity=30.0, status="Disposed")
    res_fail = analyze_waste_diversion(batch_fail)
    assert res_fail["diverted_kg"] == 0.0
    assert res_fail["landfill_kg"] == 30.0
    assert res_fail["diversion_rate"] == 0.0

def test_resource_recovery_contamination():
    # Clean batch
    tw_clean = [MockTextileWaste(recyclability_rate=0.80, has_contaminants=False)]
    batch_clean = MockWasteBatch(fabric_type="Cotton", quantity=100.0, textile_wastes=tw_clean)
    res_clean = estimate_resource_recovery(batch_clean)
    assert res_clean["recovered_value_usd"] == 5.0 * 100.0 * 0.80 # 400
    
    # Contaminated batch (should deduct 0.25 from efficiency)
    tw_dirty = [MockTextileWaste(recyclability_rate=0.80, has_contaminants=True)]
    batch_dirty = MockWasteBatch(fabric_type="Cotton", quantity=100.0, textile_wastes=tw_dirty)
    res_dirty = estimate_resource_recovery(batch_dirty)
    assert res_dirty["recovered_value_usd"] == 5.0 * 100.0 * (0.80 - 0.25) # 275

def test_sustainability_benchmarking():
    metrics = {"CO2 Averted (kg/ton)": 2200, "Water Saved (L/kg)": 9.5}
    reference = {"CO2 Averted (kg/ton)": 2000, "Water Saved (L/kg)": 10.0}
    res = sustainability_benchmark(metrics, reference)
    benchmarks = res["benchmarks"]
    assert benchmarks[0]["percentage_difference"] == 10.0
    assert benchmarks[1]["percentage_difference"] == -5.0

# ==========================================
# PHASE 3 TESTS: RECOMMENDATIONS
# ==========================================
def test_ranked_recommendations():
    tw = [MockTextileWaste(recyclability_rate=0.90, has_contaminants=False)]
    batch = MockWasteBatch(fabric_type="Cotton", condition="Clean", quantity=100.0, textile_wastes=tw)
    
    recs = recommend_strategy(batch)
    assert recs["is_eligible_for_direct_reuse"] is True
    assert recs["ranked_recommendations"][0]["strategy"] in ["UPCYCLING", "FABRIC_REUSE"]

def test_contaminated_recommendations():
    tw = [MockTextileWaste(recyclability_rate=0.80, has_contaminants=True)]
    batch = MockWasteBatch(fabric_type="Cotton", condition="Clean", quantity=100.0, textile_wastes=tw)
    
    recs = recommend_strategy(batch)
    assert recs["is_eligible_for_direct_reuse"] is False
    # Contaminated should recommend Chemical Recycling or Industrial Recovery, and include Disposal
    strategies = [r["strategy"] for r in recs["ranked_recommendations"]]
    assert "CHEMICAL_RECYCLING" in strategies
    assert "DISPOSAL" in strategies

# ==========================================
# PHASE 4 TESTS: ENVIRONMENTAL IMPACT
# ==========================================
def test_savings_formula():
    # Savings should be 0 for Disposal
    assert estimate_co2_savings("Disposal", "Cotton", 100.0) == 0.0
    assert estimate_water_savings("Landfill", "Polyester", 50.0) == 0.0
    
    # Non-disposal savings (Mechanical Recycling = 20% impact, 80% savings, 85% efficiency)
    factors = get_emission_factors("Cotton")
    expected_savings = (factors["CO2e_per_kg"] * 0.80) * 10.0 * 0.85
    assert estimate_co2_savings("MECHANICAL_RECYCLING", "Cotton", 10.0) == round(expected_savings, 2)

# ==========================================
# PHASE 5 TESTS: CIRCULAR ANALYTICS
# ==========================================
def test_circular_analytics_empty_states():
    assert aggregate_circularity([])["average_score"] == 0.0
    assert material_flow_analysis([])["inflow_kg"] == 0.0

def test_circular_analytics_aggregations():
    import datetime
    tw1 = [MockTextileWaste(recyclability_rate=0.90)]
    b1 = MockWasteBatch(id=1, fabric_type="Cotton", quantity=100.0, condition="Clean", collection_date=datetime.date(2026, 8, 1), textile_wastes=tw1)
    
    tw2 = [MockTextileWaste(recyclability_rate=0.40)]
    b2 = MockWasteBatch(id=2, fabric_type="Polyester", quantity=200.0, condition="Damaged", collection_date=datetime.date(2026, 8, 2), textile_wastes=tw2)
    
    analytics = aggregate_circularity([b1, b2])
    assert analytics["average_score"] > 0
    assert "Cotton" in analytics["fabric_type_breakdown"]
    assert "Polyester" in analytics["fabric_type_breakdown"]
    
    flows = material_flow_analysis([b1, b2])
    # Both are collected/sorting by default status "Collected"
    assert flows["inflow_kg"] == 300.0
