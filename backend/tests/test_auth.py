def test_register_success(client):
    payload = {
        "email": "testuser1@example.com",
        "full_name": "Test User One",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert "id" in data
    assert data["is_active"] is True
    assert "password" not in data
    assert "password_hash" not in data

def test_register_duplicate(client):
    payload = {
        "email": "duplicate@example.com",
        "full_name": "Duplicate User",
        "password": "password"
    }
    # First registration
    client.post("/api/auth/register", json=payload)
    
    # Second registration should fail
    response2 = client.post("/api/auth/register", json=payload)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Email already registered"

def test_login_success(client):
    # Register first
    payload = {
        "email": "loginuser@example.com",
        "full_name": "Login User",
        "password": "loginpassword"
    }
    client.post("/api/auth/register", json=payload)
    
    # Login
    login_payload = {
        "email": payload["email"],
        "password": payload["password"]
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == payload["email"]

def test_login_invalid_credentials(client):
    # Attempt login with non-existent user
    login_payload = {
        "email": "notfound@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_protected_endpoint_without_auth(client):
    response = client.get("/api/inventory")
    # Usually unauthorized without a token returns 403 Forbidden by FastAPI HTTPBearer dependency
    assert response.status_code == 403

def test_protected_endpoint_with_invalid_token(client):
    headers = {
        "Authorization": "Bearer invalid.token.value"
    }
    response = client.get("/api/inventory", headers=headers)
    assert response.status_code == 401
