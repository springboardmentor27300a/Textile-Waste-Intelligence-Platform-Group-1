import pytest
from app.routers.dashboard import get_sustainability_dashboard_data

class MockTextileWaste:
    def __init__(self, recyclability_rate=0.85, has_contaminants=False):
        self.recyclability_rate = recyclability_rate
        self.has_contaminants = has_contaminants

class MockWasteBatch:
    def __init__(self, id=1, fabric_type="Cotton", status="Collected", quantity=100.0, condition="Clean", collection_date=None, operator_id=1, inventory_id=1, textile_wastes=None):
        self.id = id
        self.fabric_type = fabric_type
        self.status = status
        self.quantity = quantity
        self.condition = condition
        import datetime
        self.collection_date = collection_date or datetime.date(2026, 8, 1)
        self.operator_id = operator_id
        self.inventory_id = inventory_id
        self.textile_wastes = textile_wastes or []

class MockQuery:
    def __init__(self, data):
        self.data = data
        
    def filter(self, *args, **kwargs):
        return self
        
    def all(self):
        return self.data

class MockSession:
    def __init__(self, data):
        self.data = data
        
    def query(self, model):
        return MockQuery(self.data)

def test_dashboard_payload_shape():
    # Setup mock batches
    tw = [MockTextileWaste()]
    batches = [
        MockWasteBatch(id=1, fabric_type="Cotton", quantity=100.0, status="Recycled", textile_wastes=tw),
        MockWasteBatch(id=2, fabric_type="Polyester", quantity=200.0, status="Collected", textile_wastes=tw)
    ]
    
    mock_db = MockSession(batches)
    res = get_sustainability_dashboard_data(entity_id=1, db=mock_db, current_user=None)
    
    # Assert payload shape
    assert "entity_id" in res
    assert "kpi_cards" in res
    assert "carbon_trend" in res
    assert "diversion_breakdown" in res
    assert "circularity_distribution" in res
    assert "esg_summary" in res
    
    # Check KPI card metrics
    kpis = res["kpi_cards"]
    assert "co2_saved_kg" in kpis
    assert "water_saved_liters" in kpis
    assert "landfill_diversion_rate" in kpis
    assert "average_circularity" in kpis
    assert "total_batches" in kpis
    assert "total_quantity_kg" in kpis
    
    # Check ESG summary keys
    esg = res["esg_summary"]
    assert "environmental_score" in esg
    assert "social_score" in esg
    assert "governance_score" in esg
    assert "overall_grade" in esg
