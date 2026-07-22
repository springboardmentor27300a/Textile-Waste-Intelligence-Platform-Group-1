from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import engine

from app.routers.auth import router as auth_router
# from app.routers.rbac_test import router as rbac_test_router

app = FastAPI(
    title=f"{settings.app_name} API",
    description=(
        "Backend API for textile waste analysis, recovery, "
        "and sustainability intelligence."
    ),
    version=settings.app_version,
)

app.include_router(auth_router)
# app.include_router(rbac_test_router)

@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "textile-waste-intelligence-api",
        "version": settings.app_version,
    }


@app.get("/api/health/database")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": settings.db_name,
            "connection": "successful",
        }

    except SQLAlchemyError:
        return {
            "status": "unhealthy",
            "database": settings.db_name,
            "connection": "failed",
        }

