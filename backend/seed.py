"""
Seeds the database with one demo user per role, for easy testing/demo to your mentor.
Run:  python seed.py
"""
from app.database import SessionLocal, engine
from app import models
from app.auth import hash_password

models.Base.metadata.create_all(bind=engine)

DEMO_USERS = [
    {"full_name": "Ravi Operator", "email": "operator@demo.com", "password": "Password123",
     "role": models.UserRole.RECYCLING_FACILITY_OPERATOR},
    {"full_name": "Sneha Manager", "email": "manager@demo.com", "password": "Password123",
     "role": models.UserRole.SUSTAINABILITY_MANAGER},
    {"full_name": "Arjun Manufacturer", "email": "manufacturer@demo.com", "password": "Password123",
     "role": models.UserRole.TEXTILE_MANUFACTURER},
    {"full_name": "Admin User", "email": "admin@demo.com", "password": "Password123",
     "role": models.UserRole.ADMINISTRATOR},
]


def run():
    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if existing:
                print(f"Skipping (exists): {u['email']}")
                continue
            user = models.User(
                full_name=u["full_name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user)
            print(f"Created: {u['email']} / {u['password']} ({u['role'].value})")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
