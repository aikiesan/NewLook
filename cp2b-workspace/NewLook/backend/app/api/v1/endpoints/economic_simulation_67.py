"""
CP2B Maps V3 - Economic Simulation API Endpoints (67-Sector IBGE Model)
RESTful API for Leontief Input-Output economic shock analysis using IBGE official data

Endpoints:
- GET  /api/v1/simulation/sectors-67 - List all 67 IBGE sectors
- GET  /api/v1/simulation/multipliers-67 - Get output multipliers for 67 sectors
- GET  /api/v1/simulation/sector-mapping-67 - Get 67→4 sector aggregation mapping
- POST /api/v1/simulation/shock-67 - Execute 67-sector economic shock simulation

Author: CP2B Development Team
Date: 2026-01-30
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Optional

from app.schemas.economic_simulation import (
    ShockSimulationRequest67,
    ShockSimulationResponse67,
    SectorsListResponse67,
    MultipliersResponse67,
    SectorAggregationMappingResponse,
    ErrorDetail
)
from app.services.economic_simulation_orchestrator_67 import (
    get_orchestrator_67,
    EconomicSimulationOrchestrator67
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    tags=["Economic Simulation (67-Sector IBGE Model)"],
    responses={
        500: {"model": ErrorDetail, "description": "Internal Server Error"},
        400: {"model": ErrorDetail, "description": "Bad Request"}
    }
)


# ============================================================================
# ENDPOINT 1: GET ALL 67 SECTORS
# ============================================================================

@router.get(
    "/sectors-67",
    response_model=SectorsListResponse67,
    summary="Get all 67 IBGE sectors",
    description="""
    Retrieve all 67 IBGE economic sectors with metadata.

    Returns sector information including:
    - Sector ID (1-67)
    - IBGE sector code
    - Full sector name
    - Data reference year (2015)

    **Use case**: Display sectors for user selection in simulation.

    **Data source**: IBGE Input-Output Matrix 2015
    """,
    response_description="List of 67 IBGE sectors"
)
async def get_sectors_67(
    orchestrator: EconomicSimulationOrchestrator67 = Depends(get_orchestrator_67)
):
    """
    Get all 67 IBGE economic sectors with metadata.

    Example response:
    ```json
    {
        "sectors": [
            {
                "sector_id": 1,
                "sector_code": "0191",
                "sector_name": "Agricultura, inclusive o apoio à agricultura e a pós-colheita",
                "data_year": 2015
            }
        ],
        "total_sectors": 67
    }
    ```
    """
    try:
        logger.info("GET /simulation/sectors-67 - Fetching all 67 IBGE sectors")

        # Get sectors from orchestrator
        sectors = orchestrator.get_all_sectors()

        response = SectorsListResponse67(
            sectors=sectors,
            total_sectors=len(sectors)
        )

        logger.info(f"✅ Returned {len(sectors)} sectors")
        return response

    except Exception as e:
        logger.error(f"❌ Error fetching sectors: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch sectors",
                "code": "SECTORS_FETCH_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# ENDPOINT 2: GET OUTPUT MULTIPLIERS
# ============================================================================

@router.get(
    "/multipliers-67",
    response_model=MultipliersResponse67,
    summary="Get economic multipliers for 67 sectors",
    description="""
    Retrieve output multipliers for all 67 IBGE sectors.

    **Output Multiplier**: Total economic output generated per BRL invested in each sector.

    **Top Sectors by Multiplier** (IBGE 2015):
    1. Meat & Dairy (Sector 8): 2.511×
    2. Petroleum Refining (Sector 19): 2.484×
    3. Sugar Refining (Sector 9): 2.409×
    4. Biofuels (Sector 20): 2.379×
    5. Food Products (Sector 10): 2.356×

    **Use case**:
    - Identify high-impact sectors for investment
    - Compare sectoral economic efficiency
    - Plan industrial policy

    **Data source**: IBGE Input-Output Matrix 2015
    """,
    response_description="Output multipliers for all 67 sectors"
)
async def get_multipliers_67(
    top_n: Optional[int] = 20,
    orchestrator: EconomicSimulationOrchestrator67 = Depends(get_orchestrator_67)
):
    """
    Get economic output multipliers for all 67 sectors.

    Args:
        top_n: Number of top sectors to return (default: 20)

    Example response:
    ```json
    {
        "multipliers": [...],  // All 67 sectors
        "top_multipliers": [   // Top 20 by multiplier
            {
                "sector_id": 8,
                "sector_code": "1091",
                "sector_name": "Abate e produtos de carne",
                "output_multiplier": 2.511
            }
        ]
    }
    ```
    """
    try:
        logger.info(f"GET /simulation/multipliers-67 - Fetching multipliers (top_n={top_n})")

        # Get top sectors by multiplier
        top_sectors = orchestrator.get_top_sectors_by_multiplier(limit=top_n)

        # Get all sectors with multipliers
        all_sectors_data = orchestrator.get_all_sectors()

        # Build multipliers list
        multipliers = []
        for sector in all_sectors_data:
            sector_id = sector['sector_id']
            multiplier_info = next((s for s in top_sectors if s['sector_id'] == sector_id), None)
            if multiplier_info:
                multipliers.append({
                    "sector_id": sector_id,
                    "sector_code": sector['sector_code'],
                    "sector_name": sector['sector_name'],
                    "output_multiplier": multiplier_info['output_multiplier']
                })

        response = MultipliersResponse67(
            multipliers=multipliers if multipliers else top_sectors,
            top_multipliers=top_sectors
        )

        logger.info(f"✅ Returned multipliers for {len(multipliers)} sectors")
        return response

    except Exception as e:
        logger.error(f"❌ Error fetching multipliers: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch multipliers",
                "code": "MULTIPLIERS_FETCH_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# ENDPOINT 3: GET SECTOR AGGREGATION MAPPING
# ============================================================================

@router.get(
    "/sector-mapping-67",
    response_model=SectorAggregationMappingResponse,
    summary="Get 67→4 sector aggregation mapping",
    description="""
    Retrieve mapping from 67 IBGE sectors to 4 aggregate sectors.

    **Aggregation Categories**:
    - **Agriculture**: Sectors 1-3 (3 sectors)
    - **Industry**: Sectors 4-39 (36 sectors)
    - **Services**: Sectors 40-61 (22 sectors)
    - **Public**: Sectors 62-67 (6 sectors)

    **Use case**:
    - Backward compatibility with 4-sector model
    - Simplified analysis and visualization
    - Comparison with existing economic data

    **Data source**: IBGE classification + expert mapping
    """,
    response_description="Sector aggregation mapping (67→4)"
)
async def get_sector_mapping_67(
    orchestrator: EconomicSimulationOrchestrator67 = Depends(get_orchestrator_67)
):
    """
    Get mapping from 67 IBGE sectors to 4 aggregate sectors.

    Example response:
    ```json
    {
        "mapping": {
            "1": "agriculture",
            "2": "agriculture",
            "4": "industry",
            ...
        },
        "summary": {
            "agriculture": 3,
            "industry": 36,
            "services": 22,
            "public": 6
        }
    }
    ```
    """
    try:
        logger.info("GET /simulation/sector-mapping-67 - Fetching aggregation mapping")

        # Get mapping from orchestrator
        mapping = orchestrator.get_sector_aggregation_mapping()

        # Calculate summary
        summary = {
            "agriculture": 0,
            "industry": 0,
            "services": 0,
            "public": 0
        }
        for sector_id, aggregate_sector in mapping.items():
            if aggregate_sector in summary:
                summary[aggregate_sector] += 1

        response = SectorAggregationMappingResponse(
            mapping=mapping,
            summary=summary
        )

        logger.info(f"✅ Returned mapping for {len(mapping)} sectors")
        return response

    except Exception as e:
        logger.error(f"❌ Error fetching sector mapping: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch sector mapping",
                "code": "MAPPING_FETCH_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# ENDPOINT 4: EXECUTE 67-SECTOR SHOCK SIMULATION
# ============================================================================

@router.post(
    "/shock-67",
    status_code=status.HTTP_200_OK,
    summary="Execute 67-sector economic shock simulation",
    description="""
    Execute a complete economic shock simulation using IBGE 67-sector Input-Output analysis.

    **Process**:
    1. Validate input parameters (region, sector, investment)
    2. Calculate economic impact (Leontief equation: X = L × Y)
    3. Aggregate 67 sectors → 4 sectors for compatibility
    4. Distribute impact spatially using gravity model (optional)
    5. Identify top affected sectors

    **Economic Multipliers** (Top 5):
    - Meat & Dairy (8): 2.511×
    - Petroleum Refining (19): 2.484×
    - Sugar Refining (9): 2.409×
    - Biofuels (20): 2.379×
    - Food Products (10): 2.356×

    **Example**: 10M BRL investment in Petroleum Refining (Sector 19) generates:
    - ~24.84M BRL total production impact
    - Major spillover to Transportation (Sector 43), Construction (40), Chemicals (21)
    - Distributed across 53 regions via gravity model

    **Advantages over 4-sector model**:
    - Precise sector targeting (67 vs 4 sectors)
    - Detailed supply chain analysis
    - Accurate multiplier effects
    - Official IBGE data (2015)

    **Data source**: IBGE Input-Output Matrix 2015 (67 sectors)

    **Rate Limit**: 10 requests per minute
    **Cache**: Results cached for 5 minutes
    """,
    response_description="Complete simulation results with 67-sector detail"
)
async def execute_shock_simulation_67(
    request: ShockSimulationRequest67,
    orchestrator: EconomicSimulationOrchestrator67 = Depends(get_orchestrator_67)
):
    """
    Execute 67-sector economic shock simulation.

    **Request Body**:
    ```json
    {
        "region_code": "3501",
        "investment_brl": 10000000,
        "sector_id": 19,  // Petroleum refining
        "options": {
            "include_spatial_spillover": true
        }
    }
    ```

    **Response**: Complete simulation results with:
    - Total production impact
    - Production multiplier
    - Detailed 67-sector breakdown
    - Aggregated 4-sector breakdown
    - Top 20 affected sectors
    - Regional impact distribution
    """
    try:
        logger.info("="*70)
        logger.info("POST /simulation/shock-67 - Starting 67-sector simulation")
        logger.info(f"  Region: {request.region_code}")
        logger.info(f"  Investment: R$ {request.investment_brl:,.2f}")
        logger.info(f"  Sector ID: {request.sector_id}")
        logger.info("="*70)

        # Execute simulation
        result = orchestrator.simulate_shock(
            region_code=request.region_code,
            investment_brl=request.investment_brl,
            sector_id=request.sector_id,
            include_spatial_spillover=request.options.get('include_spatial_spillover', True)
        )

        # Convert to response dict (matches frontend TypeScript interface)
        response_dict = result.to_dict()

        logger.info("="*70)
        logger.info("✅ SIMULATION COMPLETE")
        logger.info(f"  Simulation ID: {result.simulation_id}")
        logger.info(f"  Total Production: R$ {result.total_production_impact:,.2f}")
        logger.info(f"  Multiplier: {result.production_multiplier:.3f}×")
        logger.info(f"  Calculation Time: {result.calculation_time_ms:.2f}ms")
        logger.info("="*70)

        return response_dict

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid input parameters",
                "code": "VALIDATION_ERROR",
                "details": {"message": str(e)}
            }
        )

    except Exception as e:
        logger.error(f"❌ Simulation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Simulation failed",
                "code": "SIMULATION_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@router.get(
    "/health-67",
    summary="Health check for 67-sector model",
    description="Check if 67-sector IBGE model is loaded and operational",
    response_description="Health status"
)
async def health_check_67(
    orchestrator: EconomicSimulationOrchestrator67 = Depends(get_orchestrator_67)
):
    """
    Health check endpoint for 67-sector model.

    Returns:
    ```json
    {
        "status": "healthy",
        "model": "IBGE_67_sectors",
        "data_year": 2015,
        "sectors_loaded": 67,
        "matrix_loaded": true
    }
    ```
    """
    try:
        # Test data access
        sectors = orchestrator.get_all_sectors()

        return {
            "status": "healthy",
            "model": "IBGE_67_sectors",
            "data_year": 2015,
            "sectors_loaded": len(sectors),
            "matrix_loaded": True,
            "message": "67-sector IBGE model operational"
        }

    except Exception as e:
        logger.error(f"❌ Health check failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "model": "IBGE_67_sectors",
                "error": str(e),
                "message": "67-sector model not operational"
            }
        )
