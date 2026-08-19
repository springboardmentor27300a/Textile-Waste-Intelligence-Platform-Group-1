from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base
from backend.auth import router as auth_router
from backend.inventory import router as inventory_router
from backend.predict import router as predict_router
from backend.dashboard import router as dashboard_router
from backend.report import router as report_router
from backend.history import router as history_router
from backend.profile import router as profile_router


# ==========================================
# Create Database Tables
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# Create FastAPI App
# ==========================================

app = FastAPI(

    title="AI-Powered Textile Waste Intelligence Platform",

    version="1.0.0",

    description="Backend API for Textile Waste Management System"

)


# ==========================================
# Enable CORS
# ==========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


# ==========================================
# Home Route
# ==========================================

@app.get("/")
def home():

    return {

        "message":
            "Welcome to AI-Powered Textile Waste Intelligence Platform"

    }


# ==========================================
# Include Routers
# ==========================================

app.include_router(auth_router)

app.include_router(inventory_router)

app.include_router(predict_router)

app.include_router(dashboard_router)

app.include_router(report_router)

app.include_router(history_router)

app.include_router(profile_router)