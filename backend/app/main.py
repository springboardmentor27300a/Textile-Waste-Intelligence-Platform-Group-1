from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, engine
from .routers import (
    analysis, auth, dashboard, insights, inventory, models_info, notifications,
    reports, users,
)

Base.metadata.create_all(bind=engine)
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Path(settings.model_dir).mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Load (and if necessary train) the models before serving traffic.

    Doing this lazily on the first upload made that one request pay the whole
    cost — a cold train showed up as a 26-second 'inference' in the metrics.
    """
    from .ml.engines import warm_models
    warm_models()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Computer vision and circularity analytics for textile waste streams.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (auth, users, inventory, analysis, dashboard, insights, notifications,
               reports, models_info):
    app.include_router(module.router)


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "service": settings.app_name}


# If the frontend has been built, serve it from the same origin. This keeps the
# single-container deployment simple; docker-compose still runs them separately.
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.is_dir():
    app.mount("/assets", StaticFiles(directory=_dist / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        """Serve the app shell for any non-API path.

        The router uses real URLs, so a refresh on /login or /inventory/3 hits the
        server directly and must still return index.html rather than a 404.
        """
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="No such endpoint.")
        candidate = _dist / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_dist / "index.html")
