"""
Municipalities API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter()

# Sample data (will be replaced with database queries)
SAMPLE_MUNICIPALITIES = [
    {
        "id": 1,
        "name": "São Paulo",
        "code": "3550308",
        "population": 12396372,
        "area_km2": 1521.11,
        "biogas_potential": 850.5,
        "coordinates": {
            "lat": -23.5505,
            "lng": -46.6333
        }
    },
    {
        "id": 2,
        "name": "Guarulhos",
        "code": "3518800",
        "population": 1393297,
        "area_km2": 318.68,
        "biogas_potential": 125.8,
        "coordinates": {
            "lat": -23.4538,
            "lng": -46.5333
        }
    },
    {
        "id": 3,
        "name": "Campinas",
        "code": "3509502",
        "population": 1213792,
        "area_km2": 794.43,
        "biogas_potential": 98.7,
        "coordinates": {
            "lat": -22.9056,
            "lng": -47.0608
        }
    }
]

@router.get("/")
async def get_municipalities(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None)
):
    """Get list of municipalities with optional filtering"""
    try:
        # Apply search filter if provided
        filtered_data = SAMPLE_MUNICIPALITIES
        if search:
            filtered_data = [
                m for m in SAMPLE_MUNICIPALITIES
                if search.lower() in m["name"].lower()
            ]

        # Apply pagination
        start = offset
        end = offset + limit
        paginated_data = filtered_data[start:end]

        return {
            "data": paginated_data,
            "total": len(filtered_data),
            "limit": limit,
            "offset": offset,
            "has_more": end < len(filtered_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching municipalities: {str(e)}")

@router.get("/{municipality_id}")
async def get_municipality(municipality_id: int):
    """Get specific municipality details"""
    try:
        municipality = next(
            (m for m in SAMPLE_MUNICIPALITIES if m["id"] == municipality_id),
            None
        )

        if not municipality:
            raise HTTPException(
                status_code=404,
                detail=f"Municipality with ID {municipality_id} not found"
            )

        return municipality
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching municipality: {str(e)}")

@router.get("/stats/summary")
async def get_municipalities_stats():
    """Get summary statistics for all municipalities"""
    try:
        total_municipalities = len(SAMPLE_MUNICIPALITIES)
        total_population = sum(m["population"] for m in SAMPLE_MUNICIPALITIES)
        total_area = sum(m["area_km2"] for m in SAMPLE_MUNICIPALITIES)
        total_biogas_potential = sum(m["biogas_potential"] for m in SAMPLE_MUNICIPALITIES)

        return {
            "total_municipalities": total_municipalities,
            "total_population": total_population,
            "total_area_km2": round(total_area, 2),
            "total_biogas_potential": round(total_biogas_potential, 2),
            "average_biogas_potential": round(total_biogas_potential / total_municipalities, 2),
            "timestamp": "2025-11-16T20:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")