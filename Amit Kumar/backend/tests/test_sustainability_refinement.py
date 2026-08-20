import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.models import User, WasteBatch, SustainabilityMetrics, RecyclingRecommendation

class MockTextileWaste:
    def __init__(self, recyclability_rate=0.85, has_contaminants=False):
        self.recyclability_rate = recyclability_rate
        self.has_contaminants = has_contaminants
        self.material_composition = "100% Cotton"

class MockWasteBatch:
    def __init__(self, id=10, fabric_type="Cotton", quantity=100.0, condition="Clean", status="Collected", source="Post-consumer"):
        self.id = id
        self.fabric_type = fabric_type
        self.quantity = quantity
        self.condition = condition
        self.status = status
        self.source = source
        self.textile_wastes = [MockTextileWaste()]
        self.contamination_flag = False
        self.waste_category = "Recyclable"
        import datetime
        self.collection_date = datetime.date(2026, 8, 1)

class MockQuery:
    def __init__(self, data):
        self.data = data
    def filter(self, *args, **kwargs):
        return self
    def first(self):
        return self.data
    def all(self):
        return [self.data] if self.data else []

class MockDb:
    def __init__(self, batch=None, metrics=None, rec=None):
        self.batch = batch
        self.metrics = metrics
        self.rec = rec

    def query(self, model):
        if model.__name__ == "WasteBatch":
            return MockQuery(self.batch)
        if model.__name__ == "SustainabilityMetrics":
            return MockQuery(self.metrics)
        if model.__name__ == "RecyclingRecommendation":
            return MockQuery(self.rec)
        if model.__name__ == "EnvironmentalImpact":
            return MockQuery(None)
        return MockQuery(None)

    def add(self, obj):
        if hasattr(obj, "id") and getattr(obj, "id") is None:
            obj.id = 1

    def commit(self):
        pass

    def refresh(self, obj):
        pass

@pytest.fixture
def client():
    # Setup standard override
    app.dependency_overrides[get_current_user] = lambda: User(id=1, email="sri@textilewaste.org", full_name="Sri")
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_calculate_sustainability_invalid_id(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=None)
    response = client.post("/api/sustainability/calculate", json={"batch_id": 999})
    assert response.status_code == 404

def test_calculate_sustainability_invalid_quantity(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch(quantity=-10.0))
    response = client.post("/api/sustainability/calculate", json={"batch_id": 10})
    assert response.status_code == 400

def test_calculate_sustainability_invalid_fabric(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch(fabric_type="Glass"))
    response = client.post("/api/sustainability/calculate", json={"batch_id": 10})
    assert response.status_code == 400

def test_calculate_sustainability_success(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch())
    response = client.post("/api/sustainability/calculate", json={"batch_id": 10})
    assert response.status_code == 201
    assert response.json()["waste_batch_id"] == 10

def test_calculate_sustainability_duplicate(client):
    mock_metrics = SustainabilityMetrics(id=1, waste_batch_id=10)
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch(), metrics=mock_metrics)
    response = client.post("/api/sustainability/calculate", json={"batch_id": 10})
    assert response.status_code == 400

def test_get_sustainability_list(client):
    mock_metrics = SustainabilityMetrics(
        id=1, 
        waste_batch_id=10, 
        co2_saved_kg=10.0,
        water_saved_liters=500.0,
        landfill_reduction_kg=100.0,
        energy_saved_mj=50.0,
        circularity_score=85.0,
        sustainability_score=85.0
    )
    app.dependency_overrides[get_db] = lambda: MockDb(metrics=mock_metrics)
    response = client.get("/api/sustainability")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_recommendation_invalid_id(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=None)
    response = client.post("/api/recommendations", json={"batch_id": 999})
    assert response.status_code == 404

def test_recommendation_success(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch())
    response = client.post("/api/recommendations", json={"batch_id": 10})
    assert response.status_code == 201
    assert response.json()["waste_batch_id"] == 10

def test_recommendation_duplicate(client):
    mock_rec = RecyclingRecommendation(id=1, waste_batch_id=10)
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch(), rec=mock_rec)
    response = client.post("/api/recommendations", json={"batch_id": 10})
    assert response.status_code == 400

def test_recommendation_get_saved(client):
    mock_rec = RecyclingRecommendation(
        id=1, 
        waste_batch_id=10, 
        recommendation_1_strategy="UPCYCLING",
        recommendation_1_confidence=85.0,
        recommendation_1_rationale="Suitable for upcycling."
    )
    app.dependency_overrides[get_db] = lambda: MockDb(rec=mock_rec)
    response = client.get("/api/recommendations/10")
    assert response.status_code == 200
    assert response.json()["waste_batch_id"] == 10

def test_analytics_endpoints(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch())
    res_env = client.get("/api/analytics/environment")
    assert res_env.status_code == 200
    
    res_circ = client.get("/api/analytics/circularity")
    assert res_circ.status_code == 200

def test_dashboard_summary(client):
    app.dependency_overrides[get_db] = lambda: MockDb(batch=MockWasteBatch())
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
