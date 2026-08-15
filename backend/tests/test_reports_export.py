import pytest
from app.models import WasteBatch, WasteCondition, Prediction


@pytest.fixture
def seeded_report_data(test_user, db_session):
    batch = WasteBatch(
        batch_code="BATCH-001",
        fabric_type="Cotton",
        source="Factory",
        quantity_kg=100.0,
        color="White",
        condition=WasteCondition.GOOD,
        owner_id=test_user.id,
    )
    pred = Prediction(
        user_id=test_user.id,
        image_name="sample_test.png",
        image_path="/app/uploads/sample_test.png",
        material="Cotton",
        confidence=92.5,
        waste_category="Recyclable",
        reuse_potential="High",
        disposal_method="Fiber Recycling",
        recyclability_level="High",
        recyclability_score=92.5,
        recommendation="Fiber recovery recommended",
        estimated_carbon_saving_kg=15.2,
        estimated_water_saving_liters=9600.0,
    )
    db_session.add_all([batch, pred])
    db_session.commit()
    return batch, pred


def test_reports_json_endpoint(client, auth_headers, seeded_report_data):
    response = client.get("/api/reports/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert data["summary"]["total_batches"] >= 1
    assert data["summary"]["total_predictions"] >= 1


@pytest.mark.parametrize("report_type", ["all", "waste_classification", "recycling", "sustainability", "environmental_impact", "circular_economy"])
def test_reports_pdf_export_all_categories(client, auth_headers, seeded_report_data, report_type):
    response = client.get(
        f"/api/reports/pdf?report_type={report_type}",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 100


@pytest.mark.parametrize("report_type", ["all", "waste_classification", "recycling", "sustainability", "environmental_impact", "circular_economy"])
def test_reports_csv_export_all_categories(client, auth_headers, seeded_report_data, report_type):
    response = client.get(
        f"/api/reports/export/csv?report_type={report_type}",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    text_content = response.content.decode("utf-8")
    assert len(text_content) > 20
