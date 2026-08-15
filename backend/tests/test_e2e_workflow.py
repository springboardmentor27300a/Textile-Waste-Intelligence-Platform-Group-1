import io
import pytest
from PIL import Image


def test_full_textile_waste_intelligence_lifecycle(client, db_session):
    # 1. Register User
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "email": "e2e_operator@test.com",
            "password": "Password123",
            "full_name": "E2E Operator",
            "role": "recycling_facility_operator",
        },
    )
    assert reg_resp.status_code in [200, 201]

    # 2. Login
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "e2e_operator@test.com", "password": "Password123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Inventory Batch
    batch_resp = client.post(
        "/api/inventory/",
        headers=headers,
        json={
            "batch_code": "E2E-LOT-500",
            "fabric_type": "Cotton",
            "source": "Spinning Mill Alpha",
            "quantity_kg": 500.0,
            "color": "White",
            "condition": "good",
            "notes": "Combed cotton waste",
        },
    )
    assert batch_resp.status_code == 201

    # 4. Upload textile fabric image for AI inference
    img = Image.new("RGB", (224, 224), color=(230, 230, 230))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    pred_resp = client.post(
        "/api/predictions/",
        headers=headers,
        files={"image": ("sample_fabric.png", img_bytes.getvalue(), "image/png")},
    )
    assert pred_resp.status_code in [200, 201]
    pred_data = pred_resp.json()
    assert "material_prediction" in pred_data or "material" in pred_data
    assert "recommendation" in pred_data or "recyclability_score" in pred_data

    # 5. Check Analytics Summary
    analytics_resp = client.get("/api/analytics/summary", headers=headers)
    assert analytics_resp.status_code == 200
    summary_data = analytics_resp.json()
    assert summary_data["total_batches"] >= 1
    assert summary_data["prediction_count"] >= 1

    # 6. Check Master PDF and CSV Exports
    pdf_resp = client.get("/api/reports/pdf?report_type=all", headers=headers)
    assert pdf_resp.status_code == 200
    assert len(pdf_resp.content) > 100

    csv_resp = client.get("/api/reports/export/csv?report_type=all", headers=headers)
    assert csv_resp.status_code == 200
    assert "INVENTORY" in csv_resp.text
