from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


# ---------------- Home API ---------------- #

def test_home():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "message" in data


# ---------------- Register Validation ---------------- #

def test_register_invalid_email():

    response = client.post(
        "/register",
        json={
            "name": "Test User",
            "email": "invalid-email",
            "password": "test123456"
        }
    )

    assert response.status_code == 422


def test_register_short_password():

    response = client.post(
        "/register",
        json={
            "name": "Test User",
            "email": "validation@example.com",
            "password": "123"
        }
    )

    assert response.status_code == 422


# ---------------- Login Validation ---------------- #

def test_login_invalid_email():

    response = client.post(
        "/login",
        json={
            "email": "invalid-email",
            "password": "test123456"
        }
    )

    assert response.status_code == 422


# ---------------- Inventory Validation ---------------- #

def test_inventory_missing_fabric():

    response = client.post(
        "/inventory",
        json={
            "weight": "10 kg"
        }
    )

    assert response.status_code == 422


def test_inventory_missing_weight():

    response = client.post(
        "/inventory",
        json={
            "fabric": "Cotton"
        }
    )

    assert response.status_code == 422


# ---------------- Dashboard APIs ---------------- #

def test_dashboard():

    response = client.get("/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert "users" in data
    assert "inventory" in data
    assert "datasets" in data
    assert "predictions" in data


def test_sustainability_dashboard():

    response = client.get("/sustainability-dashboard")

    assert response.status_code == 200

    data = response.json()

    assert "total_predictions" in data
    assert "average_confidence" in data
    assert "average_circular_score" in data
    assert "total_co2_saved" in data
    assert "total_water_saved" in data


# ---------------- Prediction History ---------------- #

def test_prediction_history():

    response = client.get("/prediction-history")

    assert response.status_code == 200

    assert isinstance(response.json(), list)