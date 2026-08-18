from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import create_tables
from app.config import settings
from app.routers import auth, inventory, waste, suppliers
from app.routers.image_router import router as image_router            # Milestone 2
from app.routers.classification import router as classification_router  # Milestone 2
from app.routers.assessment import router as assessment_router          # Milestone 2
from app.routers.report import router as report_router                  # Milestone 2
from app.routers.sustainability import router as sustainability_router  # Milestone 3
from app.routers.recommendation import router as recommendation_router  # Milestone 4
from app.routers.environmental import router as environmental_router    # Milestone 4 — Environmental Impact Assessment
from app.routers.circular_analytics import router as circular_analytics_router  # Milestone 3 — Circular Economy Analytics Engine
from app.routers import admin                                           # Milestone 4 - Admin
# from app.routers.upload_router import router as upload_router          # Image Upload Module (Disabled due to route conflict)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered textile waste tracking, analytics, and management platform.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:8000", "http://127.0.0.1:8000", "null"],
    allow_origin_regex=r".*",  # Allow all for local dev (bypasses Starlette * + credentials restriction)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(waste.router)
app.include_router(suppliers.router)
app.include_router(image_router)                                        # Milestone 2
app.include_router(classification_router)                               # Milestone 2
app.include_router(assessment_router)                                   # Milestone 2
app.include_router(report_router)                                       # Milestone 2
app.include_router(sustainability_router)                               # Milestone 3
app.include_router(recommendation_router)                               # Milestone 4
app.include_router(environmental_router)                                # Milestone 4 — Environmental Impact Assessment
app.include_router(circular_analytics_router)                           # Milestone 3 — Circular Economy Analytics Engine
app.include_router(admin.router)                                        # Milestone 4 - Admin User Management
from app.routers import notifications                                   # Import locally to avoid issues
app.include_router(notifications.router)                                # Milestone 4 - Notification & Alerts
# app.include_router(upload_router)                                       # Image Upload Module (Disabled due to route conflict)

# ── Static Files: serve uploaded textile images ───────────────────────────────
_uploads_dir = Path(__file__).resolve().parent / "uploads"
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")  # Milestone 2


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_tables()
    print(f"[OK] {settings.app_name} v{settings.app_version} started")
    print("[DOCS] API Docs: http://localhost:8000/docs")


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}


@app.get("/", tags=["Root"])
def root():
    return {"message": f"Welcome to {settings.app_name}", "docs": "/docs"}
