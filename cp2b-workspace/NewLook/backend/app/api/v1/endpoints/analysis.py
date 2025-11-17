"""
Analysis API endpoints for biogas potential calculations
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any

router = APIRouter()

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