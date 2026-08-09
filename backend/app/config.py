from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./textile_waste.db"
    secret_key: str = "textile-waste-super-secret-jwt-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    app_name: str = "Textile Waste Intelligence Platform"
    app_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
