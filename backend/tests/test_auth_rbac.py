def test_register_and_login(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Fixture User", "email": "fixture-user@example.com",
        "organization": "Test Co", "password": "FixturePass@123", "role": "textile_manufacturer",
    })
    assert resp.status_code == 201

    resp = client.post("/api/auth/login", data={"username": "fixture-user@example.com", "password": "FixturePass@123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password_rejected(client):
    resp = client.post("/api/auth/login", data={"username": "fixture-user@example.com", "password": "WrongPassword"})
    assert resp.status_code == 401


def test_duplicate_email_rejected(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Duplicate", "email": "fixture-user@example.com",
        "organization": "Test Co", "password": "AnotherPass@123", "role": "textile_manufacturer",
    })
    assert resp.status_code == 400


def test_unauthenticated_request_rejected(client):
    resp = client.get("/api/inventory")
    assert resp.status_code == 401


def test_sustainability_manager_cannot_register_batch(client, sustainability_manager_token):
    """RBAC must be enforced server-side, not just hidden in the UI."""
    resp = client.post(
        "/api/inventory",
        headers={"Authorization": f"Bearer {sustainability_manager_token}"},
        json={
            "fabric_type": "cotton", "source": "RBAC test", "source_type": "post_consumer",
            "quantity_kg": 5, "condition": "worn", "collection_date": "2026-07-01",
        },
    )
    assert resp.status_code == 403


def test_non_admin_cannot_list_users(client, operator_token):
    resp = client.get("/api/users", headers={"Authorization": f"Bearer {operator_token}"})
    assert resp.status_code == 403


def test_admin_can_list_users(client, admin_token):
    resp = client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
