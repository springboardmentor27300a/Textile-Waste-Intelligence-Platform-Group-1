"""
Authentication routes.

POST /api/auth/register  - create a new user (defaults to 'viewer' role;
                            only an admin can create other admins/staff)
POST /api/auth/login     - returns a JWT on valid credentials
GET  /api/auth/me        - returns the current user's profile (requires token)
GET  /api/auth/users     - admin-only: list all users
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, VALID_ROLES
from app.utils.security import (
    hash_password,
    verify_password,
    generate_token,
    token_required,
    role_required,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    requested_role = data.get("role", "viewer")

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "username or email already in use"}), 409

    # Public self-registration is restricted to the 'viewer' role.
    # Elevated roles (admin/staff) must be created via the admin-only
    # user management endpoint in a future milestone.
    role = "viewer" if requested_role not in VALID_ROLES else "viewer"

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    token = generate_token(user)
    return jsonify({"message": "Registration successful", "token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("username") or data.get("email") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "username/email and password are required"}), 400

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user)
    return jsonify({"message": "Login successful", "token": token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    user = User.query.get(request.current_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/users", methods=["GET"])
@token_required
@role_required("admin")
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200
