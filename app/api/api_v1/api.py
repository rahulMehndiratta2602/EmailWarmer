from fastapi import APIRouter
from app.api.api_v1.endpoints import accounts, tasks

api_router = APIRouter()

api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"]) 