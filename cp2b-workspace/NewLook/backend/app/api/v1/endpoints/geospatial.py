"""
Geospatial API Endpoints
Serve PostGIS data for interactive maps and spatial analysis
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import json
import logging
import psycopg2

from app.core.database import get_db
from app.middleware.auth import get_current_user, optional_auth
from app.models.auth import UserProfile

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# SECURITY: Input Validation Constants
# ============================================================================

# Valid administrative regions for São Paulo state
VALID_REGIONS = {
    "Central", "Bauru", "Araçatuba", "Ribeirão Preto",
    "Campinas", "São José dos Campos", "Sorocaba",
    "Santos", "São Paulo", "Presidente Prudente",
    "Marília", "Registro", "Franca", "São José do Rio Preto"
}

# Whitelist for sort columns (prevents SQL injection)
ALLOWED_SORT_COLUMNS = {
    "biogas": "total_biogas_m3_year",
    "name": "municipality_name",
    "population": "population",
    "area": "area_km2"
}

# Whitelist for sort order (prevents SQL injection)
ALLOWED_ORDERS = {"asc": "ASC", "desc": "DESC"}

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class GeoJSONFeature(BaseModel):
    """Single GeoJSON feature"""
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    """GeoJSON Feature Collection"""
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class MunicipalityBasic(BaseModel):
    """Basic municipality information"""
    id: int
    municipality_name: str
    total_biogas_m3_year: float
    energy_potential_mwh_year: float
    ranking: Optional[int] = None


class MunicipalityDetail(BaseModel):
    """Detailed municipality information"""
    id: int
    municipality_name: str
    ibge_code: Optional[str]

    # Biogas potential
    total_biogas_m3_year: float
    total_biogas_m3_day: float
    urban_biogas_m3_year: float
    agricultural_biogas_m3_year: float
    livestock_biogas_m3_year: float

    # Energy and environmental
    energy_potential_kwh_day: float
    energy_potential_mwh_year: float
    co2_reduction_tons_year: float

    # Population
    population: Optional[int]
    urban_population: Optional[int]
    rural_population: Optional[int]

    # Location
    centroid: Optional[Dict[str, Any]] = None
    administrative_region: Optional[str]


class ProximityQuery(BaseModel):
    """Proximity analysis request"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(..., gt=0, le=500)


class MapBounds(BaseModel):
    """Map bounding box"""
    min_lat: float
    min_lng: float
    max_lat: float
    max_lng: float


# ============================================================================
# GEOJSON ENDPOINTS
# ============================================================================

@router.get(
    "/municipalities/geojson",
    response_model=GeoJSONFeatureCollection,
    summary="Get municipalities as GeoJSON",
    description="Returns all municipalities with boundaries and biogas data as GeoJSON FeatureCollection"
)
async def get_municipalities_geojson(
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Limit number of features"),
    min_biogas: Optional[float] = Query(None, ge=0, description="Minimum biogas potential (m³/year)"),
    region: Optional[str] = Query(None, description="Filter by administrative region"),
    current_user: Optional[UserProfile] = Depends(optional_auth)
):
    """
    Get municipalities as GeoJSON FeatureCollection

    Returns polygon geometries with biogas potential data as properties.
    Suitable for rendering choropleth maps.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            # Build query
            query = """
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', jsonb_agg(feature)
            ) as geojson
            FROM (
                SELECT jsonb_build_object(
                    'type', 'Feature',
                    'id', id,
                    'geometry', ST_AsGeoJSON(
                        COALESCE(geometry, ST_Buffer(centroid::geography, 5000)::geometry)
                    )::jsonb,
                    'properties', jsonb_build_object(
                        'id', id,
                        'name', municipality_name,
                        'ibge_code', ibge_code,
                        'total_biogas', ROUND(total_biogas_m3_year::numeric, 2),
                        'urban_biogas', ROUND(urban_biogas_m3_year::numeric, 2),
                        'agricultural_biogas', ROUND(agricultural_biogas_m3_year::numeric, 2),
                        'livestock_biogas', ROUND(livestock_biogas_m3_year::numeric, 2),
                        'energy_mwh_year', ROUND(energy_potential_mwh_year::numeric, 2),
                        'co2_reduction', ROUND(co2_reduction_tons_year::numeric, 2),
                        'population', population,
                        'region', administrative_region
                    )
                ) as feature
                FROM municipalities
                WHERE 1=1
        """

            params = []

            if min_biogas is not None:
                query += " AND total_biogas_m3_year >= %s"
                params.append(min_biogas)

            if region:
                # SECURITY: Validate region against whitelist
                if region not in VALID_REGIONS:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid region. Must be one of: {', '.join(sorted(VALID_REGIONS))}"
                    )
                query += " AND administrative_region = %s"
                params.append(region)

            query += " ORDER BY total_biogas_m3_year DESC"

            # SECURITY: Use parameterized query for LIMIT instead of f-string
            if limit:
                query += " LIMIT %s"
                params.append(limit)

            query += " ) as features"

            cursor.execute(query, params)
            result = cursor.fetchone()

            if not result or not result.get('geojson'):
                return GeoJSONFeatureCollection(type="FeatureCollection", features=[])

            return result['geojson']

        except psycopg2.Error as e:
            logger.error(f"Database error in get_municipalities_geojson: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


@router.get(
    "/municipalities/centroids",
    response_model=GeoJSONFeatureCollection,
    summary="Get municipality centroids",
    description="Returns municipality center points (faster than full polygons)"
)
async def get_municipality_centroids(
    limit: Optional[int] = Query(None, ge=1, le=1000),
    min_biogas: Optional[float] = Query(None, ge=0)
):
    """
    Get municipality centroids as GeoJSON points

    Faster alternative to full polygons for initial map rendering.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            query = """
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(feature)
                ) as geojson
                FROM (
                    SELECT jsonb_build_object(
                        'type', 'Feature',
                        'id', id,
                        'geometry', ST_AsGeoJSON(centroid)::jsonb,
                        'properties', jsonb_build_object(
                            'id', id,
                            'name', municipality_name,
                            'biogas', ROUND(total_biogas_m3_year::numeric, 2)
                        )
                    ) as feature
                    FROM municipalities
                    WHERE centroid IS NOT NULL
            """

            params = []

            if min_biogas is not None:
                query += " AND total_biogas_m3_year >= %s"
                params.append(min_biogas)

            query += " ORDER BY total_biogas_m3_year DESC"

            # SECURITY: Use parameterized query for LIMIT
            if limit:
                query += " LIMIT %s"
                params.append(limit)

            query += " ) as features"

            cursor.execute(query, params)
            result = cursor.fetchone()

            return result['geojson'] if result and result.get('geojson') else {"type": "FeatureCollection", "features": []}

        except psycopg2.Error as e:
            logger.error(f"Database error in get_municipality_centroids: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


# ============================================================================
# MUNICIPALITY DATA ENDPOINTS
# ============================================================================

@router.get(
    "/municipalities",
    response_model=List[MunicipalityBasic],
    summary="List municipalities",
    description="Get basic information for all municipalities"
)
async def list_municipalities(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("biogas", enum=["biogas", "name", "population"]),
    order: str = Query("desc", enum=["asc", "desc"])
):
    """
    List municipalities with pagination
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            # SECURITY: Validate sort parameters against whitelist
            sort_column = ALLOWED_SORT_COLUMNS.get(sort_by, "total_biogas_m3_year")
            order_sql = ALLOWED_ORDERS.get(order.lower(), "DESC")

            # SECURITY: Use validated values in SQL (safe since from whitelist)
            query = f"""
                SELECT
                    id,
                    municipality_name,
                    total_biogas_m3_year,
                    energy_potential_mwh_year,
                    ROW_NUMBER() OVER (ORDER BY total_biogas_m3_year DESC) as ranking
                FROM municipalities
                WHERE total_biogas_m3_year > 0
                ORDER BY {sort_column} {order_sql}
                LIMIT %s OFFSET %s
            """

            cursor.execute(query, (limit, offset))
            rows = cursor.fetchall()

            return [
                MunicipalityBasic(
                    id=row['id'],
                    municipality_name=row['municipality_name'],
                    total_biogas_m3_year=row['total_biogas_m3_year'],
                    energy_potential_mwh_year=row['energy_potential_mwh_year'],
                    ranking=row['ranking']
                )
                for row in rows
            ]

        except psycopg2.Error as e:
            logger.error(f"Database error in list_municipalities: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


@router.get(
    "/municipalities/{municipality_id}",
    response_model=MunicipalityDetail,
    summary="Get municipality details",
    description="Get detailed information for a specific municipality"
)
async def get_municipality(municipality_id: int):
    """
    Get detailed information for a single municipality
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            query = """
                SELECT
                    id, municipality_name, ibge_code,
                    total_biogas_m3_year, total_biogas_m3_day,
                    urban_biogas_m3_year, agricultural_biogas_m3_year, livestock_biogas_m3_year,
                    energy_potential_kwh_day, energy_potential_mwh_year, co2_reduction_tons_year,
                    population, urban_population, rural_population,
                    ST_AsGeoJSON(centroid)::json as centroid,
                    administrative_region
                FROM municipalities
                WHERE id = %s
            """

            cursor.execute(query, (municipality_id,))
            row = cursor.fetchone()

            if not row:
                raise HTTPException(status_code=404, detail="Municipality not found")

            return MunicipalityDetail(
                id=row['id'],
                municipality_name=row['municipality_name'],
                ibge_code=row['ibge_code'],
                total_biogas_m3_year=row['total_biogas_m3_year'],
                total_biogas_m3_day=row['total_biogas_m3_day'],
                urban_biogas_m3_year=row['urban_biogas_m3_year'],
                agricultural_biogas_m3_year=row['agricultural_biogas_m3_year'],
                livestock_biogas_m3_year=row['livestock_biogas_m3_year'],
                energy_potential_kwh_day=row['energy_potential_kwh_day'],
                energy_potential_mwh_year=row['energy_potential_mwh_year'],
                co2_reduction_tons_year=row['co2_reduction_tons_year'],
                population=row['population'],
                urban_population=row['urban_population'],
                rural_population=row['rural_population'],
                centroid=row['centroid'],
                administrative_region=row['administrative_region']
            )

        except HTTPException:
            raise
        except psycopg2.Error as e:
            logger.error(f"Database error in get_municipality: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


# ============================================================================
# SPATIAL ANALYSIS ENDPOINTS
# ============================================================================

@router.post(
    "/proximity",
    summary="Proximity analysis",
    description="Find municipalities within radius of a point"
)
async def proximity_analysis(query: ProximityQuery):
    """
    Find municipalities within specified radius of a point

    Returns municipalities sorted by distance.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            # Use the helper function we created in schema
            sql = """
                SELECT * FROM municipalities_within_radius(%s, %s, %s)
            """

            cursor.execute(sql, (query.latitude, query.longitude, query.radius_km))
            rows = cursor.fetchall()

            return {
                "query": {
                    "latitude": query.latitude,
                    "longitude": query.longitude,
                    "radius_km": query.radius_km
                },
                "results": [
                    {
                        "municipality_id": row['municipality_id'],
                        "municipality_name": row['municipality_name'],
                        "distance_km": float(row['distance_km'])
                    }
                    for row in rows
                ],
                "total_found": len(rows)
            }

        except psycopg2.Error as e:
            logger.error(f"Database error in proximity_analysis: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


@router.get(
    "/rankings",
    summary="Municipality rankings",
    description="Get ranked municipalities by different criteria"
)
async def get_rankings(
    criteria: str = Query("total", enum=["total", "urban", "agricultural", "livestock"]),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get top municipalities ranked by biogas potential
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            # SECURITY: Validate criteria against whitelist
            column_map = {
                "total": "total_biogas_m3_year",
                "urban": "urban_biogas_m3_year",
                "agricultural": "agricultural_biogas_m3_year",
                "livestock": "livestock_biogas_m3_year"
            }

            # Get validated column (safe since from whitelist)
            column = column_map.get(criteria, "total_biogas_m3_year")

            # SECURITY: Use validated column name in SQL (safe since from whitelist)
            query = f"""
                SELECT
                    municipality_name,
                    {column} as biogas_potential,
                    energy_potential_mwh_year,
                    ROW_NUMBER() OVER (ORDER BY {column} DESC) as ranking
                FROM municipalities
                WHERE {column} > 0
                ORDER BY {column} DESC
                LIMIT %s
            """

            cursor.execute(query, (limit,))
            rows = cursor.fetchall()

            return {
                "criteria": criteria,
                "rankings": [
                    {
                        "rank": row['ranking'],
                        "municipality": row['municipality_name'],
                        "biogas_m3_year": float(row['biogas_potential']),
                        "energy_mwh_year": float(row['energy_potential_mwh_year'])
                    }
                    for row in rows
                ]
            }

        except psycopg2.Error as e:
            logger.error(f"Database error in get_rankings: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


@router.get(
    "/statistics/summary",
    summary="Overall statistics",
    description="Get summary statistics for all municipalities"
)
async def get_summary_statistics():
    """
    Get overall statistics for the platform
    """
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            # Get overall statistics
            query_stats = """
                SELECT
                    COUNT(*) as total_municipalities,
                    SUM(total_biogas_m3_year) as total_biogas_potential,
                    AVG(total_biogas_m3_year) as avg_biogas_potential,
                    SUM(energy_potential_mwh_year) as total_energy_potential,
                    SUM(co2_reduction_tons_year) as total_co2_reduction,
                    SUM(population) as total_population,
                    SUM(agricultural_biogas_m3_year) as total_agricultural,
                    SUM(livestock_biogas_m3_year) as total_livestock,
                    SUM(urban_biogas_m3_year) as total_urban
                FROM municipalities
            """

            cursor.execute(query_stats)
            row = cursor.fetchone()

            total_biogas = float(row['total_biogas_potential'] or 0)
            total_agricultural = float(row['total_agricultural'] or 0)
            total_livestock = float(row['total_livestock'] or 0)
            total_urban = float(row['total_urban'] or 0)

            # Get top 5 municipalities
            query_top = """
                SELECT municipality_name, total_biogas_m3_year
                FROM municipalities
                WHERE total_biogas_m3_year > 0
                ORDER BY total_biogas_m3_year DESC
                LIMIT 5
            """
            cursor.execute(query_top)
            top_municipalities = cursor.fetchall()

            return {
                "total_municipalities": row['total_municipalities'],
                "total_biogas_m3_year": total_biogas,
                "average_biogas_m3_year": float(row['avg_biogas_potential'] or 0),
                "total_energy_mwh_year": float(row['total_energy_potential'] or 0),
                "total_co2_reduction_tons_year": float(row['total_co2_reduction'] or 0),
                "total_population": row['total_population'] or 0,
                "top_municipality": {
                    "name": top_municipalities[0]['municipality_name'] if top_municipalities else "N/A",
                    "biogas_m3_year": float(top_municipalities[0]['total_biogas_m3_year']) if top_municipalities else 0
                },
                "top_5_municipalities": [
                    {
                        "name": m['municipality_name'],
                        "biogas_m3_year": float(m['total_biogas_m3_year'])
                    }
                    for m in top_municipalities
                ],
                "categories": {},  # Can be expanded later
                "sector_breakdown": {
                    "agricultural": total_agricultural,
                    "livestock": total_livestock,
                    "urban": total_urban
                },
                "sector_percentages": {
                    "agricultural": round((total_agricultural / total_biogas * 100) if total_biogas > 0 else 0, 2),
                    "livestock": round((total_livestock / total_biogas * 100) if total_biogas > 0 else 0, 2),
                    "urban": round((total_urban / total_biogas * 100) if total_biogas > 0 else 0, 2)
                },
                "note": f"Dados de {row['total_municipalities']} municípios do estado de São Paulo"
            }

        except psycopg2.Error as e:
            logger.error(f"Database error in get_summary_statistics: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()


# ============================================================================
# INFRASTRUCTURE LAYERS
# ============================================================================

@router.get(
    "/infrastructure/biogas-plants",
    response_model=GeoJSONFeatureCollection,
    summary="Get biogas plants",
    description="Returns existing biogas plants as GeoJSON points"
)
async def get_biogas_plants():
    """Get existing biogas plants"""
    with get_db() as conn:
        cursor = conn.cursor()

        try:
            query = """
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(feature)
                ) as geojson
                FROM (
                    SELECT jsonb_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON(location)::jsonb,
                        'properties', jsonb_build_object(
                            'name', plant_name,
                            'type', plant_type,
                            'status', status,
                            'capacity', installed_capacity_m3_day
                        )
                    ) as feature
                    FROM biogas_plants
                    WHERE location IS NOT NULL
                ) as features
            """

            cursor.execute(query)
            result = cursor.fetchone()

            return result['geojson'] if result and result.get('geojson') else {"type": "FeatureCollection", "features": []}

        except psycopg2.Error as e:
            logger.error(f"Database error in get_biogas_plants: {e}")
            raise HTTPException(status_code=500, detail="Database query failed")
        finally:
            cursor.close()
