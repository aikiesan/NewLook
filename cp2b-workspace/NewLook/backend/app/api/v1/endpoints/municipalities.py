"""
Municipalities API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.supabase_client import get_supabase_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
async def get_municipalities(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None)
):
    """Get list of municipalities with optional filtering"""
    try:
        supabase = get_supabase_client()

        # Build query
        query = supabase.table("municipios").select("*")

        # Apply search filter if provided
        if search:
            query = query.ilike("nm_mun", f"%{search}%")

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        # Execute query
        result = query.execute()

        # Get total count
        count_result = supabase.table("municipios").select("cd_mun", count="exact").execute()
        total = count_result.count if count_result.count else len(result.data)

        return {
            "data": result.data,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    except Exception as e:
        logger.error(f"Error fetching municipalities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching municipalities: {str(e)}")

@router.get("/{municipality_id}")
async def get_municipality(municipality_id: str):
    """Get specific municipality details by IBGE code (cd_mun)"""
    try:
        supabase = get_supabase_client()

        # Query by IBGE code (cd_mun)
        result = supabase.table("municipios").select("*").eq("cd_mun", municipality_id).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Municipality with code {municipality_id} not found"
            )

        municipality = result.data[0]

        # Also fetch biomass data for this municipality
        try:
            biomass_result = supabase.table("biomassa_municipal").select("*").eq("cd_mun", municipality_id).execute()
            if biomass_result.data and len(biomass_result.data) > 0:
                municipality["biomass_data"] = biomass_result.data[0]
        except Exception as e:
            logger.warning(f"Could not fetch biomass data: {str(e)}")

        return municipality

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching municipality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching municipality: {str(e)}")

@router.get("/stats/summary")
async def get_municipalities_stats():
    """Get summary statistics for all municipalities"""
    try:
        supabase = get_supabase_client()

        # Get count of municipalities
        count_result = supabase.table("municipios").select("cd_mun", count="exact").execute()
        total_municipalities = count_result.count if count_result.count else 0

        # Get aggregated stats
        stats_result = supabase.table("municipios").select("populacao_2022, area_km2").execute()

        total_population = 0
        total_area = 0.0

        if stats_result.data:
            for m in stats_result.data:
                if m.get("populacao_2022"):
                    total_population += m["populacao_2022"]
                if m.get("area_km2"):
                    total_area += float(m["area_km2"]) if m["area_km2"] else 0

        return {
            "total_municipalities": total_municipalities,
            "total_population": total_population,
            "total_area_km2": round(total_area, 2),
            "timestamp": "2025-11-19T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error calculating stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")
