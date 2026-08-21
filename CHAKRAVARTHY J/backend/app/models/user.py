"""
User model - supports role-based access control (RBAC).

Roles in this platform:
  - admin: full access (manage users, all inventory, dataset tools)
  - staff: can create/update inventory items, view datasets
  - viewer: read-only access to inventory and analytics
"""

from datetime import datetime
from app import db

VALID_ROLES = ("admin", "staff", "viewer")


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="viewer")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def has_role(self, *roles):
        return self.role in roles
