from fastapi import APIRouter
from app.api.v1.endpoints import reports, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
