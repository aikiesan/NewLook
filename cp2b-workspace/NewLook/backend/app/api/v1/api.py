"""
Main API router for CP2B Maps V3
"""
from fastapi import APIRouter

from app.api.v1.endpoints import municipalities, analysis, auth, maps, geospatial, mock_geospatial, infrastructure, mapbiomas, proximity

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

api_router.include_router(
    municipalities.router,
    prefix="/municipalities",
    tags=["municipalities"]
)

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["analysis"]
)

api_router.include_router(
    maps.router,
    prefix="/maps",
    tags=["maps"]
)

api_router.include_router(
    geospatial.router,
    prefix="/geospatial",
    tags=["geospatial", "postgis"]
)

api_router.include_router(
    infrastructure.router,
    prefix="/infrastructure",
    tags=["infrastructure", "geospatial"]
)

# Mock data endpoints for development (sample data)
api_router.include_router(
    mock_geospatial.router,
    prefix="/mock",
    tags=["mock-data", "development"]
)

# MapBiomas raster tile endpoints
api_router.include_router(
    mapbiomas.router,
    prefix="/mapbiomas",
    tags=["mapbiomas", "raster", "environmental"]
)

# Proximity analysis endpoints
api_router.include_router(
    proximity.router,
    prefix="/proximity",
    tags=["proximity", "spatial-analysis", "geospatial"]
)