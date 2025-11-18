"""
Analysis API endpoints for biogas potential calculations
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from enum import Enum
from app.services.supabase_client import get_supabase_client

router = APIRouter()

# Residue category enum
class ResidueCategory(str, Enum):
    agricultural = "agricultural"
    livestock = "livestock"
    urban = "urban"

# Residue type mappings to database columns
RESIDUE_COLUMNS = {
    "agricultural": {
        "sugarcane": "sugarcane_biogas_m3_year",
        "soybean": "soybean_biogas_m3_year",
        "corn": "corn_biogas_m3_year",
        "coffee": "coffee_biogas_m3_year",
        "citrus": "citrus_biogas_m3_year",
        "_total": "agricultural_biogas_m3_year"
    },
    "livestock": {
        "cattle": "cattle_biogas_m3_year",
        "swine": "swine_biogas_m3_year",
        "poultry": "poultry_biogas_m3_year",
        "aquaculture": "aquaculture_biogas_m3_year",
        "_total": "livestock_biogas_m3_year"
    },
    "urban": {
        "rsu": "rsu_biogas_m3_year",
        "rpo": "rpo_biogas_m3_year",
        "_total": "urban_biogas_m3_year"
    }
}

# Labels for display
RESIDUE_LABELS = {
    "sugarcane": "Cana-de-açúcar",
    "soybean": "Soja",
    "corn": "Milho",
    "coffee": "Café",
    "citrus": "Citros",
    "cattle": "Bovinos",
    "swine": "Suínos",
    "poultry": "Aves",
    "aquaculture": "Piscicultura",
    "rsu": "RSU",
    "rpo": "Resíduos Orgânicos"
}

@router.get("/mcda")
async def get_mcda_analysis(
    municipality_ids: Optional[List[int]] = None,
    criteria_weights: Optional[Dict[str, float]] = None
):
    """Run Multi-Criteria Decision Analysis"""
    # Sample MCDA results
    sample_results = [
        {
            "municipality_id": 1,
            "municipality_name": "São Paulo",
            "mcda_score": 0.85,
            "ranking": 1,
            "criteria_scores": {
                "biomass_availability": 0.9,
                "transportation_cost": 0.7,
                "land_availability": 0.8,
                "grid_proximity": 0.95
            }
        },
        {
            "municipality_id": 2,
            "municipality_name": "Guarulhos",
            "mcda_score": 0.72,
            "ranking": 2,
            "criteria_scores": {
                "biomass_availability": 0.8,
                "transportation_cost": 0.6,
                "land_availability": 0.7,
                "grid_proximity": 0.8
            }
        }
    ]

    return {
        "results": sample_results,
        "criteria_weights": criteria_weights or {
            "biomass_availability": 0.3,
            "transportation_cost": 0.25,
            "land_availability": 0.25,
            "grid_proximity": 0.2
        },
        "total_analyzed": len(sample_results)
    }

@router.get("/proximity")
async def get_proximity_analysis():
    """Run proximity analysis for optimal locations"""
    return {
        "analysis": "proximity",
        "results": [
            {
                "location": {"lat": -23.5505, "lng": -46.6333},
                "proximity_score": 0.88,
                "nearby_facilities": 12,
                "transport_cost_index": 0.7
            }
        ]
    }

@router.post("/custom")
async def run_custom_analysis(analysis_config: Dict[str, Any]):
    """Run custom analysis with user-defined parameters"""
    return {
        "message": "Custom analysis completed",
        "config": analysis_config,
        "status": "success"
    }

@router.get("/by-residue")
async def get_analysis_by_residue(
    category: ResidueCategory = Query(..., description="Residue category"),
    residue_types: Optional[List[str]] = Query(default=None, description="Specific residue types to include"),
    limit: int = Query(default=20, le=100, description="Number of results"),
    min_value: float = Query(default=0, description="Minimum biogas value filter")
):
    """
    Get top municipalities by biogas potential for specific residue types.

    - **category**: agricultural, livestock, or urban
    - **residue_types**: specific residues to sum (if not provided, uses category total)
    - **limit**: number of results (max 100)
    - **min_value**: minimum biogas value to include
    """
    try:
        supabase = get_supabase_client()

        # Determine which columns to query
        category_columns = RESIDUE_COLUMNS.get(category.value, {})

        if residue_types:
            # Sum specific residue types
            columns_to_sum = [
                category_columns.get(rt)
                for rt in residue_types
                if rt in category_columns and rt != "_total"
            ]
            if not columns_to_sum:
                raise HTTPException(
                    status_code=400,
                    detail=f"No valid residue types provided for category {category.value}"
                )
        else:
            # Use the category total column
            columns_to_sum = [category_columns.get("_total")]

        # Build the select query
        select_fields = [
            "id",
            "municipality_name",
            "ibge_code",
            "administrative_region",
            "population",
            "area_km2"
        ]

        # Add residue columns
        for col in columns_to_sum:
            if col:
                select_fields.append(col)

        # Query Supabase
        query = supabase.table("municipalities").select(",".join(select_fields))

        # Execute query
        response = query.execute()

        if not response.data:
            return {
                "data": [],
                "total": 0,
                "category": category.value,
                "residue_types": residue_types or ["_total"]
            }

        # Process results - calculate sum if multiple columns
        results = []
        for row in response.data:
            total_biogas = 0
            for col in columns_to_sum:
                if col and row.get(col):
                    total_biogas += float(row.get(col, 0))

            if total_biogas >= min_value:
                results.append({
                    "id": row.get("id"),
                    "municipality_name": row.get("municipality_name"),
                    "ibge_code": row.get("ibge_code"),
                    "administrative_region": row.get("administrative_region"),
                    "population": row.get("population"),
                    "area_km2": row.get("area_km2"),
                    "biogas_m3_year": round(total_biogas, 2)
                })

        # Sort by biogas potential descending
        results.sort(key=lambda x: x["biogas_m3_year"], reverse=True)

        # Apply limit
        results = results[:limit]

        return {
            "data": results,
            "total": len(results),
            "category": category.value,
            "residue_types": residue_types or ["_total"],
            "columns_used": columns_to_sum
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching residue analysis: {str(e)}"
        )

@router.get("/statistics/by-category")
async def get_statistics_by_category():
    """
    Get summary statistics for each residue category.
    Returns total, average, min, max for agricultural, livestock, and urban sectors.
    """
    try:
        supabase = get_supabase_client()

        # Get all category totals
        response = supabase.table("municipalities").select(
            "agricultural_biogas_m3_year,livestock_biogas_m3_year,urban_biogas_m3_year,total_biogas_m3_year"
        ).execute()

        if not response.data:
            return {"categories": {}, "total_municipalities": 0}

        # Calculate statistics for each category
        categories = {
            "agricultural": [],
            "livestock": [],
            "urban": [],
            "total": []
        }

        for row in response.data:
            if row.get("agricultural_biogas_m3_year"):
                categories["agricultural"].append(float(row["agricultural_biogas_m3_year"]))
            if row.get("livestock_biogas_m3_year"):
                categories["livestock"].append(float(row["livestock_biogas_m3_year"]))
            if row.get("urban_biogas_m3_year"):
                categories["urban"].append(float(row["urban_biogas_m3_year"]))
            if row.get("total_biogas_m3_year"):
                categories["total"].append(float(row["total_biogas_m3_year"]))

        # Calculate stats
        stats = {}
        for cat_name, values in categories.items():
            if values:
                stats[cat_name] = {
                    "total": round(sum(values), 2),
                    "average": round(sum(values) / len(values), 2),
                    "min": round(min(values), 2),
                    "max": round(max(values), 2),
                    "count": len([v for v in values if v > 0])
                }
            else:
                stats[cat_name] = {
                    "total": 0,
                    "average": 0,
                    "min": 0,
                    "max": 0,
                    "count": 0
                }

        return {
            "categories": stats,
            "total_municipalities": len(response.data)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching category statistics: {str(e)}"
        )

@router.get("/statistics/by-region")
async def get_statistics_by_region(
    category: Optional[ResidueCategory] = Query(default=None, description="Filter by residue category")
):
    """
    Get biogas potential aggregated by administrative region.
    Used for pie charts showing regional distribution.
    """
    try:
        supabase = get_supabase_client()

        # Determine which column to use
        if category:
            column = RESIDUE_COLUMNS[category.value]["_total"]
        else:
            column = "total_biogas_m3_year"

        # Get data grouped by region
        response = supabase.table("municipalities").select(
            f"administrative_region,{column}"
        ).execute()

        if not response.data:
            return {"regions": [], "total": 0}

        # Aggregate by region
        region_totals: Dict[str, float] = {}
        for row in response.data:
            region = row.get("administrative_region") or "Não definido"
            value = float(row.get(column, 0) or 0)
            region_totals[region] = region_totals.get(region, 0) + value

        # Convert to list and sort
        regions = [
            {"region": k, "biogas_m3_year": round(v, 2)}
            for k, v in region_totals.items()
        ]
        regions.sort(key=lambda x: x["biogas_m3_year"], reverse=True)

        total = sum(r["biogas_m3_year"] for r in regions)

        # Calculate percentages
        for r in regions:
            r["percentage"] = round((r["biogas_m3_year"] / total * 100) if total > 0 else 0, 2)

        return {
            "regions": regions,
            "total": round(total, 2),
            "category": category.value if category else "total"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching regional statistics: {str(e)}"
        )

@router.get("/distribution")
async def get_distribution(
    category: Optional[ResidueCategory] = Query(default=None, description="Filter by residue category"),
    bins: int = Query(default=10, ge=5, le=50, description="Number of histogram bins")
):
    """
    Get distribution data for histogram visualization.
    Returns bin ranges and counts for biogas potential values.
    """
    try:
        supabase = get_supabase_client()

        # Determine which column to use
        if category:
            column = RESIDUE_COLUMNS[category.value]["_total"]
        else:
            column = "total_biogas_m3_year"

        # Get all values
        response = supabase.table("municipalities").select(
            f"municipality_name,{column}"
        ).execute()

        if not response.data:
            return {"histogram": [], "statistics": {}}

        # Extract non-zero values
        values = [
            float(row.get(column, 0) or 0)
            for row in response.data
            if float(row.get(column, 0) or 0) > 0
        ]

        if not values:
            return {"histogram": [], "statistics": {}}

        # Calculate histogram bins
        min_val = min(values)
        max_val = max(values)
        bin_width = (max_val - min_val) / bins

        histogram = []
        for i in range(bins):
            bin_start = min_val + (i * bin_width)
            bin_end = min_val + ((i + 1) * bin_width)
            count = len([v for v in values if bin_start <= v < bin_end])

            # Include max value in last bin
            if i == bins - 1:
                count = len([v for v in values if bin_start <= v <= bin_end])

            histogram.append({
                "bin_start": round(bin_start, 2),
                "bin_end": round(bin_end, 2),
                "count": count,
                "label": f"{round(bin_start/1000000, 2)}-{round(bin_end/1000000, 2)}M"
            })

        # Calculate basic statistics
        sorted_values = sorted(values)
        n = len(values)

        statistics = {
            "count": n,
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "mean": round(sum(values) / n, 2),
            "median": round(sorted_values[n // 2], 2),
            "std": round((sum((v - sum(values)/n)**2 for v in values) / n) ** 0.5, 2)
        }

        return {
            "histogram": histogram,
            "statistics": statistics,
            "category": category.value if category else "total"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating distribution: {str(e)}"
        )

@router.get("/residue-config")
async def get_residue_config():
    """
    Get the configuration for residue types and categories.
    Used by frontend to populate selectors.
    """
    return {
        "categories": {
            "agricultural": {
                "label": "Agrícola",
                "icon": "Wheat",
                "residues": [
                    {"key": "sugarcane", "label": "Cana-de-açúcar", "column": "sugarcane_biogas_m3_year"},
                    {"key": "soybean", "label": "Soja", "column": "soybean_biogas_m3_year"},
                    {"key": "corn", "label": "Milho", "column": "corn_biogas_m3_year"},
                    {"key": "coffee", "label": "Café", "column": "coffee_biogas_m3_year"},
                    {"key": "citrus", "label": "Citros", "column": "citrus_biogas_m3_year"}
                ]
            },
            "livestock": {
                "label": "Pecuário",
                "icon": "Beef",
                "residues": [
                    {"key": "cattle", "label": "Bovinos", "column": "cattle_biogas_m3_year"},
                    {"key": "swine", "label": "Suínos", "column": "swine_biogas_m3_year"},
                    {"key": "poultry", "label": "Aves", "column": "poultry_biogas_m3_year"},
                    {"key": "aquaculture", "label": "Piscicultura", "column": "aquaculture_biogas_m3_year"}
                ]
            },
            "urban": {
                "label": "Urbano",
                "icon": "Building2",
                "residues": [
                    {"key": "rsu", "label": "RSU (Resíduos Sólidos)", "column": "rsu_biogas_m3_year"},
                    {"key": "rpo", "label": "Resíduos Orgânicos", "column": "rpo_biogas_m3_year"}
                ]
            }
        }
    }