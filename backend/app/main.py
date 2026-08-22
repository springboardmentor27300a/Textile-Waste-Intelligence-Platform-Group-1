import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .config import get_settings
from .routers import (
    auth, users, inventory, datasets, material_insights, analysis, sustainability, exports, notifications
)

from sqlalchemy import text
Base.metadata.create_all(bind=engine)

settings = get_settings()
_cols = [
    ("image_path", "VARCHAR"),
    ("material_rationale", "TEXT"),
    ("predicted_fabric_type", "VARCHAR"),
    ("fabric_confidence", "FLOAT"),
    ("classification_method", "VARCHAR"),
]
with engine.connect() as conn:
    for c_name, c_type in _cols:
        if settings.database_url.startswith("sqlite"):
            try:
                conn.execute(text(f"ALTER TABLE image_analyses ADD COLUMN {c_name} {c_type}"))
                conn.commit()
            except Exception:
                pass
        else:
            try:
                conn.execute(text(f"ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS {c_name} {c_type}"))
                conn.commit()
            except Exception:
                pass

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="Authentication, RBAC, inventory, material classification, and sustainability intelligence.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(datasets.router)
app.include_router(material_insights.router)
app.include_router(analysis.router)
app.include_router(sustainability.router)
app.include_router(exports.router)
app.include_router(notifications.router)


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "environment": settings.environment}

