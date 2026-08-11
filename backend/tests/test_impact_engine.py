import pytest
from app.services.impact.engine import estimate_co2_savings, estimate_water_savings, resource_conservation

class MockWasteBatch:
    def __init__(self, id=1, fabric_type="Cotton", status="Collected", quantity=100.0, textile_wastes=None):
        self.id = id
        self.fabric_type = fabric_type
        self.status = status
        self.quantity = quantity
        self.textile_wastes = textile_wastes or []

def test_impact_savings_disposal_zero():
    # DISPOSAL strategy = 0 savings
    assert estimate_co2_savings("Disposal", "Cotton", 100.0) == 0.0
    assert estimate_co2_savings("Landfill", "Polyester", 50.0) == 0.0
    assert estimate_water_savings("Disposal", "Linen", 200.0) == 0.0

def test_impact_savings_recycling_positive():
    # Non-disposal recycling should have positive savings
    co2_saved = estimate_co2_savings("MECHANICAL_RECYCLING", "Cotton", 100.0)
    assert co2_saved > 0.0
    
    water_saved = estimate_water_savings("UPCYCLING", "Cotton", 10.0)
    assert water_saved > 0.0

def test_resource_conservation_aggregation():
    b1 = MockWasteBatch(fabric_type="Cotton", status="MECHANICAL_RECYCLING", quantity=10.0)
    b2 = MockWasteBatch(fabric_type="Disposed", status="Disposed", quantity=20.0)
    
    savings = resource_conservation([b1, b2])
    # b2 (Disposed) should have 0 savings, so savings should represent only b1
    assert savings["co2_saved_kg"] > 0.0
    assert savings["water_saved_L"] > 0.0
