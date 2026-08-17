from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    login_data = {
        "email": "operator@textilewaste.org",
        "password": "operator123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]

def test_download_report_csv():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/reports/download?report_type=waste-classification&format=csv", headers=headers)
    assert response.status_code == 200
    assert "TEXTILE WASTE INTELLIGENCE PLATFORM" in response.text

def test_download_report_pdf():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/reports/download?report_type=sustainability&format=pdf", headers=headers)
    assert response.status_code == 200
    assert "AUDIT REPORT" in response.text
