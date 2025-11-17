"""
CP2B Maps V3 - Infrastructure Endpoints
Provides GeoJSON data for infrastructure layers (railways, pipelines, substations, etc.)
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/railways/geojson")
async def get_railways_geojson() -> Dict[str, Any]:
    """
    Get railway network GeoJSON for São Paulo state

    Returns:
        GeoJSON FeatureCollection with railway lines

    Note: Currently returns sample data. Will be connected to real database in future.
    """
    try:
        # TODO: Connect to real railways database table
        # For now, return sample GeoJSON with a few railway lines in São Paulo
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-46.6333, -23.5505],  # São Paulo
                            [-47.0608, -22.9099]   # Campinas
                        ]
                    },
                    "properties": {
                        "id": "railway_1",
                        "name": "Linha São Paulo - Campinas",
                        "type": "Ferrovia Principal",
                        "operator": "Rumo Logística",
                        "status": "Ativa"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-46.6333, -23.5505],  # São Paulo
                            [-45.8872, -23.1790]   # São José dos Campos
                        ]
                    },
                    "properties": {
                        "id": "railway_2",
                        "name": "Linha São Paulo - Vale do Paraíba",
                        "type": "Ferrovia Regional",
                        "operator": "MRS Logística",
                        "status": "Ativa"
                    }
                }
            ],
            "metadata": {
                "total_features": 2,
                "source": "Sample data - Production will use real railway database",
                "note": "Dados de exemplo para demonstração"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching railways data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch railways data: {str(e)}")


@router.get("/pipelines/geojson")
async def get_pipelines_geojson() -> Dict[str, Any]:
    """
    Get pipeline network GeoJSON for São Paulo state

    Returns:
        GeoJSON FeatureCollection with gas/oil pipeline lines

    Note: Currently returns sample data. Will be connected to real database in future.
    """
    try:
        # TODO: Connect to real pipelines database table
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-46.6333, -23.5505],  # São Paulo
                            [-46.9844, -23.5489]   # Santos direction
                        ]
                    },
                    "properties": {
                        "id": "pipeline_1",
                        "name": "Gasoduto São Paulo - Santos",
                        "type": "Gasoduto de Gás Natural",
                        "diameter_mm": 600,
                        "operator": "TBG",
                        "capacity_m3_day": 5000000,
                        "status": "Operacional"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-47.0608, -22.9099],  # Campinas
                            [-47.8875, -21.7622]   # Ribeirão Preto direction
                        ]
                    },
                    "properties": {
                        "id": "pipeline_2",
                        "name": "Gasoduto Campinas - Interior",
                        "type": "Gasoduto de Distribuição",
                        "diameter_mm": 400,
                        "operator": "Comgás",
                        "capacity_m3_day": 2000000,
                        "status": "Operacional"
                    }
                }
            ],
            "metadata": {
                "total_features": 2,
                "source": "Sample data - Production will use real pipeline database",
                "note": "Dados de exemplo para demonstração"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching pipelines data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch pipelines data: {str(e)}")


@router.get("/substations/geojson")
async def get_substations_geojson() -> Dict[str, Any]:
    """
    Get electrical substations GeoJSON for São Paulo state

    Returns:
        GeoJSON FeatureCollection with substation points

    Note: Currently returns sample data. Will be connected to real database in future.
    """
    try:
        # TODO: Connect to real substations database table
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-46.6333, -23.5505]
                    },
                    "properties": {
                        "id": "substation_1",
                        "name": "Subestação Bandeirantes",
                        "voltage_kv": 440,
                        "capacity_mva": 1500,
                        "operator": "CTEEP",
                        "type": "Transmissão",
                        "status": "Operacional"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-47.0608, -22.9099]
                    },
                    "properties": {
                        "id": "substation_2",
                        "name": "Subestação Campinas",
                        "voltage_kv": 230,
                        "capacity_mva": 800,
                        "operator": "CPFL",
                        "type": "Distribuição",
                        "status": "Operacional"
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-45.8872, -23.1790]
                    },
                    "properties": {
                        "id": "substation_3",
                        "name": "Subestação Vale do Paraíba",
                        "voltage_kv": 138,
                        "capacity_mva": 500,
                        "operator": "EDP",
                        "type": "Distribuição",
                        "status": "Operacional"
                    }
                }
            ],
            "metadata": {
                "total_features": 3,
                "source": "Sample data - Production will use real substations database",
                "note": "Dados de exemplo para demonstração"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching substations data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch substations data: {str(e)}")


@router.get("/biogas-plants/geojson")
async def get_biogas_plants_geojson() -> Dict[str, Any]:
    """
    Get existing biogas plants GeoJSON for São Paulo state

    Returns:
        GeoJSON FeatureCollection with biogas plant points

    Note: Currently returns sample data. Will be connected to real database in future.
    """
    try:
        # TODO: Connect to real biogas plants database table
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-47.8875, -21.7622]
                    },
                    "properties": {
                        "id": "plant_1",
                        "name": "Usina de Biogás Ribeirão Preto",
                        "type": "Aterro Sanitário",
                        "capacity_m3_hour": 500,
                        "power_mw": 2.5,
                        "feedstock": "RSU (Resíduo Sólido Urbano)",
                        "status": "Operacional",
                        "commissioning_year": 2018
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-47.0608, -22.9099]
                    },
                    "properties": {
                        "id": "plant_2",
                        "name": "Usina de Biogás Campinas",
                        "type": "Agrícola",
                        "capacity_m3_hour": 300,
                        "power_mw": 1.5,
                        "feedstock": "Vinhaça de cana-de-açúcar",
                        "status": "Operacional",
                        "commissioning_year": 2020
                    }
                }
            ],
            "metadata": {
                "total_features": 2,
                "source": "Sample data - Production will use real biogas plants database",
                "note": "Dados de exemplo para demonstração"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching biogas plants data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch biogas plants data: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for infrastructure module"""
    return {
        "status": "healthy",
        "module": "infrastructure",
        "note": "Currently serving sample data"
    }
