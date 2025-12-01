"""
CP2B Maps V3 - Economic Simulation Orchestrator
High-level facade coordinating all economic simulation services

SOLID Principles:
- Single Responsibility: Orchestrates simulation workflow
- Open/Closed: Extensible for new simulation types
- Dependency Inversion: Depends on service abstractions
- Facade Pattern: Simplifies complex subsystem interactions

This orchestrator is the MAIN ENTRY POINT for economic shock simulations.
It coordinates: LeontiefCalculator, EconomicDataService, SpatialSpilloverService

Author: CP2B Development Team
Date: 2025-11-30
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np

from app.services.leontief_calculator import LeontiefCalculator, LeontiefResult
from app.services.economic_data_service import (
    EconomicDataService,
    get_economic_data_service
)
from app.services.spatial_spillover_service import (
    SpatialSpilloverService,
    get_spatial_spillover_service
)

logger = logging.getLogger(__name__)


class SimulationResult:
    """
    Complete simulation result with all calculated impacts.

    This is the final output that gets returned to the API layer.
    """

    def __init__(
        self,
        simulation_id: str,
        origin_region_code: str,
        origin_region_name: str,
        investment_brl: float,
        primary_sector: str,
        total_vab_impact: float,
        economic_multiplier: float,
        vab_by_sector: Dict[str, float],
        tax_revenue_brl: float,
        jobs_created: int,
        regional_impacts: Dict[str, Dict[str, float]],
        calculation_time_ms: float,
        timestamp: datetime
    ):
        self.simulation_id = simulation_id
        self.origin_region_code = origin_region_code
        self.origin_region_name = origin_region_name
        self.investment_brl = investment_brl
        self.primary_sector = primary_sector
        self.total_vab_impact = total_vab_impact
        self.economic_multiplier = economic_multiplier
        self.vab_by_sector = vab_by_sector
        self.tax_revenue_brl = tax_revenue_brl
        self.jobs_created = jobs_created
        self.regional_impacts = regional_impacts
        self.calculation_time_ms = calculation_time_ms
        self.timestamp = timestamp

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "simulation_id": self.simulation_id,
            "timestamp": self.timestamp.isoformat(),
            "input": {
                "origin_region": self.origin_region_code,
                "origin_region_name": self.origin_region_name,
                "investment_brl": self.investment_brl,
                "primary_sector": self.primary_sector
            },
            "results": {
                "total_vab_impact_brl": self.total_vab_impact,
                "economic_multiplier": self.economic_multiplier,
                "vab_by_sector": self.vab_by_sector,
                "tax_revenue_brl": self.tax_revenue_brl,
                "jobs_created": self.jobs_created,
                "regional_impacts": self.regional_impacts
            },
            "metadata": {
                "calculation_time_ms": self.calculation_time_ms,
                "data_year": 2021
            }
        }


class EconomicSimulationOrchestrator:
    """
    High-level orchestrator for economic shock simulations.

    This class coordinates all services to execute complete simulations:
    1. Fetch data (EconomicDataService)
    2. Calculate economic impact (LeontiefCalculator)
    3. Distribute spatially (SpatialSpilloverService)
    4. Package results (SimulationResult)

    Example usage:
        >>> orchestrator = EconomicSimulationOrchestrator()
        >>> result = orchestrator.simulate_shock(
        ...     region_code="3501",  # São Paulo
        ...     investment_brl=10_000_000,  # 10M BRL
        ...     sector="industry"
        ... )
        >>> print(f"Total VAB: R$ {result.total_vab_impact:,.2f}")
        >>> print(f"Jobs: {result.jobs_created}")
    """

    # Sector mapping
    SECTOR_INDEX = {
        'agriculture': 0,
        'industry': 1,
        'services': 2,
        'public': 3
    }

    def __init__(
        self,
        data_service: Optional[EconomicDataService] = None,
        spillover_service: Optional[SpatialSpilloverService] = None
    ):
        """
        Initialize orchestrator with services.

        Args:
            data_service: Optional custom data service (default: singleton)
            spillover_service: Optional custom spillover service (default: singleton)
        """
        self.data_service = data_service or get_economic_data_service()
        self.spillover_service = spillover_service or get_spatial_spillover_service()

        logger.info("✅ EconomicSimulationOrchestrator initialized")

    def simulate_shock(
        self,
        region_code: str,
        investment_brl: float,
        sector: str,
        include_spatial_spillover: bool = True,
        tax_rate: float = 0.18
    ) -> SimulationResult:
        """
        Execute complete economic shock simulation.

        This is the MAIN METHOD for simulations. It orchestrates:
        1. Data fetching
        2. Leontief calculation
        3. Spatial distribution
        4. Result packaging

        Args:
            region_code: IBGE code of region receiving investment (e.g., "3501")
            investment_brl: Investment amount in BRL (e.g., 10_000_000)
            sector: Economic sector ("agriculture", "industry", "services", "public")
            include_spatial_spillover: Whether to distribute impact spatially (default: True)
            tax_rate: Effective tax rate (default: 0.18 = 18%)

        Returns:
            SimulationResult with complete impact analysis

        Raises:
            ValueError: If inputs are invalid
            RuntimeError: If simulation fails

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator()
            >>> result = orchestrator.simulate_shock(
            ...     region_code="3501",
            ...     investment_brl=10_000_000,
            ...     sector="industry",
            ...     include_spatial_spillover=True
            ... )
            >>> print(result.to_dict())
        """
        start_time = datetime.now()

        # ====================================================================
        # STEP 1: VALIDATE INPUTS
        # ====================================================================

        if sector not in self.SECTOR_INDEX:
            raise ValueError(
                f"Invalid sector: {sector}. "
                f"Must be one of: {list(self.SECTOR_INDEX.keys())}"
            )

        if investment_brl <= 0:
            raise ValueError(f"Investment must be positive, got: {investment_brl}")

        if not (0 <= tax_rate <= 1):
            raise ValueError(f"Tax rate must be 0-1, got: {tax_rate}")

        logger.info("="*70)
        logger.info("ECONOMIC SHOCK SIMULATION")
        logger.info("="*70)
        logger.info(f"Origin Region: {region_code}")
        logger.info(f"Investment: R$ {investment_brl:,.2f}")
        logger.info(f"Sector: {sector}")
        logger.info(f"Spatial Spillover: {include_spatial_spillover}")

        # ====================================================================
        # STEP 2: FETCH DATA
        # ====================================================================

        logger.info("\n[Step 1/4] Fetching data from database...")

        # Get origin region
        origin_region = self.data_service.get_region_by_code(region_code)
        if not origin_region:
            raise ValueError(f"Region not found: {region_code}")

        logger.info(f"  Origin: {origin_region['nm_rgi']} (VAB: R$ {float(origin_region['vab_total_brl'])/1e9:.2f}B)")

        # Get all regions (for spatial spillover)
        all_regions = self.data_service.get_all_regions()
        logger.info(f"  Fetched {len(all_regions)} regions")

        # Get Leontief calculator
        calculator = self.data_service.get_leontief_calculator()
        logger.info(f"  Calculator ready with 4×4 matrix")

        # ====================================================================
        # STEP 3: CALCULATE ECONOMIC IMPACT (LEONTIEF)
        # ====================================================================

        logger.info("\n[Step 2/4] Calculating economic impact (Leontief model)...")

        # Create shock vector
        shock_vector = np.zeros(4)
        shock_vector[self.SECTOR_INDEX[sector]] = investment_brl

        logger.info(f"  Shock vector: {shock_vector}")

        # Calculate impact
        leontief_result: LeontiefResult = calculator.calculate_shock_impact(
            shock_vector=shock_vector,
            tax_rate=tax_rate
        )

        logger.info(f"  ✅ Total VAB Impact: R$ {leontief_result.total_vab_sum:,.2f}")
        logger.info(f"  ✅ Economic Multiplier: {leontief_result.economic_multiplier:.2f}×")
        logger.info(f"  ✅ Jobs Created: {leontief_result.jobs_created}")
        logger.info(f"  ✅ Tax Revenue: R$ {leontief_result.tax_revenue:,.2f}")

        # ====================================================================
        # STEP 4: SPATIAL DISTRIBUTION
        # ====================================================================

        if include_spatial_spillover:
            logger.info("\n[Step 3/4] Calculating spatial spillover (gravity model)...")

            regional_vab_impacts = self.spillover_service.calculate_and_distribute(
                origin_region_code=region_code,
                total_impact=leontief_result.total_vab_sum,
                all_regions=all_regions
            )

            # Build detailed regional impacts
            regional_impacts = {}
            for target_code, vab_impact in regional_vab_impacts.items():
                target_region = next(
                    r for r in all_regions if r['cd_rgi'] == target_code
                )

                # Calculate sector breakdown (proportional to total)
                vab_share = vab_impact / leontief_result.total_vab_sum if leontief_result.total_vab_sum > 0 else 0

                regional_impacts[target_code] = {
                    "region_name": target_region['nm_rgi'],
                    "vab_impact_brl": float(vab_impact),
                    "vab_agriculture": float(leontief_result.vab_by_sector['agriculture'] * vab_share),
                    "vab_industry": float(leontief_result.vab_by_sector['industry'] * vab_share),
                    "vab_services": float(leontief_result.vab_by_sector['services'] * vab_share),
                    "vab_public": float(leontief_result.vab_by_sector['public'] * vab_share),
                    "impact_percentage": float(vab_share * 100),
                    "vab_per_capita_increase": float(
                        vab_impact / target_region['population']
                        if target_region['population'] > 0 else 0
                    )
                }

            logger.info(f"  ✅ Distributed impact across {len(regional_impacts)} regions")

        else:
            logger.info("\n[Step 3/4] Spatial spillover disabled - all impact in origin region")

            regional_impacts = {
                region_code: {
                    "region_name": origin_region['nm_rgi'],
                    "vab_impact_brl": float(leontief_result.total_vab_sum),
                    "vab_agriculture": leontief_result.vab_by_sector['agriculture'],
                    "vab_industry": leontief_result.vab_by_sector['industry'],
                    "vab_services": leontief_result.vab_by_sector['services'],
                    "vab_public": leontief_result.vab_by_sector['public'],
                    "impact_percentage": 100.0,
                    "vab_per_capita_increase": float(
                        leontief_result.total_vab_sum / origin_region['population']
                        if origin_region['population'] > 0 else 0
                    )
                }
            }

        # ====================================================================
        # STEP 5: PACKAGE RESULTS
        # ====================================================================

        logger.info("\n[Step 4/4] Packaging results...")

        end_time = datetime.now()
        calculation_time_ms = (end_time - start_time).total_seconds() * 1000

        simulation_id = f"sim_{region_code}_{int(start_time.timestamp())}"

        result = SimulationResult(
            simulation_id=simulation_id,
            origin_region_code=region_code,
            origin_region_name=origin_region['nm_rgi'],
            investment_brl=investment_brl,
            primary_sector=sector,
            total_vab_impact=leontief_result.total_vab_sum,
            economic_multiplier=leontief_result.economic_multiplier,
            vab_by_sector=leontief_result.vab_by_sector,
            tax_revenue_brl=leontief_result.tax_revenue,
            jobs_created=leontief_result.jobs_created,
            regional_impacts=regional_impacts,
            calculation_time_ms=calculation_time_ms,
            timestamp=start_time
        )

        logger.info("="*70)
        logger.info("✅ SIMULATION COMPLETE")
        logger.info("="*70)
        logger.info(f"Calculation Time: {calculation_time_ms:.2f}ms")
        logger.info(f"Simulation ID: {simulation_id}")
        logger.info("="*70)

        return result

    def get_all_regions_summary(self) -> List[Dict[str, Any]]:
        """
        Get summary information for all regions.

        Returns:
            List of region summaries for map display

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator()
            >>> regions = orchestrator.get_all_regions_summary()
            >>> len(regions)  # 53
        """
        regions = self.data_service.get_all_regions()

        # Return simplified summary
        return [
            {
                "cd_rgi": r['cd_rgi'],
                "nm_rgi": r['nm_rgi'],
                "vab_total_brl": float(r['vab_total_brl']),
                "vab_agriculture_brl": float(r['vab_agriculture_brl']),
                "vab_industry_brl": float(r['vab_industry_brl']),
                "vab_services_brl": float(r['vab_services_brl']),
                "vab_public_brl": float(r['vab_public_brl']),
                "population": int(r['population']),
                "gdp_per_capita_brl": float(r['gdp_per_capita_brl']) if r['gdp_per_capita_brl'] else None,
                "centroid": {
                    "lat": float(r['centroid_lat']) if r['centroid_lat'] else None,
                    "lng": float(r['centroid_lng']) if r['centroid_lng'] else None
                }
            }
            for r in regions
        ]

    def get_economic_multipliers(self) -> Dict[str, float]:
        """
        Get economic multipliers for all sectors.

        Returns:
            Dictionary {sector: multiplier}

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator()
            >>> multipliers = orchestrator.get_economic_multipliers()
            >>> multipliers['industry']  # 2.80
        """
        calculator = self.data_service.get_leontief_calculator()
        return calculator.get_sector_multipliers()

    def get_state_summary(self) -> Dict[str, Any]:
        """
        Get state-wide economic summary.

        Returns:
            Summary statistics dictionary

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator()
            >>> summary = orchestrator.get_state_summary()
            >>> summary['total_vab_brl']  # ~2.3 trillion
        """
        return self.data_service.get_state_summary()


# Singleton instance
_orchestrator = None


def get_orchestrator() -> EconomicSimulationOrchestrator:
    """
    Get singleton instance of orchestrator.

    Returns:
        Shared EconomicSimulationOrchestrator instance

    Example:
        >>> orchestrator = get_orchestrator()
        >>> result = orchestrator.simulate_shock(...)
    """
    global _orchestrator

    if _orchestrator is None:
        _orchestrator = EconomicSimulationOrchestrator()

    return _orchestrator
