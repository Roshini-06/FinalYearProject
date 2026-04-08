from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import complaint, auth, health
from app.core.config import settings

from app.db.database import engine, Base
from app.models import user, complaint # Ensure models are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Cleanup logic

app = FastAPI(
    title="AI Complaint Classification & Prioritization System",
    description="Full-stack AI solution for automated public service complaint management",
    version="2.0.0",
    lifespan=lifespan
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(complaint.router, prefix="/api/v1/complaints", tags=["Complaints"])

@app.get("/")
async def root():
    return {"message": "AI Complaint Classification API is running"}
