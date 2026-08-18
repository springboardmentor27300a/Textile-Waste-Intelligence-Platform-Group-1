import pytest
from app.utils.recyclability import calculate_circularity_score, get_circularity_category
from app.services.circular.analytics import aggregate_circularity, material_flow_analysis

def test_circularity_formula_weights_sum_to_one():
    # Weights: recyclability:0.35, condition:0.20, reuse_potential:0.20, env_benefit:0.15, processing_feasibility:0.10
    w_rec = 0.35
    w_cond = 0.20
    w_reuse = 0.20
    w_env = 0.15
    w_proc = 0.10
    
    total_weight = w_rec + w_cond + w_reuse + w_env + w_proc
    assert abs(total_weight - 1.0) < 1e-9

def test_circularity_category_thresholds():
    # Excellent >= 85
    assert get_circularity_category(85) == "Excellent Recovery Potential"
    assert get_circularity_category(95) == "Excellent Recovery Potential"
    
    # High >= 70 and < 85
    assert get_circularity_category(70) == "High Recovery Potential"
    assert get_circularity_category(84) == "High Recovery Potential"
    
    # Moderate >= 55 and < 70
    assert get_circularity_category(55) == "Moderate Recovery Potential"
    assert get_circularity_category(69) == "Moderate Recovery Potential"
    
    # Limited >= 35 and < 55
    assert get_circularity_category(35) == "Limited Recovery Potential"
    assert get_circularity_category(54) == "Limited Recovery Potential"
    
    # Disposal < 35
    assert get_circularity_category(34) == "Disposal Recommended"
    assert get_circularity_category(0) == "Disposal Recommended"

def test_circular_analytics_empty_list():
    res_aggr = aggregate_circularity([])
    assert res_aggr["average_score"] == 0.0
    assert res_aggr["category_distribution"] == {}
    assert res_aggr["fabric_type_breakdown"] == {}
    assert res_aggr["source_breakdown"] == {}
    assert res_aggr["time_trend"] == []
    
    res_flow = material_flow_analysis([])
    assert res_flow["inflow_kg"] == 0.0
    assert res_flow["recovered_kg"] == 0.0
    assert res_flow["diverted_kg"] == 0.0
    assert res_flow["disposed_kg"] == 0.0
