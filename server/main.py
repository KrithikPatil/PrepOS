"""
PrepOS Backend - FastAPI Application
Main entry point for the API server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.settings import get_settings
from db.mongodb import MongoDB
from api.routes import auth, tests, agents, students

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting PrepOS Backend...")
    await MongoDB.connect()
    yield
    # Shutdown
    await MongoDB.disconnect()
    print("👋 PrepOS Backend stopped")


# Initialize FastAPI app
app = FastAPI(
    title="PrepOS API",
    description="CAT Preparation Platform with AI-Powered Learning",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PrepOS API",
        "version": "1.0.0"
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
