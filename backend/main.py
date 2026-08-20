from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.database import Base
from app.database.database import engine

from app.models import user
from app.models import inventory
from app.models import notification

from app.api.reports import router as reports_router
from app.api.auth import router as auth_router
from app.api.inventory import router as inventory_router
from app.api.analysis import router as analysis_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router
from app.api.users import router as users_router

from app.api import dashboard
from app.api import waste_source
from app.api import collection
from app.api import dataset

from app.core.logger import logger


# --------------------------------------------------
# Database
# --------------------------------------------------

Base.metadata.create_all(
    bind=engine
)


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="Textile Waste Intelligence Platform",
    version="1.0.0",
)


# --------------------------------------------------
# Uploads
# --------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# --------------------------------------------------
# Routers
# --------------------------------------------------

app.include_router(
    auth_router
)

app.include_router(
    inventory_router
)

app.include_router(
    dataset.router
)

app.include_router(
    reports_router
)

app.include_router(
    waste_source.router
)

app.include_router(
    collection.router
)

app.include_router(
    analysis_router
)

app.include_router(
    dashboard.router
)

app.include_router(
    analytics_router
)

from app.api.notifications import (
    router as notifications_router,
)

app.include_router(
    users_router
    )

logger.info(
    "Textile Waste Intelligence Platform started."
)


# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message":
            "Backend Running Successfully"
    }