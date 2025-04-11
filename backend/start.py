import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import accounts, tasks, proxies, settings, activities
from app.database import engine, Base
from app.services.scheduler import scheduler
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Email Warmup API",
    description="API for email reputation automation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router, prefix="/api/v1/accounts", tags=["accounts"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(proxies.router, prefix="/api/v1/proxies", tags=["proxies"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(activities.router, prefix="/api/v1/activities", tags=["activities"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting up application...")
    scheduler.start()
    logger.info("Scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down application...")
    scheduler.shutdown()
    logger.info("Scheduler stopped")

if __name__ == "__main__":
    uvicorn.run(
        "start:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 