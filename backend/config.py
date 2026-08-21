import os

# JWT Configuration
PORT = int(os.environ.get("PORT", 8000))
JWT_SECRET = os.environ.get("JWT_SECRET", "change_this_secret_in_production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60 * 24 * 7  # 7 days

# IMPORTANT: Always override JWT_SECRET via environment variable in production.
# Never use the default value above in a real deployment.
