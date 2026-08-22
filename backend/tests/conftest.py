import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ["DATABASE_URL"] = "sqlite:///./test_reloom.db"
os.environ["SECRET_KEY"] = "pytest-secret-key"


@pytest.fixture(scope="session", autouse=True)
def clean_test_db():
    db_path = os.path.join(os.path.dirname(__file__), "..", "test_reloom.db")
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass
    yield
    from app.database import engine
    engine.dispose()
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass



@pytest.fixture(scope="session")
def client():
    from app.main import app
    return TestClient(app)


@pytest.fixture(scope="session")
def admin_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Test Admin", "email": "test-admin@example.com",
        "organization": "QA", "password": "TestAdmin@123", "role": "administrator",
    })
    resp = client.post("/api/auth/login", data={"username": "test-admin@example.com", "password": "TestAdmin@123"})
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def operator_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Test Operator", "email": "test-operator@example.com",
        "organization": "QA", "password": "TestOperator@123", "role": "recycling_facility_operator",
    })
    resp = client.post("/api/auth/login", data={"username": "test-operator@example.com", "password": "TestOperator@123"})
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def sustainability_manager_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Test Sustainability", "email": "test-sustainability@example.com",
        "organization": "QA", "password": "TestSustain@123", "role": "sustainability_manager",
    })
    resp = client.post("/api/auth/login", data={"username": "test-sustainability@example.com", "password": "TestSustain@123"})
    return resp.json()["access_token"]
