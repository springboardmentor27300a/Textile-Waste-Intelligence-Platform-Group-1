from typing import List, Dict, Any, Tuple
from app.services.sustainability.emission_factors import get_emission_factors
from app.utils.recyclability import calculate_circularity_score

def estimate_carbon_footprint(fabric_type: str, quantity_kg: float) -> Dict[str, Any]:
    """
    Estimate CO2e carbon footprint and water footprint for producing virgin fabric.
    """
    factors = get_emission_factors(fabric_type)
    return {
        "fabric_type": fabric_type,
        "quantity_kg": quantity_kg,
        "co2e_kg": round(factors["CO2e_per_kg"] * quantity_kg, 2),
        "water_L": round(factors["water_L_per_kg"] * quantity_kg, 2)
    }

def analyze_waste_diversion(batch: Any) -> Dict[str, Any]:
    """
    Analyze the landfill diversion metrics of a single batch.
    """
    qty = getattr(batch, "quantity_kg", getattr(batch, "quantity", 0.0))
    status = getattr(batch, "status", "Collected")
    
    # If Disposed, it goes to landfill. Otherwise, it is diverted.
    if status.lower() == "disposed":
        diverted = 0.0
        landfill = qty
        rate = 0.0
    else:
        diverted = qty
        landfill = 0.0
        rate = 100.0 if qty > 0 else 0.0
        
    return {
        "batch_id": getattr(batch, "id", 0),
        "quantity_kg": qty,
        "diverted_kg": diverted,
        "landfill_kg": landfill,
        "diversion_rate": rate
    }

def estimate_resource_recovery(batch: Any) -> Dict[str, Any]:
    """
    Estimate potential resource and economic recovery metrics.
    """
    qty = getattr(batch, "quantity_kg", getattr(batch, "quantity", 0.0))
    fabric_type = getattr(batch, "fabric_type", "Blend")
    
    # Determine recyclability rate from TextileWaste records
    recyclability_rate = 0.70  # Default fallback
    has_contaminants = False
    
    tw_list = getattr(batch, "textile_wastes", [])
    if tw_list:
        recyclability_rate = tw_list[0].recyclability_rate
        has_contaminants = any(tw.has_contaminants for tw in tw_list)
        
    factors = get_emission_factors(fabric_type)
    
    # Calculate recovery metrics based on recyclability rate and contamination impact
    efficiency = recyclability_rate
    if has_contaminants:
        efficiency = max(0.0, efficiency - 0.25)
        
    recovered_value = round(factors["virgin_value_per_kg"] * qty * efficiency, 2)
    saved_co2 = round(factors["CO2e_per_kg"] * qty * efficiency, 2)
    saved_water = round(factors["water_L_per_kg"] * qty * efficiency, 2)
    
    return {
        "batch_id": getattr(batch, "id", 0),
        "quantity_kg": qty,
        "recyclability_rate": recyclability_rate,
        "recovered_value_usd": recovered_value,
        "potential_savings_co2_kg": saved_co2,
        "potential_savings_water_L": saved_water
    }

def circular_economy_analysis(batches: List[Any]) -> Dict[str, Any]:
    """
    Evaluate circular economy metrics cumulatively across a list of batches.
    """
    total_qty = 0.0
    total_diverted = 0.0
    total_landfill = 0.0
    total_co2_saved = 0.0
    total_water_saved = 0.0
    circularity_scores = []
    
    for batch in batches:
        qty = getattr(batch, "quantity_kg", getattr(batch, "quantity", 0.0))
        total_qty += qty
        
        # Diversion
        div_analysis = analyze_waste_diversion(batch)
        total_diverted += div_analysis["diverted_kg"]
        total_landfill += div_analysis["landfill_kg"]
        
        # Recovery / Savings
        rec_analysis = estimate_resource_recovery(batch)
        total_co2_saved += rec_analysis["potential_savings_co2_kg"]
        total_water_saved += rec_analysis["potential_savings_water_L"]
        
        # Circularity Score computation
        recyclability_rate = 0.70
        has_contaminants = False
        tw_list = getattr(batch, "textile_wastes", [])
        if tw_list:
            recyclability_rate = tw_list[0].recyclability_rate
            has_contaminants = any(tw.has_contaminants for tw in tw_list)
            
        score, _, _ = calculate_circularity_score(
            recyclability_rate=recyclability_rate,
            condition=getattr(batch, "condition", "Clean"),
            has_contaminants=has_contaminants
        )
        circularity_scores.append(score)
        
    avg_score = sum(circularity_scores) / len(circularity_scores) if circularity_scores else 0.0
    diversion_rate = (total_diverted / total_qty * 100.0) if total_qty > 0 else 0.0
    
    return {
        "total_batches": len(batches),
        "total_quantity_kg": round(total_qty, 2),
        "total_diverted_kg": round(total_diverted, 2),
        "total_landfill_kg": round(total_landfill, 2),
        "overall_diversion_rate": round(diversion_rate, 2),
        "total_co2e_saved_kg": round(total_co2_saved, 2),
        "total_water_saved_L": round(total_water_saved, 2),
        "avg_circularity_score": round(avg_score, 2)
    }

def sustainability_benchmark(entity_metrics: Dict[str, float], reference: Dict[str, float]) -> Dict[str, Any]:
    """
    Compare entity performance metrics to industry standard reference baselines.
    """
    benchmarks = []
    for metric, twip_val in entity_metrics.items():
        ref_val = reference.get(metric, 0.0)
        if ref_val > 0:
            diff = ((twip_val - ref_val) / ref_val) * 100.0
        else:
            diff = 0.0
            
        benchmarks.append({
            "metric": metric,
            "twip": round(twip_val, 2),
            "industry_average": round(ref_val, 2),
            "percentage_difference": round(diff, 2)
        })
        
    return {"benchmarks": benchmarks}
