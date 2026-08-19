"""Milestone 4 tests: Executive Dashboards & Analytics."""


def test_executive_dashboard_structure_for_non_admin(client, staff_headers):
    res = client.get("/api/analytics/executive", headers=staff_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert "facility" in data
    assert "sustainability" in data
    assert "manufacturer" in data
    assert "admin" not in data  # only admins see the admin section


def test_executive_dashboard_admin_section(client, admin_headers):
    res = client.get("/api/analytics/executive", headers=admin_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert "admin" in data
    assert data["admin"]["total_users"] >= 1


def test_executive_dashboard_reflects_inventory(client, staff_headers):
    client.post("/api/inventory/", headers=staff_headers, json={
        "item_name": "Denim Scraps", "fabric_type": "Denim", "waste_category": "Pre-consumer",
        "quantity_kg": 40.0, "condition": "Reusable", "recycling_status": "Recycled",
    })
    res = client.get("/api/analytics/executive", headers=staff_headers)
    facility = res.get_json()["facility"]
    assert facility["total_items"] == 1
    assert facility["total_quantity_kg"] == 40.0
    assert facility["recycling_rate_pct"] == 100.0


def test_trends_endpoint_shape(client, staff_headers):
    res = client.get("/api/analytics/trends?days=7", headers=staff_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["labels"]) == 7
    assert len(data["intake_kg_by_day"]) == 7


def test_analytics_requires_auth(client):
    res = client.get("/api/analytics/executive")
    assert res.status_code == 401
