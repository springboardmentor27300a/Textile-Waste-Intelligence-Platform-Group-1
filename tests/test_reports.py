"""Milestone 4 tests: Reports & Export System."""


def test_report_catalog(client, staff_headers):
    res = client.get("/api/reports/", headers=staff_headers)
    assert res.status_code == 200
    ids = [r["id"] for r in res.get_json()["reports"]]
    assert "sustainability" in ids
    assert "environmental-impact" in ids


def test_unknown_report_type_404(client, staff_headers):
    res = client.get("/api/reports/not-a-real-report/pdf", headers=staff_headers)
    assert res.status_code == 404
    res = client.get("/api/reports/not-a-real-report/excel", headers=staff_headers)
    assert res.status_code == 404


def test_pdf_report_generation_empty_state(client, staff_headers):
    """PDF generation should not blow up when there's no data yet."""
    res = client.get("/api/reports/recycling/pdf", headers=staff_headers)
    assert res.status_code == 200
    assert res.mimetype == "application/pdf"
    assert res.data[:4] == b"%PDF"


def test_excel_report_generation_with_data(client, staff_headers):
    client.post("/api/inventory/", headers=staff_headers, json={
        "item_name": "Wool Scraps", "fabric_type": "Wool", "waste_category": "Industrial",
        "quantity_kg": 15.0, "condition": "Reusable", "recycling_status": "Pending",
    })
    res = client.get("/api/reports/recycling/excel", headers=staff_headers)
    assert res.status_code == 200
    assert res.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    # xlsx files are zip archives -> start with 'PK'
    assert res.data[:2] == b"PK"


def test_reports_require_auth(client):
    res = client.get("/api/reports/")
    assert res.status_code == 401
