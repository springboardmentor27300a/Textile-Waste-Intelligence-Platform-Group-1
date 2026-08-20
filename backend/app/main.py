from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import engine

from app.routers.auth import router as auth_router
# from app.routers.rbac_test import router as rbac_test_router
from app.routers.organizations import router as organizations_router
from app.routers.facilities import router as facilities_router
from app.routers.waste_batches import router as waste_batches_router
from app.routers.waste_images import router as waste_images_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analysis import router as analysis_router

from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router
from app.routers.notifications import router as notifications_router
from app.routers.users import router as users_router

app = FastAPI(
    title=f"{settings.app_name} API",
    description=(
        "Backend API for textile waste analysis, recovery, "
        "and sustainability intelligence."
    ),
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
# app.include_router(rbac_test_router)
app.include_router(organizations_router)
app.include_router(facilities_router)
app.include_router(waste_batches_router)
app.include_router(waste_images_router)
app.include_router(analysis_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(users_router)

app.include_router(
    dashboard_router
)

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



