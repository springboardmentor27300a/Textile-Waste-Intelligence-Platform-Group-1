"""Milestone 4 tests: sustainability intelligence engine (Milestone 3 feature)."""

from app.models.analysis import AnalysisResult
from app import db as _db


def _create_analysis_result(app):
    with app.app_context():
        result = AnalysisResult(
            predicted_material="Cotton",
            confidence=0.92,
            waste_category="Reusable Textile",
            recyclability_score=88.0,
            reuse_potential="High",
            quality_score=80.0,
            contamination_detected=False,
            damage_detected=False,
        )
        _db.session.add(result)
        _db.session.commit()
        return result.id


def test_assess_and_fetch(client, app, staff_headers):
    result_id = _create_analysis_result(app)

    res = client.post(f"/api/sustainability/assess/{result_id}", headers=staff_headers, json={"quantity_kg": 5})
    assert res.status_code == 200
    body = res.get_json()["assessment"]
    assert body["material"] == "Cotton"
    assert body["circularity_score"] > 0

    res = client.get(f"/api/sustainability/{result_id}", headers=staff_headers)
    assert res.status_code == 200


def test_assess_rejects_bad_quantity(client, app, staff_headers):
    result_id = _create_analysis_result(app)
    res = client.post(f"/api/sustainability/assess/{result_id}", headers=staff_headers, json={"quantity_kg": -5})
    assert res.status_code == 400


def test_assess_missing_result(client, staff_headers):
    res = client.post("/api/sustainability/assess/9999", headers=staff_headers, json={"quantity_kg": 1})
    assert res.status_code == 404


def test_dashboard_aggregates(client, app, staff_headers):
    result_id = _create_analysis_result(app)
    client.post(f"/api/sustainability/assess/{result_id}", headers=staff_headers, json={"quantity_kg": 5})

    res = client.get("/api/sustainability/dashboard", headers=staff_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["total_assessments"] == 1
    assert data["total_co2_saved_kg"] > 0
