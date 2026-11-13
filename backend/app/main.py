from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints import health, reports

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational health literacy backend explaining laboratory medical reports in plain conversational language.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount directly under /api (as requested in specifications)
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(health.router, prefix="/api", tags=["Health"])

# Also mount under /api/v1 for versioned routing
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "ReportSaathi Backend API",
        "status": "online",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "analyze": "/api/reports/analyze",
            "health": "/api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
