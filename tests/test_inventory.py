"""Milestone 4 tests: inventory management & RBAC (Milestone 1 feature)."""


def _create_item(client, headers, **overrides):
    payload = {
        "item_name": "Cotton Offcuts",
        "fabric_type": "Cotton",
        "waste_category": "Pre-consumer",
        "quantity_kg": 10.0,
        "condition": "Reusable",
        "source_location": "Test Unit",
        "recycling_status": "Pending",
    }
    payload.update(overrides)
    return client.post("/api/inventory/", headers=headers, json=payload)


def test_create_and_list_item(client, staff_headers):
    res = _create_item(client, staff_headers)
    assert res.status_code == 201

    res = client.get("/api/inventory/", headers=staff_headers)
    assert res.status_code == 200
    assert res.get_json()["count"] == 1


def test_viewer_cannot_create_item(client, viewer_headers):
    res = _create_item(client, viewer_headers)
    assert res.status_code == 403


def test_only_admin_can_delete(client, staff_headers, admin_headers):
    res = _create_item(client, staff_headers)
    item_id = res.get_json()["item"]["id"]

    res = client.delete(f"/api/inventory/{item_id}", headers=staff_headers)
    assert res.status_code == 403

    res = client.delete(f"/api/inventory/{item_id}", headers=admin_headers)
    assert res.status_code == 200


def test_inventory_summary(client, staff_headers):
    _create_item(client, staff_headers, quantity_kg=20.0)
    _create_item(client, staff_headers, quantity_kg=30.0, recycling_status="Recycled")

    res = client.get("/api/inventory/summary", headers=staff_headers)
    assert res.status_code == 200
