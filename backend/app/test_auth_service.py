from sqlalchemy import select

from app.core.security import verify_password
from app.database import SessionLocal
from app.models import Role, User
from app.schemas.auth import RegisterRequest
from app.services.auth_service import normalize_email


def test_registration_logic() -> None:
    db = SessionLocal()

    try:
        role = db.scalar(
            select(Role).where(Role.name == "MANUFACTURER")
        )

        assert role is not None

        registration = RegisterRequest(
            full_name="Authentication Test User",
            email="AUTH.TEST@EXAMPLE.COM",
            password="Password123",
            phone="9876543210",
        )

        from app.core.security import hash_password

        user = User(
            organization_id=None,
            role_id=role.id,
            full_name=registration.full_name.strip(),
            email=normalize_email(
                str(registration.email)
            ),
            password_hash=hash_password(
                registration.password
            ),
            phone=registration.phone,
            is_active=True,
            is_verified=False,
        )

        db.add(user)
        db.flush()

        assert user.id is not None

        assert user.email == "auth.test@example.com"

        assert user.password_hash != "Password123"

        assert verify_password(
            "Password123",
            user.password_hash,
        )

        assert role.name == "MANUFACTURER"

        print("========================================")
        print("AUTH SERVICE FOUNDATION TEST PASSED")
        print("========================================")
        print(f"User ID      : {user.id}")
        print(f"Email        : {user.email}")
        print(f"Role         : {role.name}")
        print(f"Active       : {user.is_active}")
        print(f"Verified     : {user.is_verified}")
        print("Password     : securely hashed")
        print("========================================")

    finally:
        db.rollback()
        db.close()


if __name__ == "__main__":
    test_registration_logic()