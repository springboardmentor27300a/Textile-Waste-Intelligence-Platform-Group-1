from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base
from app.routers import auth, inventory, datasets, classification, sustainability, recommendation, impact, circular, dashboard, reports

# Create database tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="Interactive Swagger API documentation for the Textile Waste Intelligence Platform (Milestones 1, 2, 3 & 4). Exposes endpoints for user authentication, inventory CRUD, AI image classification, dataset cataloging, ESG sustainability metrics, role dashboards, and report streaming exports.",
    version="1.0.0",
)

# CORS configuration to allow local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(datasets.router)
app.include_router(classification.router)
app.include_router(sustainability.router)
app.include_router(recommendation.router)
app.include_router(recommendation.router_plural)
app.include_router(impact.router)
app.include_router(circular.router)
app.include_router(circular.router_analytics)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Textile Waste Intelligence Platform API is running. Access Swagger docs at /docs or ReDoc at /redoc."
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
