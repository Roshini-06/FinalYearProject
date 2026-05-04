from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import select

from app.routes import complaint_routes
from app.api.v1 import health, admin
from app.core.config import settings
from app.db.database import engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.websocket import manager
from fastapi import WebSocket, WebSocketDisconnect

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    
    # Seed Admin User
    async with AsyncSessionLocal() as db:
        admin_email = "admin@gmail.com"
        result = await db.execute(select(User).where(User.email == admin_email))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            logger.info("Seeding default admin user...")
            new_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(new_admin)
            await db.commit()
            logger.info("Admin user created successfully")
        else:
            logger.info("Admin user already exists")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI solution for automated public service complaint management",
    version="2.0.0",
    lifespan=lifespan
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(complaint_routes.router, prefix="/api/v1/complaints", tags=["Complaints"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "status": "online",
        "version": "2.0.0"
    }

@app.websocket("/ws/{user_email}")
async def websocket_endpoint(websocket: WebSocket, user_email: str):
    # For a real app, verify token here first
    # For simplicity in this demo, we assume email is enough
    is_admin = user_email == "admin@gmail.com"
    await manager.connect(websocket, user_email, is_admin)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo or handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_email)
