import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _resolve_database_url(raw_url: str) -> str:
    prefix = "sqlite:///"
    if raw_url.startswith(prefix) and not raw_url.startswith(f"{prefix}/"):
        relative_path = raw_url[len(prefix):].lstrip("./")
        absolute_path = os.path.join(BACKEND_DIR, relative_path)
        return f"{prefix}{absolute_path}"
    return raw_url


class Settings:
    database_url: str = _resolve_database_url(os.getenv("DATABASE_URL", "sqlite:///./textile_waste.db"))
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-do-not-use-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


@lru_cache
def get_settings() -> Settings:
    return Settings()
