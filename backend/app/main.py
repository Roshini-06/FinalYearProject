from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routes import complaint_routes
from app.api.v1 import health
from app.core.config import settings
from app.db.database import engine, Base
from app.middlewares.logging_middleware import LoggingMiddleware

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI solution for automated public service complaint management",
    version="2.0.0",
    lifespan=lifespan
)

# Middlewares
# app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])

app.include_router(complaint_routes.router, prefix="/api/v1/complaints", tags=["Complaints"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "status": "online",
        "version": "2.0.0"
    }
