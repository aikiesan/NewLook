"""
CP2B Maps V3 - Economic Simulation API Endpoints
RESTful API for Leontief Input-Output economic shock analysis

Endpoints:
- GET  /api/v1/simulation/regions - List all immediate regions
- POST /api/v1/simulation/shock - Execute economic shock simulation
- GET  /api/v1/simulation/multipliers - Get economic multipliers
- GET  /api/v1/simulation/state-summary - Get state-wide summary

Author: CP2B Development Team
Date: 2025-11-30
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Optional

from app.schemas.economic_simulation import (
    ShockSimulationRequest,
    ShockSimulationResponse,
    RegionsListResponse,
    MultipliersResponse,
    StateSummaryResponse,
    ErrorDetail
)
from app.services.economic_simulation_orchestrator import (
    get_orchestrator,
    EconomicSimulationOrchestrator
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/simulation",
    tags=["Economic Simulation"],
    responses={
        500: {"model": ErrorDetail, "description": "Internal Server Error"},
        400: {"model": ErrorDetail, "description": "Bad Request"}
    }
)


# ============================================================================
# ENDPOINT 1: GET ALL REGIONS
# ============================================================================

@router.get(
    "/regions",
    response_model=RegionsListResponse,
    summary="Get all immediate regions",
    description="""
    Retrieve all 53 immediate regions of São Paulo state with VAB data.

    Returns economic data for each region including:
    - Total VAB and breakdown by sector
    - Population and GDP per capita
    - Geographic centroid coordinates

    **Use case**: Display regions on map for user selection.
    """,
    response_description="List of regions with economic data"
)
async def get_regions(
    orchestrator: EconomicSimulationOrchestrator = Depends(get_orchestrator)
):
    """
    Get all 53 immediate regions with VAB data.

    Example response:
    ```json
    {
        "regions": [
            {
                "cd_rgi": "3501",
                "nm_rgi": "São Paulo",
                "vab_total_brl": 500000000000,
                ...
            }
        ],
        "total_regions": 53,
        "total_state_vab_brl": 2300000000000
    }
    ```
    """
    try:
        logger.info("GET /simulation/regions - Fetching all regions")

        # Get regions from orchestrator
        regions = orchestrator.get_all_regions_summary()

        # Calculate total state VAB
        total_state_vab = sum(r['vab_total_brl'] for r in regions)

        response = RegionsListResponse(
            regions=regions,
            total_regions=len(regions),
            total_state_vab_brl=total_state_vab
        )

        logger.info(f"✅ Returned {len(regions)} regions")
        return response

    except Exception as e:
        logger.error(f"❌ Error fetching regions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch regions",
                "code": "REGIONS_FETCH_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# ENDPOINT 2: EXECUTE SHOCK SIMULATION
# ============================================================================

@router.post(
    "/shock",
    response_model=ShockSimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute economic shock simulation",
    description="""
    Execute a complete economic shock simulation using Leontief Input-Output analysis.

    **Process**:
    1. Validate input parameters
    2. Calculate economic impact (Leontief equation: X = L × Y)
    3. Convert production to VAB using sector coefficients
    4. Calculate tax revenue (18% of VAB)
    5. Calculate jobs created using employment coefficients
    6. Distribute impact spatially using gravity model (optional)

    **Economic Multiplier**:
    - Agriculture: ~1.96×
    - Industry: ~2.80× (highest)
    - Services: ~2.50×
    - Public: ~2.00×

    **Example**: 10M BRL investment in Industry generates:
    - ~12.4M BRL total VAB
    - ~137 jobs
    - ~2.2M BRL tax revenue

    **Rate Limit**: 10 requests per minute
    **Cache**: Results cached for 5 minutes
    """,
    response_description="Complete simulation results with regional impacts"
)
async def execute_shock_simulation(
    request: ShockSimulationRequest,
    orchestrator: EconomicSimulationOrchestrator = Depends(get_orchestrator)
):
    """
    Execute economic shock simulation.

    Args:
        request: Simulation parameters (region, investment, sector)

    Returns:
        Complete simulation results with:
        - Total VAB impact
        - Economic multiplier
        - VAB by sector
        - Tax revenue
        - Jobs created
        - Regional distribution (if spatial spillover enabled)

    Raises:
        HTTPException: If inputs invalid or simulation fails
    """
    try:
        logger.info(
            f"POST /simulation/shock - "
            f"Region: {request.region_code}, "
            f"Investment: R$ {request.investment_brl:,.2f}, "
            f"Sector: {request.sector}"
        )

        # Execute simulation
        result = orchestrator.simulate_shock(
            region_code=request.region_code,
            investment_brl=request.investment_brl,
            sector=request.sector.value,
            include_spatial_spillover=request.options.get('include_spatial_spillover', True),
            tax_rate=request.options.get('tax_rate', 0.18)
        )

        # Convert to response schema
        response_dict = result.to_dict()

        logger.info(
            f"✅ Simulation complete - "
            f"VAB: R$ {result.total_vab_impact:,.2f}, "
            f"Multiplier: {result.economic_multiplier:.2f}×, "
            f"Jobs: {result.jobs_created}, "
            f"Time: {result.calculation_time_ms:.2f}ms"
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_dict
        )

    except ValueError as e:
        # Input validation errors
        logger.warning(f"⚠️  Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": str(e),
                "code": "VALIDATION_ERROR",
                "details": {
                    "region_code": request.region_code,
                    "investment_brl": request.investment_brl,
                    "sector": request.sector
                }
            }
        )

    except Exception as e:
        # Unexpected errors
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
# ENDPOINT 3: GET ECONOMIC MULTIPLIERS
# ============================================================================

@router.get(
    "/multipliers",
    response_model=MultipliersResponse,
    summary="Get economic multipliers",
    description="""
    Get economic multipliers for all four sectors.

    **Multiplier Definition**:
    Total economic output (VAB) generated per 1 BRL invested in each sector.

    **São Paulo State Multipliers** (based on 2019 I-O matrix):
    - Agriculture: 1.96× (moderate)
    - **Industry: 2.80×** (highest - extensive supply chains)
    - Services: 2.50× (high)
    - Public: 2.00× (moderate)

    **Interpretation**:
    A multiplier of 2.80 means that 1 BRL invested in Industry
    generates 2.80 BRL of total economic activity across all sectors
    (direct + indirect effects).

    **Use case**: Help users understand which sectors have the
    greatest economic impact potential.
    """,
    response_description="Economic multipliers by sector"
)
async def get_multipliers(
    orchestrator: EconomicSimulationOrchestrator = Depends(get_orchestrator)
):
    """
    Get economic multipliers for all sectors.

    Returns:
        Dictionary with sector multipliers
    """
    try:
        logger.info("GET /simulation/multipliers")

        multipliers = orchestrator.get_economic_multipliers()

        logger.info(f"✅ Returned multipliers: {multipliers}")

        return MultipliersResponse(multipliers=multipliers)

    except Exception as e:
        logger.error(f"❌ Error fetching multipliers: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch multipliers",
                "code": "MULTIPLIERS_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# ENDPOINT 4: GET STATE SUMMARY
# ============================================================================

@router.get(
    "/state-summary",
    response_model=StateSummaryResponse,
    summary="Get state-wide economic summary",
    description="""
    Get aggregated economic statistics for entire São Paulo state.

    **Includes**:
    - Total regions (53 immediate regions)
    - Total population (~46 million)
    - Total VAB (~2.3 trillion BRL)
    - VAB breakdown by sector
    - Sector percentages
    - Average GDP per capita

    **Sector Distribution**:
    - Agriculture: ~1.5%
    - Industry: ~22%
    - Services: ~71% (dominant)
    - Public: ~5.5%

    **Use case**: Display state-wide context and validate simulation results.
    """,
    response_description="State-wide economic summary statistics"
)
async def get_state_summary(
    orchestrator: EconomicSimulationOrchestrator = Depends(get_orchestrator)
):
    """
    Get state-wide economic summary statistics.

    Returns:
        Summary with totals and percentages
    """
    try:
        logger.info("GET /simulation/state-summary")

        summary = orchestrator.get_state_summary()

        logger.info(
            f"✅ State summary - "
            f"Regions: {summary['total_regions']}, "
            f"VAB: R$ {summary['total_vab_brl']/1e12:.2f}T"
        )

        return StateSummaryResponse(**summary)

    except Exception as e:
        logger.error(f"❌ Error fetching state summary: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Failed to fetch state summary",
                "code": "STATE_SUMMARY_ERROR",
                "details": {"message": str(e)}
            }
        )


# ============================================================================
# HEALTH CHECK (for this module)
# ============================================================================

@router.get(
    "/health",
    summary="Health check for economic simulation module",
    description="Check if economic simulation services are operational",
    tags=["Health"]
)
async def health_check(
    orchestrator: EconomicSimulationOrchestrator = Depends(get_orchestrator)
):
    """
    Health check for economic simulation module.

    Verifies:
    - Database connectivity
    - Data availability
    - Service initialization

    Returns:
        Status and basic diagnostics
    """
    try:
        # Try to fetch data
        summary = orchestrator.get_state_summary()

        return {
            "status": "healthy",
            "module": "economic_simulation",
            "data_available": True,
            "total_regions": summary.get('total_regions', 0),
            "timestamp": "2025-11-30T00:00:00Z"
        }

    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "module": "economic_simulation",
                "error": str(e)
            }
        )
