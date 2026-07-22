from fastapi import FastAPI


app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="Backend API for textile waste analysis, recovery, and sustainability intelligence.",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Textile Waste Intelligence Platform API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "textile-waste-intelligence-api",
        "version": "1.0.0",
    }