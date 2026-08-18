import pytest
from unittest.mock import patch

# Minimal valid 1x1 RGB PNG (67 bytes)
PNG_1x1 = bytes([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
    0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,
    0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
    0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,
    0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
    0x44,0xae,0x42,0x60,0x82
])

@pytest.fixture
def auth_headers(client):
    payload = {
        "email": "pipeline@example.com",
        "full_name": "Pipeline User",
        "password": "pipelinepassword"
    }
    client.post("/api/auth/register", json=payload)
    login_payload = {"email": payload["email"], "password": payload["password"]}
    response = client.post("/api/auth/login", json=login_payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_pipeline_image_upload(client, auth_headers):
    files = {"file": ("test.png", PNG_1x1, "image/png")}
    response = client.post("/image/upload", headers=auth_headers, files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] is not None
    assert data["mime_type"] == "image/png"
    assert "file_url" in data

@patch("app.routers.classification.material_classifier.classify")
def test_pipeline_material_classification(mock_classify, client, auth_headers):
    mock_classify.return_value = {
        "material": "Cotton",
        "confidence": 98.5,
        "fabric_type": "Woven",
        "fiber_composition": "100% Cotton",
        "blend_identification": "None",
        "material_quality": "High",
        "fabric_category": "Natural"
    }
    
    # Upload an image first
    files = {"file": ("test.png", PNG_1x1, "image/png")}
    upload_res = client.post("/image/upload", headers=auth_headers, files=files)
    image_id = upload_res.json()["id"]
    
    payload = {"image_id": image_id}
    response = client.post("/classification/material", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["material"] == "Cotton"
    assert data["confidence"] == 98.5

def test_pipeline_waste_classification(client, auth_headers):
    payload = {"material": "Cotton"}
    response = client.post("/classification/waste", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert data["material"] == "Cotton"

def test_pipeline_recommendations(client, auth_headers):
    payload = {
        "material": "Cotton",
        "category": "Recyclable",
        "image_id": None
    }
    response = client.post("/classification/recommendations", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)

def test_pipeline_recyclability_assessment(client, auth_headers):
    payload = {
        "material": "Polyester",
        "condition": "good",
        "contamination": "low"
    }
    response = client.post("/assessment/recyclability", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "status" in data
    assert data["material"] == "Polyester"

def test_pipeline_protected_access(client):
    # Try calling a protected endpoint without auth
    response = client.post("/classification/waste", json={"material": "Cotton"})
    # Based on HTTPBearer, this should return 403 Forbidden
    assert response.status_code == 403

def test_pipeline_invalid_request(client, auth_headers):
    # Try calling with missing required fields
    payload = {"wrong_field": "Cotton"}
    response = client.post("/classification/waste", headers=auth_headers, json=payload)
    assert response.status_code == 422
