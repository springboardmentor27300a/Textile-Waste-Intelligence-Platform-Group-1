"""Milestone 4 tests: authentication & RBAC (Milestone 1 feature)."""


def test_register_and_login(client):
    res = client.post("/api/auth/register", json={
        "username": "newuser", "email": "newuser@test.local", "password": "Secret123",
    })
    assert res.status_code == 201
    assert res.get_json()["user"]["role"] == "viewer"

    res = client.post("/api/auth/login", json={"username": "newuser", "password": "Secret123"})
    assert res.status_code == 200
    assert "token" in res.get_json()


def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={"username": "nobody", "password": "wrong"})
    assert res.status_code == 401


def test_register_requires_fields(client):
    res = client.post("/api/auth/register", json={"username": "onlyname"})
    assert res.status_code == 400


def test_me_requires_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_me_with_token(client, admin_headers):
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200
    assert res.get_json()["user"]["role"] == "admin"


def test_users_list_admin_only(client, admin_headers, viewer_headers):
    res = client.get("/api/auth/users", headers=admin_headers)
    assert res.status_code == 200

    res = client.get("/api/auth/users", headers=viewer_headers)
    assert res.status_code == 403
