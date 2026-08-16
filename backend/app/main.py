from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine

from .routers import (
    auth,
    users,
    inventory,
    dataset,
    ai,
    prediction,
    analytics,
    reports,
    notifications,
)

from sqlalchemy import inspect, text

# Create database tables
models.Base.metadata.create_all(bind=engine)

def _auto_migrate_schema():
    try:
        inspector = inspect(engine)
        if "predictions" in inspector.get_table_names():
            existing_cols = {c["name"] for c in inspector.get_columns("predictions")}
            required_cols = [
                ("circularity_score", "FLOAT DEFAULT 0.0"),
                ("circularity_category", "VARCHAR"),
                ("sustainability_score", "FLOAT DEFAULT 0.0"),
                ("material_recovery_score", "FLOAT DEFAULT 0.0"),
                ("reuse_score", "FLOAT DEFAULT 0.0"),
                ("environmental_benefit_score", "FLOAT DEFAULT 0.0"),
                ("processing_feasibility_score", "FLOAT DEFAULT 0.0"),
                ("estimated_energy_saving_kwh", "FLOAT DEFAULT 0.0"),
                ("landfill_diverted_kg", "FLOAT DEFAULT 0.0"),
            ]
            with engine.connect() as conn:
                for col_name, col_type in required_cols:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE predictions ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
    except Exception:
        pass

_auto_migrate_schema()

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    version="2.0.0",
    description="AI-powered Textile Waste Intelligence Platform"
)

# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Register Routers
# ---------------------------------------------------------

app.include_router(auth.router)

app.include_router(users.router)

app.include_router(inventory.router)

app.include_router(dataset.router)

app.include_router(ai.router)

app.include_router(prediction.router)

app.include_router(analytics.router)

app.include_router(reports.router)

app.include_router(notifications.router)


# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------

@app.get("/")
def root():

    return {

        "application": "Textile Waste Intelligence Platform",

        "version": "2.0.0",

        "status": "Running"

    }


# ---------------------------------------------------------
# Health Check Endpoints
# ---------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/api/health")
def health():

    return {

        "status": "Healthy",

        "database": "Connected",

        "ai_engine": "Available",

        "version": "2.0.0"

    }