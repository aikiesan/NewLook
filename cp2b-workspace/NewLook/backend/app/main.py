"""
CP2B Maps V3 Backend API
FastAPI application for geospatial biogas potential analysis
Sprint 4: Performance optimizations, error handling, and production deployment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path
import os
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import test_db_connection
from app.api.v1.api import api_router
from app.middleware.rate_limiter import rate_limit_middleware
from app.middleware.response_compression import gzip_middleware
from app.services.cache_service import get_all_cache_stats

# Create FastAPI app
app = FastAPI(
    title="CP2B Maps V3 API",
    description="Backend API for biogas potential analysis platform",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Sprint 4: Performance Middleware (applied in order)
# 1. Rate limiting (prevents abuse)
app.middleware("http")(rate_limit_middleware)

# 2. CORS middleware - NO WILDCARDS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_all_origins(),  # Includes both default and production origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicit methods
    allow_headers=["*"],  # Allow all headers for preflight compatibility
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Window"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# 3. Response compression (reduces bandwidth)
app.middleware("http")(gzip_middleware)

# Trusted host middleware - DISABLED for Railway deployment
# Railway uses dynamic host headers that don't work well with TrustedHostMiddleware
# TODO: Re-enable with proper configuration after deployment is stable
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=settings.ALLOWED_HOSTS,
# )

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "CP2B Maps V3 API",
        "version": "3.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint with database verification.
    Returns current timestamp and database connectivity status.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.VERSION,
        "environment": settings.APP_ENV
    }

    # Check database connectivity
    try:
        db_healthy = test_db_connection()
        health_status["database"] = "connected" if db_healthy else "error"

        if not db_healthy:
            health_status["status"] = "degraded"
            return JSONResponse(
                status_code=200,  # Still return 200 for degraded state
                content=health_status
            )

    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
        health_status["error"] = str(e)
        return JSONResponse(
            status_code=503,  # Service unavailable
            content=health_status
        )

    return health_status


@app.get("/health/ready")
async def readiness_check():
    """Kubernetes-style readiness probe - checks if app can serve traffic"""
    try:
        if test_db_connection():
            return {"ready": True, "timestamp": datetime.now(timezone.utc).isoformat()}
        return JSONResponse(
            status_code=503,
            content={"ready": False, "reason": "database_unavailable"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"ready": False, "reason": str(e)}
        )


@app.get("/health/live")
async def liveness_check():
    """Kubernetes-style liveness probe - checks if app process is alive"""
    return {
        "alive": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/stats/cache")
async def cache_statistics():
    """
    Cache performance statistics (Sprint 4)
    Shows hit rates and cache efficiency
    """
    stats = get_all_cache_stats()
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "caches": stats
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )