from typing import List, Dict, Any
from app.services.sustainability.emission_factors import get_emission_factors

def get_strategy_efficiency(strategy: str) -> float:
    """
    Get recovery efficiency and impact multiplier based on strategy.
    Disposal has 0 recovery/savings.
    """
    strat = strategy.upper() if strategy else ""
    if strat in ["DISPOSAL", "LANDFILL"]:
        # Disposal gets 0 savings
        return 0.0
    return 0.85  # PLACEHOLDER recovery efficiency factor

def get_recycling_impact_multiplier(strategy: str) -> float:
    """
    Returns the percentage of virgin impact that recycling incurs (recycling_impact / virgin_impact).
    Disposal incurs 100% of the impact (no savings).
    Reuses are low footprint (5%).
    Mechanical recycling is medium (20%).
    Chemical recycling is higher (40%).
    """
    strat = strategy.upper() if strategy else ""
    if strat in ["DISPOSAL", "LANDFILL"]:
        return 1.0
    elif strat in ["UPCYCLING", "FABRIC_REUSE", "DONATION"]:
        return 0.05
    elif strat in ["FIBER_RECYCLING", "MECHANICAL_RECYCLING"]:
        return 0.20
    elif strat in ["CHEMICAL_RECYCLING", "INDUSTRIAL_RECOVERY"]:
        return 0.40
    return 0.25

def estimate_co2_savings(strategy: str, fabric_type: str, quantity_kg: float) -> float:
    """
    Calculate CO2 savings comparing recycling vs virgin + disposal.
    Savings = (virgin_impact - recycling_impact) * quantity * recovery_efficiency
    Disposal strategy = 0 savings.
    """
    strat = strategy.upper() if strategy else ""
    if strat in ["DISPOSAL", "LANDFILL"]:
        return 0.0
        
    factors = get_emission_factors(fabric_type)
    virgin_impact = factors["CO2e_per_kg"]
    
    recycling_pct = get_recycling_impact_multiplier(strategy)
    recycling_impact = virgin_impact * recycling_pct
    
    efficiency = get_strategy_efficiency(strategy)
    
    savings = (virgin_impact - recycling_impact) * quantity_kg * efficiency
    return round(max(0.0, savings), 2)

def estimate_water_savings(strategy: str, fabric_type: str, quantity_kg: float) -> float:
    """
    Calculate water savings comparing recycling vs virgin + disposal.
    Savings = (virgin_impact - recycling_impact) * quantity * recovery_efficiency
    Disposal strategy = 0 savings.
    """
    strat = strategy.upper() if strategy else ""
    if strat in ["DISPOSAL", "LANDFILL"]:
        return 0.0
        
    factors = get_emission_factors(fabric_type)
    virgin_impact = factors["water_L_per_kg"]
    
    recycling_pct = get_recycling_impact_multiplier(strategy)
    recycling_impact = virgin_impact * recycling_pct
    
    efficiency = get_strategy_efficiency(strategy)
    
    savings = (virgin_impact - recycling_impact) * quantity_kg * efficiency
    return round(max(0.0, savings), 2)

def landfill_reduction(quantity_kg: float, diversion_rate: float) -> float:
    """
    Calculate diverted landfill mass in kg.
    """
    rate = diversion_rate / 100.0 if diversion_rate > 1.0 else diversion_rate
    return round(quantity_kg * rate, 2)

def resource_conservation(batches: List[Any]) -> Dict[str, float]:
    """
    Calculate overall CO2, water, and virgin cost savings across all batches.
    """
    total_co2_saved = 0.0
    total_water_saved = 0.0
    total_value_saved = 0.0
    
    for batch in batches:
        qty = getattr(batch, "quantity_kg", getattr(batch, "quantity", 0.0))
        fabric_type = getattr(batch, "fabric_type", "Blend")
        status = getattr(batch, "status", "Collected")
        
        # Determine strategy from status or fallback
        strategy = status
        if strategy.lower() == "collected" or strategy.lower() == "sorting":
            strategy = "MECHANICAL_RECYCLING"  # Assumed recovery path
            
        co2 = estimate_co2_savings(strategy, fabric_type, qty)
        water = estimate_water_savings(strategy, fabric_type, qty)
        
        # Calculate cost savings from preserved material value
        factors = get_emission_factors(fabric_type)
        efficiency = get_strategy_efficiency(strategy)
        value = factors["virgin_value_per_kg"] * qty * efficiency
        
        total_co2_saved += co2
        total_water_saved += water
        total_value_saved += value
        
    return {
        "co2_saved_kg": round(total_co2_saved, 2),
        "water_saved_L": round(total_water_saved, 2),
        "value_saved_usd": round(total_value_saved, 2)
    }

def generate_sustainability_report(entity_id: int, period: str, batches: List[Any]) -> Dict[str, Any]:
    """
    Generate an environmental impact report for an entity over a given timeframe.
    """
    conservation = resource_conservation(batches)
    
    total_qty = sum(getattr(b, "quantity_kg", getattr(b, "quantity", 0.0)) for b in batches)
    total_diverted = sum(
        qty for b in batches 
        if (qty := getattr(b, "quantity_kg", getattr(b, "quantity", 0.0))) and b.status.lower() != "disposed"
    )
    
    diversion_rate = (total_diverted / total_qty * 100.0) if total_qty > 0 else 0.0
    
    # Material breakdown aggregation
    breakdown = {}
    for batch in batches:
        qty = getattr(batch, "quantity_kg", getattr(b, "quantity", 0.0))
        fab = batch.fabric_type
        if fab not in breakdown:
            breakdown[fab] = {"quantity_kg": 0.0, "co2_saved_kg": 0.0}
        breakdown[fab]["quantity_kg"] += qty
        
        strategy = batch.status if batch.status.lower() != "collected" else "MECHANICAL_RECYCLING"
        breakdown[fab]["co2_saved_kg"] += estimate_co2_savings(strategy, fab, qty)
        
    breakdown_list = [
        {
            "fabric_type": k,
            "quantity_kg": round(v["quantity_kg"], 2),
            "co2_saved_kg": round(v["co2_saved_kg"], 2)
        }
        for k, v in breakdown.items()
    ]
    
    return {
        "entity_id": entity_id,
        "reporting_period": period,
        "total_batches_analyzed": len(batches),
        "total_quantity_managed_kg": round(total_qty, 2),
        "landfill_diversion_rate_pct": round(diversion_rate, 2),
        "environmental_savings": conservation,
        "material_breakdown": breakdown_list
    }
