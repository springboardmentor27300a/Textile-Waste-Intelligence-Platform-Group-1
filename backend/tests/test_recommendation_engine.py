import pytest
from app.services.recommendation.engine import recommend_strategy

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

def test_clean_cotton_reuse_donation():
    # Clean cotton should recommend reuse/donation / upcycling
    tw = [MockTextileWaste(material_composition="100% Cotton", recyclability_rate=0.90, has_contaminants=False)]
    batch = MockWasteBatch(fabric_type="Cotton", condition="Clean", textile_wastes=tw)
    
    recs = recommend_strategy(batch)
    assert recs["is_eligible_for_direct_reuse"] is True
    top_strat = recs["ranked_recommendations"][0]["strategy"]
    assert top_strat in ["UPCYCLING", "FABRIC_REUSE", "DONATION"]

def test_contaminated_polyester_chemical_industrial():
    # Contaminated polyester -> chemical/industrial
    tw = [MockTextileWaste(material_composition="100% Polyester", recyclability_rate=0.75, has_contaminants=True)]
    batch = MockWasteBatch(fabric_type="Polyester", condition="Clean", textile_wastes=tw)
    
    recs = recommend_strategy(batch)
    assert recs["is_eligible_for_direct_reuse"] is False
    strategies = [r["strategy"] for r in recs["ranked_recommendations"]]
    assert "CHEMICAL_RECYCLING" in strategies or "INDUSTRIAL_RECOVERY" in strategies

def test_damaged_mixed_fiber_mechanical():
    # Damaged mixed -> fiber/mechanical
    tw = [MockTextileWaste(material_composition="50% Cotton / 50% Polyester", recyclability_rate=0.65, has_contaminants=False)]
    batch = MockWasteBatch(fabric_type="Blend", condition="Damaged", textile_wastes=tw)
    
    recs = recommend_strategy(batch)
    strategies = [r["strategy"] for r in recs["ranked_recommendations"]]
    assert "MECHANICAL_RECYCLING" in strategies or "FIBER_RECYCLING" in strategies
