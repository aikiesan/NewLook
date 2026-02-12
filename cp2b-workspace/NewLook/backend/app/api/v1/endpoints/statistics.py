"""
PILAR-2b V3 - Statistics API Endpoint
Provides summary statistics for municipalities and biogas potential
"""

from fastapi import APIRouter, HTTPException, Depends
import logging
from typing import Dict, Any

from app.core.database import get_db
from app.middleware.auth import require_authenticated
from app.models.auth import UserProfile

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/summary",
    summary="Get Summary Statistics",
    description="Get summary statistics for all municipalities including biogas potential"
)
async def get_summary_statistics() -> Dict[str, Any]:
    """
    Get summary statistics for the entire dataset.

    Returns:
        Dictionary with total municipalities, biogas potential, and category breakdowns
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get overall statistics
            cursor.execute("""
                SELECT
                    COUNT(*) as total_municipalities,
                    COALESCE(SUM(total_biogas_m3_year), 0) as total_biogas,
                    COALESCE(SUM(energy_potential_mwh_year), 0) as total_energy,
                    COALESCE(SUM(co2_reduction_tons_year), 0) as total_co2_reduction,
                    COALESCE(SUM(population), 0) as total_population,
                    COALESCE(SUM(urban_biogas_m3_year), 0) as total_urban,
                    COALESCE(SUM(agricultural_biogas_m3_year), 0) as total_agricultural,
                    COALESCE(SUM(livestock_biogas_m3_year), 0) as total_livestock,
                    COALESCE(AVG(total_biogas_m3_year), 0) as avg_biogas,
                    COALESCE(COUNT(*) FILTER (WHERE total_biogas_m3_year > 0), 0) as municipalities_with_data
                FROM municipalities
            """)
            
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(status_code=500, detail="Failed to fetch statistics")
            
            total_municipalities = int(row["total_municipalities"] or 0)
            total_biogas = float(row["total_biogas"] or 0)
            total_energy = float(row["total_energy"] or 0)
            total_co2_reduction = float(row["total_co2_reduction"] or 0)
            total_population = int(row["total_population"] or 0)
            total_urban = float(row["total_urban"] or 0)
            total_agricultural = float(row["total_agricultural"] or 0)
            total_livestock = float(row["total_livestock"] or 0)
            avg_biogas = float(row["avg_biogas"] or 0)
            municipalities_with_data = int(row["municipalities_with_data"] or 0)
            
            # Calculate percentages
            urban_percent = (total_urban / total_biogas * 100) if total_biogas > 0 else 0
            agricultural_percent = (total_agricultural / total_biogas * 100) if total_biogas > 0 else 0
            livestock_percent = (total_livestock / total_biogas * 100) if total_biogas > 0 else 0
            
            cursor.close()
            
            return {
                "total_municipalities": total_municipalities,
                "municipalities_with_biogas_data": municipalities_with_data,
                "total_biogas_m3_year": round(total_biogas, 2),
                "total_energy_mwh_year": round(total_energy, 2),
                "total_co2_reduction_tons_year": round(total_co2_reduction, 2),
                "total_population": total_population,
                "average_biogas_m3_year": round(avg_biogas, 2),
                "by_category": {
                    "urban": {
                        "total_m3_year": round(total_urban, 2),
                        "percentage": round(urban_percent, 2)
                    },
                    "agricultural": {
                        "total_m3_year": round(total_agricultural, 2),
                        "percentage": round(agricultural_percent, 2)
                    },
                    "livestock": {
                        "total_m3_year": round(total_livestock, 2),
                        "percentage": round(livestock_percent, 2)
                    }
                },
                "metadata": {
                    "source": "Supabase PostgreSQL Database",
                    "note": "Statistics for São Paulo State municipalities"
                }
            }
            
    except Exception as e:
        logger.error(f"Failed to fetch summary statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch summary statistics: {str(e)}"
        )


@router.get(
    "/category/{category}",
    summary="Get Category Statistics",
    description="Get detailed statistics for a specific biogas category (requires authentication)"
)
async def get_category_statistics(
    category: str,
    current_user: UserProfile = Depends(require_authenticated)
) -> Dict[str, Any]:
    """
    Get statistics for a specific biogas category (requires authentication).

    Args:
        category: One of 'urban', 'agricultural', 'livestock'

    Returns:
        Dictionary with category-specific statistics
    """
    # Map category to database column
    category_columns = {
        "urban": "urban_biogas_m3_year",
        "agricultural": "agricultural_biogas_m3_year",
        "livestock": "livestock_biogas_m3_year"
    }
    
    if category not in category_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(category_columns.keys())}"
        )
    
    column_name = category_columns[category]
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            query = f"""
                SELECT
                    COUNT(*) FILTER (WHERE {column_name} > 0) as municipalities_count,
                    COALESCE(SUM({column_name}), 0) as total_biogas,
                    COALESCE(AVG({column_name}), 0) as avg_biogas,
                    COALESCE(MAX({column_name}), 0) as max_biogas,
                    COALESCE(MIN({column_name}) FILTER (WHERE {column_name} > 0), 0) as min_biogas
                FROM municipalities
            """
            
            cursor.execute(query)
            row = cursor.fetchone()
            cursor.close()
            
            if not row:
                raise HTTPException(status_code=500, detail="Failed to fetch category statistics")
            
            return {
                "category": category,
                "municipalities_with_data": int(row["municipalities_count"] or 0),
                "total_m3_year": round(float(row["total_biogas"] or 0), 2),
                "average_m3_year": round(float(row["avg_biogas"] or 0), 2),
                "max_m3_year": round(float(row["max_biogas"] or 0), 2),
                "min_m3_year": round(float(row["min_biogas"] or 0), 2)
            }
            
    except Exception as e:
        logger.error(f"Failed to fetch category statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch category statistics: {str(e)}"
        )

