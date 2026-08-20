import os

PORT = int(os.environ.get("PORT", 8000))
JWT_SECRET = os.environ.get("JWT_SECRET", "textile_waste_secret_jwt_key_2026_safe")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60 * 24 * 7  # 7 days

# Default connection string with credentials, falling back to local MongoDB if Atlas connection fails
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://tarunchanamolu:CH.Tarun1@cluster0.mongodb.net/textile_waste_db?retryWrites=true&w=majority"
)
DATABASE_NAME = "textile_waste_db"
