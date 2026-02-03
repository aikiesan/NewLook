"""
CP2B Maps V3 - Economic Simulation Orchestrator (67 Sectors - IBGE)
High-level facade coordinating all 67-sector economic simulation services

SOLID Principles:
- Single Responsibility: Orchestrates 67-sector simulation workflow
- Open/Closed: Extensible for new simulation types
- Dependency Inversion: Depends on service abstractions
- Facade Pattern: Simplifies complex subsystem interactions

This orchestrator coordinates: LeontiefCalculator67, EconomicDataService67, SpatialSpilloverService

Author: CP2B Development Team
Date: 2026-01-30
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np

from app.services.leontief_calculator_67 import LeontiefCalculator67, LeontiefResult67
from app.services.economic_data_service_67 import (
    EconomicDataService67,
    get_economic_data_service_67
)
from app.services.economic_data_service import (
    EconomicDataService,
    get_economic_data_service
)
from app.services.spatial_spillover_service import (
    SpatialSpilloverService,
    get_spatial_spillover_service
)

logger = logging.getLogger(__name__)


class SimulationResult67:
    """
    Complete 67-sector simulation result with all calculated impacts

    This is the final output returned to the API layer
    """

    def __init__(
        self,
        simulation_id: str,
        origin_region_code: str,
        origin_region_name: str,
        investment_brl: float,
        primary_sector_id: int,
        primary_sector_code: str,
        primary_sector_name: str,
        total_production_impact: float,
        production_multiplier: float,
        sector_production_detail: Dict[int, float],
        sector_production_aggregated: Dict[str, float],  # 67 → 4 sectors
        regional_impacts: Dict[str, Dict[str, float]],
        top_affected_sectors: List[Dict[str, Any]],
        calculation_time_ms: float,
        timestamp: datetime,
        include_spatial_spillover: bool = True
    ):
        self.simulation_id = simulation_id
        self.origin_region_code = origin_region_code
        self.origin_region_name = origin_region_name
        self.investment_brl = investment_brl
        self.primary_sector_id = primary_sector_id
        self.primary_sector_code = primary_sector_code
        self.primary_sector_name = primary_sector_name
        self.total_production_impact = total_production_impact
        self.production_multiplier = production_multiplier
        self.sector_production_detail = sector_production_detail
        self.sector_production_aggregated = sector_production_aggregated
        self.regional_impacts = regional_impacts
        self.top_affected_sectors = top_affected_sectors
        self.calculation_time_ms = calculation_time_ms
        self.timestamp = timestamp
        self.include_spatial_spillover = include_spatial_spillover

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization matching frontend TypeScript interface"""
        # Calculate aggregate breakdown for sector_impacts
        aggregate_breakdown = []
        sector_labels = {
            'agriculture': 'Agricultura e Pecuária',
            'industry': 'Indústria',
            'services': 'Serviços',
            'public': 'Administração Pública'
        }

        total_agg = sum(self.sector_production_aggregated.values())
        for code, value in self.sector_production_aggregated.items():
            aggregate_breakdown.append({
                "aggregate_sector_code": code,
                "aggregate_sector_name": sector_labels.get(code, code.capitalize()),
                "total_output_brl": value,
                "percentage_of_total": (value / total_agg * 100) if total_agg > 0 else 0,
                "sector_count": 0  # This would require mapping info
            })

        # Transform top_affected_sectors to match frontend interface
        top_20_sectors = []
        for sector in self.top_affected_sectors[:20]:
            top_20_sectors.append({
                "sector_id": sector["sector_id"],
                "sector_code": sector["sector_code"],
                "sector_name": sector["sector_name"],
                "output_impact_brl": sector["production_impact_brl"],
                "percentage_of_total": sector["share_of_total_pct"]
            })

        # Transform regional_impacts for spatial_distribution
        regional_impacts_list = []
        max_impact_region = ""
        max_impact_value = 0

        for region_code, impact in self.regional_impacts.items():
            # Calculate regional sector breakdown (top 3 sectors for this region)
            regional_sector_impacts = self._calculate_regional_sector_impacts(
                region_code,
                impact["spillover_weight"]
            )

            regional_impacts_list.append({
                "region_code": region_code,
                "region_name": impact["region_name"],
                "vab_impact_brl": impact["production_impact_brl"],
                "spillover_weight": impact["spillover_weight"],
                "distance_km": 0,  # Not available in current data
                "impact_intensity": self._calculate_impact_intensity(impact["impact_percentage"]),
                "top_sectors": regional_sector_impacts[:3]  # Top 3 sectors for tooltip
            })

            if impact["production_impact_brl"] > max_impact_value:
                max_impact_value = impact["production_impact_brl"]
                max_impact_region = region_code

        # Calculate spillover percentage (impact outside origin region)
        origin_impact = self.regional_impacts.get(self.origin_region_code, {}).get("production_impact_brl", 0)
        spillover_percentage = ((self.total_production_impact - origin_impact) / self.total_production_impact * 100) if self.total_production_impact > 0 else 0

        # Calculate direct vs indirect output
        direct_output = self.investment_brl
        indirect_output = self.total_production_impact - direct_output

        # Calculate jobs created (employment multiplier: ~12 jobs per R$ 1M production)
        employment_multiplier = 12.0  # Average jobs per R$ 1M
        jobs_created = int((self.total_production_impact / 1_000_000) * employment_multiplier)

        return {
            "metadata": {
                "simulation_id": self.simulation_id,
                "timestamp": self.timestamp.isoformat(),
                "model_version": "IBGE_67_sectors_v1",
                "data_year": 2015
            },
            "inputs": {
                "region_code": self.origin_region_code,
                "region_name": self.origin_region_name,
                "investment_brl": self.investment_brl,
                "sector_id": self.primary_sector_id,
                "sector_code": self.primary_sector_code,
                "sector_name": self.primary_sector_name,
                "include_spatial_spillover": self.include_spatial_spillover
            },
            "direct_impacts": {
                "initial_investment_brl": self.investment_brl,
                "output_multiplier": self.production_multiplier,
                "total_production_brl": self.total_production_impact,
                "multiplier_effect_brl": indirect_output
            },
            "sector_impacts": {
                "top_20_affected_sectors": top_20_sectors,
                "aggregate_breakdown": aggregate_breakdown,
                "total_sectors_affected": len(self.sector_production_detail)
            },
            "spatial_distribution": {
                "regional_impacts": regional_impacts_list,
                "total_regions_affected": len(self.regional_impacts),
                "max_impact_region": max_impact_region,
                "spillover_percentage": spillover_percentage
            },
            "summary": {
                "total_economic_output_brl": self.total_production_impact,
                "direct_output_brl": direct_output,
                "indirect_output_brl": indirect_output,
                "roi_multiplier": self.production_multiplier,
                "jobs_created": jobs_created
            }
        }

    def _calculate_impact_intensity(self, percentage: float) -> str:
        """Calculate impact intensity based on percentage"""
        if percentage >= 50:
            return "very_high"
        elif percentage >= 20:
            return "high"
        elif percentage >= 5:
            return "medium"
        elif percentage >= 1:
            return "low"
        else:
            return "very_low"

    def _calculate_regional_sector_impacts(self, region_code: str, spillover_weight: float) -> List[Dict[str, Any]]:
        """
        Calculate top affected sectors for a specific region

        Distributes the national 67-sector production across this region
        based on its spillover weight, then returns top sectors.
        """
        regional_sectors = []

        # Distribute each sector's production to this region proportionally
        for sector_id, national_production in self.sector_production_detail.items():
            regional_production = national_production * spillover_weight

            # Only include sectors with meaningful impact (> R$ 1000)
            if regional_production > 1000:
                # Find sector info from top_affected_sectors
                sector_info = next(
                    (s for s in self.top_affected_sectors if s["sector_id"] == sector_id),
                    None
                )

                if sector_info:
                    regional_sectors.append({
                        "sector_id": sector_id,
                        "sector_name": sector_info["sector_name"],
                        "sector_code": sector_info["sector_code"],
                        "production_brl": regional_production
                    })

        # Sort by production value (descending) and return top sectors
        regional_sectors.sort(key=lambda x: x["production_brl"], reverse=True)
        return regional_sectors


class EconomicSimulationOrchestrator67:
    """
    High-level orchestrator for 67-sector IBGE economic shock simulations

    This class coordinates all services to execute complete simulations:
    1. Fetch data (EconomicDataService67)
    2. Calculate economic impact (LeontiefCalculator67)
    3. Aggregate 67 → 4 sectors for compatibility
    4. Distribute spatially (SpatialSpilloverService)
    5. Package results (SimulationResult67)

    Example usage:
        >>> orchestrator = EconomicSimulationOrchestrator67()
        >>> result = orchestrator.simulate_shock(
        ...     region_code="3501",  # São Paulo
        ...     investment_brl=10_000_000,  # 10M BRL
        ...     sector_id=19  # Petroleum refining
        ... )
        >>> print(f"Total Production: R$ {result.total_production_impact:,.2f}")
    """

    def __init__(
        self,
        data_service_67: Optional[EconomicDataService67] = None,
        data_service: Optional[EconomicDataService] = None,
        spillover_service: Optional[SpatialSpilloverService] = None
    ):
        """
        Initialize orchestrator with services

        Args:
            data_service_67: 67-sector data service (default: singleton)
            data_service: 4-sector data service for regions (default: singleton)
            spillover_service: Spatial spillover service (default: singleton)
        """
        self.data_service_67 = data_service_67 or get_economic_data_service_67()
        self.data_service = data_service or get_economic_data_service()
        self.spillover_service = spillover_service or get_spatial_spillover_service()

        logger.info("✅ EconomicSimulationOrchestrator67 initialized")

    def simulate_shock(
        self,
        region_code: str,
        investment_brl: float,
        sector_id: int,
        include_spatial_spillover: bool = True
    ) -> SimulationResult67:
        """
        Execute complete 67-sector economic shock simulation

        This is the MAIN METHOD for 67-sector simulations. It orchestrates:
        1. Data fetching
        2. Leontief calculation (67 sectors)
        3. Aggregation (67 → 4 sectors)
        4. Spatial distribution
        5. Result packaging

        Args:
            region_code: IBGE code of region receiving investment (e.g., "3501")
            investment_brl: Investment amount in BRL (e.g., 10_000_000)
            sector_id: IBGE sector ID (1-67)
            include_spatial_spillover: Whether to distribute impact spatially (default: True)

        Returns:
            SimulationResult67 with complete impact analysis

        Raises:
            ValueError: If inputs are invalid
            RuntimeError: If simulation fails

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator67()
            >>> result = orchestrator.simulate_shock(
            ...     region_code="3501",
            ...     investment_brl=10_000_000,
            ...     sector_id=19,  # Petroleum refining
            ...     include_spatial_spillover=True
            ... )
            >>> print(result.to_dict())
        """
        start_time = datetime.now()

        # ====================================================================
        # STEP 1: VALIDATE INPUTS
        # ====================================================================

        if not (1 <= sector_id <= 67):
            raise ValueError(f"Sector ID must be 1-67, got: {sector_id}")

        if investment_brl <= 0:
            raise ValueError(f"Investment must be positive, got: {investment_brl}")

        logger.info("="*70)
        logger.info("ECONOMIC SHOCK SIMULATION (67-SECTOR IBGE MODEL)")
        logger.info("="*70)
        logger.info(f"Origin Region: {region_code}")
        logger.info(f"Investment: R$ {investment_brl:,.2f}")
        logger.info(f"Sector ID: {sector_id}")
        logger.info(f"Spatial Spillover: {include_spatial_spillover}")

        # ====================================================================
        # STEP 2: FETCH DATA
        # ====================================================================

        logger.info("\n[Step 1/5] Fetching data from database...")

        # Get origin region (from regional table)
        origin_region = self.data_service.get_region_by_code(region_code)
        if not origin_region:
            raise ValueError(f"Region not found: {region_code}")

        logger.info(f"  Origin: {origin_region['nm_rgi']}")

        # Get all regions (for spatial spillover)
        all_regions = self.data_service.get_all_regions()
        logger.info(f"  Fetched {len(all_regions)} regions")

        # Get sector info
        sector_info = self.data_service_67.get_sector_by_id(sector_id)
        if not sector_info:
            raise ValueError(f"Sector not found: {sector_id}")

        logger.info(f"  Sector: {sector_info['sector_name']}")

        # Get Leontief calculator
        calculator = self.data_service_67.get_leontief_calculator()
        logger.info(f"  Calculator ready with 67×67 matrix")

        # ====================================================================
        # STEP 3: CALCULATE ECONOMIC IMPACT (LEONTIEF 67 SECTORS)
        # ====================================================================

        logger.info("\n[Step 2/5] Calculating economic impact (Leontief 67-sector model)...")

        # Calculate impact
        leontief_result: LeontiefResult67 = calculator.calculate_shock_impact(
            sector_id=sector_id,
            investment_brl=investment_brl
        )

        logger.info(f"  ✅ Total Production Impact: R$ {leontief_result.total_production_sum:,.2f}")
        logger.info(f"  ✅ Production Multiplier: {leontief_result.output_multipliers[sector_id]:.3f}×")
        logger.info(f"  ✅ Sectors Affected: {len(leontief_result.sector_production_detail)}")

        # ====================================================================
        # STEP 4: AGGREGATE 67 → 4 SECTORS (FOR COMPATIBILITY)
        # ====================================================================

        logger.info("\n[Step 3/5] Aggregating 67 sectors → 4 sectors...")

        sector_production_aggregated = self.data_service_67.aggregate_67_to_4_sectors(
            leontief_result.sector_production_detail
        )

        logger.info(f"  ✅ Agriculture: R$ {sector_production_aggregated['agriculture']:,.2f}")
        logger.info(f"  ✅ Industry: R$ {sector_production_aggregated['industry']:,.2f}")
        logger.info(f"  ✅ Services: R$ {sector_production_aggregated['services']:,.2f}")
        logger.info(f"  ✅ Public: R$ {sector_production_aggregated['public']:,.2f}")

        # ====================================================================
        # STEP 5: SPATIAL DISTRIBUTION
        # ====================================================================

        if include_spatial_spillover:
            logger.info("\n[Step 4/5] Calculating spatial spillover (gravity model)...")

            # Calculate spillover weights
            spillover_weights = self.spillover_service.calculate_spillover_weights(
                origin_region_code=region_code,
                all_regions=all_regions
            )

            # Distribute the total impact using those weights
            regional_production_impacts = self.spillover_service.distribute_impact(
                total_impact=leontief_result.total_production_sum,
                spillover_weights=spillover_weights
            )

            # Build detailed regional impacts
            regional_impacts = {}
            for target_code, production_impact in regional_production_impacts.items():
                target_region = next(
                    r for r in all_regions if r['cd_rgi'] == target_code
                )

                # Calculate production share
                production_share = (
                    production_impact / leontief_result.total_production_sum
                    if leontief_result.total_production_sum > 0 else 0
                )

                regional_impacts[target_code] = {
                    "region_name": target_region['nm_rgi'],
                    "production_impact_brl": float(production_impact),
                    "spillover_weight": float(spillover_weights.get(target_code, 0)),
                    "production_agriculture": float(sector_production_aggregated['agriculture'] * production_share),
                    "production_industry": float(sector_production_aggregated['industry'] * production_share),
                    "production_services": float(sector_production_aggregated['services'] * production_share),
                    "production_public": float(sector_production_aggregated['public'] * production_share),
                    "impact_percentage": float(production_share * 100),
                    "production_per_capita_increase": float(
                        production_impact / target_region['population']
                        if target_region['population'] > 0 else 0
                    )
                }

            logger.info(f"  ✅ Distributed impact across {len(regional_impacts)} regions")

        else:
            logger.info("\n[Step 4/5] Spatial spillover disabled - all impact in origin region")

            regional_impacts = {
                region_code: {
                    "region_name": origin_region['nm_rgi'],
                    "production_impact_brl": float(leontief_result.total_production_sum),
                    "spillover_weight": 1.0,
                    "production_agriculture": sector_production_aggregated['agriculture'],
                    "production_industry": sector_production_aggregated['industry'],
                    "production_services": sector_production_aggregated['services'],
                    "production_public": sector_production_aggregated['public'],
                    "impact_percentage": 100.0,
                    "production_per_capita_increase": float(
                        leontief_result.total_production_sum / origin_region['population']
                        if origin_region['population'] > 0 else 0
                    )
                }
            }

        # ====================================================================
        # STEP 6: IDENTIFY TOP AFFECTED SECTORS
        # ====================================================================

        logger.info("\n[Step 5/5] Identifying top affected sectors...")

        # Sort sectors by production impact
        top_sectors = sorted(
            leontief_result.sector_production_detail.items(),
            key=lambda x: x[1],
            reverse=True
        )[:20]  # Top 20 sectors

        top_affected_sectors = []
        for sid, production in top_sectors:
            sector_info_detail = self.data_service_67.get_sector_by_id(sid)
            top_affected_sectors.append({
                "sector_id": sid,
                "sector_code": sector_info_detail['sector_code'],
                "sector_name": sector_info_detail['sector_name'],
                "production_impact_brl": float(production),
                "share_of_total_pct": float((production / leontief_result.total_production_sum) * 100)
            })

        logger.info(f"  ✅ Top sector: {top_affected_sectors[0]['sector_name']} (R$ {top_affected_sectors[0]['production_impact_brl']:,.2f})")

        # ====================================================================
        # STEP 7: PACKAGE RESULTS
        # ====================================================================

        logger.info("\n[Final Step] Packaging results...")

        end_time = datetime.now()
        calculation_time_ms = (end_time - start_time).total_seconds() * 1000

        simulation_id = f"sim67_{region_code}_{sector_id}_{int(start_time.timestamp())}"

        result = SimulationResult67(
            simulation_id=simulation_id,
            origin_region_code=region_code,
            origin_region_name=origin_region['nm_rgi'],
            investment_brl=investment_brl,
            primary_sector_id=sector_id,
            primary_sector_code=sector_info['sector_code'],
            primary_sector_name=sector_info['sector_name'],
            total_production_impact=leontief_result.total_production_sum,
            production_multiplier=leontief_result.output_multipliers[sector_id],
            sector_production_detail=leontief_result.sector_production_detail,
            sector_production_aggregated=sector_production_aggregated,
            regional_impacts=regional_impacts,
            top_affected_sectors=top_affected_sectors,
            calculation_time_ms=calculation_time_ms,
            timestamp=start_time,
            include_spatial_spillover=include_spatial_spillover
        )

        logger.info("="*70)
        logger.info("✅ SIMULATION COMPLETE (67-SECTOR MODEL)")
        logger.info("="*70)
        logger.info(f"Calculation Time: {calculation_time_ms:.2f}ms")
        logger.info(f"Simulation ID: {simulation_id}")
        logger.info("="*70)

        return result

    def get_all_sectors(self) -> List[Dict[str, Any]]:
        """
        Get all 67 IBGE sectors with multipliers

        Returns:
            List of sector dictionaries with metadata and multipliers

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator67()
            >>> sectors = orchestrator.get_all_sectors()
            >>> len(sectors)  # 67
        """
        return self.data_service_67.get_all_sectors()

    def get_top_sectors_by_multiplier(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get top N sectors by economic multiplier

        Args:
            limit: Number of sectors to return (default: 20)

        Returns:
            List of top sector dictionaries

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator67()
            >>> top10 = orchestrator.get_top_sectors_by_multiplier(limit=10)
            >>> top10[0]['sector_name']  # Highest multiplier sector
        """
        return self.data_service_67.get_top_sectors_by_multiplier(limit=limit)

    def get_sector_aggregation_mapping(self) -> Dict[int, str]:
        """
        Get mapping from 67 sectors to 4 aggregate sectors

        Returns:
            Dictionary {sector_id: aggregate_sector_code}

        Example:
            >>> orchestrator = EconomicSimulationOrchestrator67()
            >>> mapping = orchestrator.get_sector_aggregation_mapping()
            >>> mapping[1]  # 'agriculture'
        """
        return self.data_service_67.get_sector_aggregation_mapping()


# Singleton instance
_orchestrator_67 = None


def get_orchestrator_67() -> EconomicSimulationOrchestrator67:
    """
    Get singleton instance of 67-sector orchestrator

    Returns:
        Shared EconomicSimulationOrchestrator67 instance

    Example:
        >>> orchestrator = get_orchestrator_67()
        >>> result = orchestrator.simulate_shock(...)
    """
    global _orchestrator_67

    if _orchestrator_67 is None:
        _orchestrator_67 = EconomicSimulationOrchestrator67()

    return _orchestrator_67
