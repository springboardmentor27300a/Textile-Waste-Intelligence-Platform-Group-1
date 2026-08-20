"""
Textile Waste Intelligence Platform - FastAPI Main Application
Milestone 4: Added structured logging, request middleware, file size limits,
             production CORS config, and health-check enhancements.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging
import logging.config

from app.config import settings
from app.database import create_tables
from app.routers.auth import router as auth_router
from app.routers.inventory import router as inventory_router
from app.routers.ai_analysis import router as ai_router
from app.routers.misc_routers import (
    recommendations_router, sustainability_router,
    environmental_router, circular_economy_router,
    dashboard_router, notifications_router, admin_router, reports_router
)
from app.middleware.logging_middleware import RequestLoggingMiddleware

# ─── Structured logging setup ────────────────────────────────────────────────
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "json",
            "filename": "twip_app.log",
            "maxBytes": 5 * 1024 * 1024,  # 5 MB per file
            "backupCount": 3,
        },
    },
    "loggers": {
        "twip": {
            "handlers": ["console", "file"],
            "level": settings.LOG_LEVEL,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": ["console"],
            "level": "INFO",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("twip.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("TWIP Platform starting up — environment: %s", settings.ENVIRONMENT)
    await create_tables()
    os.makedirs("uploads", exist_ok=True)
    await seed_demo_data()
    logger.info("TWIP Platform ready on port 8000")
    yield
    logger.info("TWIP Platform shutting down")


async def seed_demo_data():
    """Seed sample inventory and notification data for demo."""
    from app.database import AsyncSessionLocal
    from app.models.user import User
    from app.models.inventory import TextileInventory
    from app.models.notification import Notification
    from app.services.auth_service import get_password_hash
    from sqlalchemy import select
    import random
    from datetime import datetime, timedelta

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            return

        logger.info("Seeding demo data...")

        # Create admin user
        admin = User(
            full_name="Admin User", email="admin@textile.com",
            hashed_password=get_password_hash("admin123"), role="admin",
            company="Textile Waste Solutions"
        )
        db.add(admin)

        # Demo users
        demo_roles = ["sustainability_manager", "textile_manufacturer", "recycling_facility_operator"]
        demo_names = ["Priya Sharma", "Rahul Verma", "Anita Singh"]
        demo_emails = ["priya@textile.com", "rahul@textile.com", "anita@textile.com"]
        for name, email, role in zip(demo_names, demo_emails, demo_roles):
            user = User(full_name=name, email=email,
                        hashed_password=get_password_hash("demo123"), role=role,
                        company="EcoTextile India")
            db.add(user)

        # Sample inventory
        fabrics = ["Cotton", "Polyester", "Wool", "Denim", "Nylon", "Silk", "Rayon", "Acrylic"]
        sources = ["Factory A - Mumbai", "Warehouse B - Delhi", "Mill C - Surat", "Export Unit - Chennai"]
        conditions = ["Good", "Fair", "Poor", "Critical"]
        classifications = ["Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable"]
        import string
        for i in range(25):
            batch_id = "TW-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            days_ago = random.randint(1, 90)
            item = TextileInventory(
                waste_batch_id=batch_id,
                fabric_type=random.choice(fabrics),
                source=random.choice(sources),
                quantity_kg=round(random.uniform(10, 500), 2),
                color=random.choice(["White", "Black", "Blue", "Green", "Grey", "Beige"]),
                condition=random.choice(conditions),
                collection_date=datetime.now() - timedelta(days=days_ago),
                classification=random.choice(classifications),
                sustainability_score=round(random.uniform(55, 98), 1)
            )
            db.add(item)

        # Sample notifications
        notif_data = [
            ("Waste Collection Alert", "New batch TW-ABC123 collected from Factory A - 250 kg", "warning"),
            ("Recycling Opportunity", "Cotton batch ready for fiber recycling - 92% confidence", "success"),
            ("Low Inventory Alert", "Denim stock below threshold. Consider new collection.", "error"),
            ("Sustainability Achievement", "Platform reached 1000 kg recycled! Great milestone! 🎉", "success"),
            ("Admin Notification", "New user registered: Textile Manufacturer - Rahul Verma", "info"),
            ("AI Analysis Complete", "Image analysis complete: Polyester detected with 94.2% confidence", "info"),
            ("Monthly Report Ready", "July 2026 sustainability report has been generated", "info"),
        ]
        for title, msg, ntype in notif_data:
            notif = Notification(title=title, message=msg, type=ntype)
            db.add(notif)

        await db.commit()
        logger.info("Demo data seeded successfully")


app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="AI-powered textile waste management and sustainability analysis platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# ─── Middleware ───────────────────────────────────────────────────────────────
app.add_middleware(RequestLoggingMiddleware)

# CORS — allow all origins for production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static files ─────────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_router,              prefix="/api")
app.include_router(inventory_router,         prefix="/api")
app.include_router(ai_router,                prefix="/api")
app.include_router(recommendations_router,   prefix="/api")
app.include_router(sustainability_router,    prefix="/api")
app.include_router(environmental_router,     prefix="/api")
app.include_router(circular_economy_router,  prefix="/api")
app.include_router(dashboard_router,         prefix="/api")
app.include_router(notifications_router,     prefix="/api")
app.include_router(admin_router,             prefix="/api")
app.include_router(reports_router,           prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "Textile Waste Intelligence Platform API",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health-check endpoint — used by Docker and load balancers."""
    import os
    db_exists = os.path.exists("textile_waste.db")
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_exists else "sqlite_in_memory",
        "version": "2.0.0",
    }
