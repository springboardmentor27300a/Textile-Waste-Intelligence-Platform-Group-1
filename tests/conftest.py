"""
Milestone 4: pytest fixtures.

Every test gets a fresh in-memory SQLite database (SEED_DEMO_DATA off,
so tests control exactly what data exists) and a Flask test client.
Helper fixtures create an admin/staff/viewer user + matching JWT so
route tests can hit RBAC-protected endpoints directly.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest

from app import create_app, db as _db
from app.models.user import User
from app.utils.security import hash_password, generate_token


@pytest.fixture
def app():
    application = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SEED_DEMO_DATA": False,
    })
    yield application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    with app.app_context():
        yield _db


def _make_user(db, username, role):
    user = User(
        username=username,
        email=f"{username}@test.local",
        password_hash=hash_password("Test@1234"),
        role=role,
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def admin_headers(app, db):
    with app.app_context():
        user = _make_user(db, "admin_test", "admin")
        token = generate_token(user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def staff_headers(app, db):
    with app.app_context():
        user = _make_user(db, "staff_test", "staff")
        token = generate_token(user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def viewer_headers(app, db):
    with app.app_context():
        user = _make_user(db, "viewer_test", "viewer")
        token = generate_token(user)
    return {"Authorization": f"Bearer {token}"}
