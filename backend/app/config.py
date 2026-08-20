"""
Updated Config — Textile Waste Intelligence Platform (Milestone 4)
Added: LOG_LEVEL, MAX_UPLOAD_SIZE_MB, ENVIRONMENT, ALLOWED_HOSTS
"""
from pydantic_settings import BaseSettings
from typing import List
import json

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./textile_waste.db"
    SECRET_KEY: str = "textile-waste-super-secret-key-2024-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000", "http://127.0.0.1:3000"]'

    # Milestone 4 additions
    ENVIRONMENT: str = "development"          # development | production
    LOG_LEVEL: str = "INFO"                   # DEBUG | INFO | WARNING | ERROR
    MAX_UPLOAD_SIZE_MB: int = 10              # Max file upload size in MB
    ALLOWED_HOSTS: str = "*"                  # Comma-separated hosts for production

    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except Exception:
            return ["http://localhost:3000"]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"

settings = Settings()
