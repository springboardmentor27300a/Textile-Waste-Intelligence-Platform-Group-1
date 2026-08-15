import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import User, UserRole
from app.auth import hash_password, create_access_token


def test_user_registration_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "Password123",
            "full_name": "New User",
            "role": "sustainability_manager",
        },
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "sustainability_manager"


def test_user_registration_duplicate_email(client, db_session):
    user = User(
        full_name="Existing User",
        email="existing@test.com",
        hashed_password=hash_password("Password123"),
        role=UserRole.ADMINISTRATOR,
        is_active=1,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/register",
        json={
            "email": "existing@test.com",
            "password": "Password123",
            "full_name": "Duplicate User",
            "role": "textile_manufacturer",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_user_login_success(client, db_session):
    user = User(
        full_name="Login User",
        email="login@test.com",
        hashed_password=hash_password("Password123"),
        role=UserRole.RECYCLING_FACILITY_OPERATOR,
        is_active=1,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "login@test.com", "password": "Password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@test.com"


def test_user_login_invalid_password(client, db_session):
    user = User(
        full_name="Login User",
        email="login2@test.com",
        hashed_password=hash_password("Password123"),
        role=UserRole.RECYCLING_FACILITY_OPERATOR,
        is_active=1,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "login2@test.com", "password": "WrongPassword"},
    )
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower() or "incorrect" in response.json()["detail"].lower()


def test_unauthorized_access_protection(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_authorized_me_endpoint(client, db_session):
    user = User(
        full_name="Me User",
        email="me@test.com",
        hashed_password=hash_password("Password123"),
        role=UserRole.RECYCLING_FACILITY_OPERATOR,
        is_active=1,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@test.com"
