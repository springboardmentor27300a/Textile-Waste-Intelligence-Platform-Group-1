"""
Security utilities: password hashing (werkzeug) and JWT issue/verify.
Kept dependency-light (no flask-jwt-extended) so the auth flow is
easy to read and audit for a Milestone 1 deliverable.
"""

import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(plain_password: str) -> str:
    return generate_password_hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, plain_password)


def generate_token(user) -> str:
    expiry_hours = current_app.config.get("JWT_EXPIRY_HOURS", 8)
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=expiry_hours),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token: str):
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])


def token_required(f):
    """Decorator: requires a valid JWT in the Authorization header."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        request.current_user = payload
        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """Decorator: requires token_required to have already run, then
    checks request.current_user['role'] against allowed_roles."""

    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_role = getattr(request, "current_user", {}).get("role")
            if user_role not in allowed_roles:
                return jsonify({
                    "error": f"Access denied: requires one of roles {allowed_roles}"
                }), 403
            return f(*args, **kwargs)

        return decorated

    return wrapper
