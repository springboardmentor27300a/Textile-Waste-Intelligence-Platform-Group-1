def _register_batch(client, token, **overrides):
    payload = {
        "fabric_type": "cotton", "source": "Test intake", "source_type": "post_consumer",
        "quantity_kg": 10, "condition": "worn", "collection_date": "2026-07-01",
    }
    payload.update(overrides)
    return client.post("/api/inventory", headers={"Authorization": f"Bearer {token}"}, json=payload)


def test_register_batch(client, operator_token):
    resp = _register_batch(client, operator_token)
    assert resp.status_code == 201
    body = resp.json()
    assert body["batch_code"].startswith("WB-")
    assert body["category"] == "unclassified"
    assert body["status"] == "registered"


def test_batch_code_increments(client, operator_token):
    r1 = _register_batch(client, operator_token).json()
    r2 = _register_batch(client, operator_token).json()
    n1 = int(r1["batch_code"].split("-")[-1])
    n2 = int(r2["batch_code"].split("-")[-1])
    assert n2 == n1 + 1


def test_list_and_get_batch(client, operator_token):
    created = _register_batch(client, operator_token, source="List test").json()
    resp = client.get("/api/inventory", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 200
    assert any(b["id"] == created["id"] for b in resp.json())

    resp = client.get(f"/api/inventory/{created['id']}", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_nonexistent_batch_404(client, operator_token):
    resp = client.get("/api/inventory/does-not-exist", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 404


def test_update_batch_status(client, operator_token):
    created = _register_batch(client, operator_token).json()
    resp = client.patch(
        f"/api/inventory/{created['id']}",
        headers={"Authorization": f"Bearer {operator_token}"},
        json={"status": "routed"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "routed"


def test_delete_batch_requires_admin(client, operator_token):
    created = _register_batch(client, operator_token).json()
    resp = client.delete(f"/api/inventory/{created['id']}", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 403


def test_admin_can_delete_batch(client, admin_token, operator_token):
    created = _register_batch(client, operator_token).json()
    resp = client.delete(f"/api/inventory/{created['id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 204

    resp = client.get(f"/api/inventory/{created['id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 404


def test_inventory_summary(client, operator_token):
    _register_batch(client, operator_token, source="Summary test")
    resp = client.get("/api/inventory/summary", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_batches"] >= 1
    assert body["total_quantity_kg"] >= 10
