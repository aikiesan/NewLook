"""
CP2B Maps V3 - Economic Data Service
Data access layer for economic simulation data

SOLID Principles:
- Single Responsibility: Only handles data access/persistence
- Dependency Inversion: Depends on database abstraction
- Interface Segregation: Minimal focused interface

Author: CP2B Development Team
Date: 2025-11-30
"""

import logging
from typing import List, Dict, Optional, Any
from contextlib import contextmanager
import numpy as np

from app.core.database import get_db
from app.services.cache_service import get_cache_service
from app.services.leontief_calculator import (
    LeontiefCalculator,
    create_leontief_calculator_from_db
)

logger = logging.getLogger(__name__)


class EconomicDataService:
    """
    Data access service for economic simulation.

    Responsibilities:
    - Fetch regions with VAB data
    - Fetch Leontief matrix from database
    - Fetch conversion factors
    - Cache frequently accessed data
    - Provide data to calculation services

    This service is the ONLY place that interacts with the database
    for economic simulation data (Single Responsibility Principle).
    """

    def __init__(self):
        """Initialize economic data service with cache"""
        self.cache = get_cache_service()
        self._leontief_calculator_cache: Optional[LeontiefCalculator] = None
        logger.info("✅ EconomicDataService initialized")

    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        with get_db() as conn:
            yield conn

    def get_all_regions(self) -> List[Dict[str, Any]]:
        """
        Fetch all regions (auto-detects Brazil vs São Paulo).
        Prefers Brazil (133 regions) if available, falls back to SP (53 regions).

        Returns:
            List of region dictionaries with VAB, population, etc.

        Example:
            >>> service = EconomicDataService()
            >>> regions = service.get_all_regions()
            >>> len(regions)  # 133 (Brazil) or 53 (SP)
        """
        # Try Brazil regions first (larger scope)
        brazil_regions = self.get_all_brazil_regions()
        if brazil_regions and len(brazil_regions) > 0:
            logger.info(f"✅ Using Brazil regions ({len(brazil_regions)} regions)")
            return brazil_regions

        # Fall back to São Paulo regions
        cache_key = "economic:all_regions"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    id,
                    cd_rgi,
                    nm_rgi,
                    vab_agriculture_brl,
                    vab_industry_brl,
                    vab_services_brl,
                    vab_public_brl,
                    vab_total_brl,
                    population,
                    gdp_per_capita_brl,
                    ST_Y(centroid::geometry) as centroid_lat,
                    ST_X(centroid::geometry) as centroid_lng,
                    data_year,
                    created_at,
                    updated_at
                FROM immediate_regions
                ORDER BY vab_total_brl DESC
            """)

            regions = cursor.fetchall()
            cursor.close()

        # Cache for 5 minutes (same as other cached data)
        self.cache.set(cache_key, regions, ttl=300)

        logger.info(f"✅ Fetched {len(regions)} regions from database")
        return regions

    def get_region_by_code(self, region_code: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific region by IBGE code (auto-detects São Paulo vs Brazil).

        Args:
            region_code: IBGE region code (e.g., "3501" for SP, "4106" for Brazil)

        Returns:
            Region dictionary or None if not found

        Example:
            >>> service = EconomicDataService()
            >>> sp = service.get_region_by_code("3501")  # São Paulo
            >>> br = service.get_region_by_code("4106")  # Brazil (Paraná)
        """
        # Auto-detect: Try Brazil first (more regions), then São Paulo
        brazil_region = self.get_brazil_region_by_code(region_code)
        if brazil_region:
            return brazil_region

        # Fall back to São Paulo regions
        cache_key = f"economic:region:{region_code}"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    id,
                    cd_rgi,
                    nm_rgi,
                    vab_agriculture_brl,
                    vab_industry_brl,
                    vab_services_brl,
                    vab_public_brl,
                    vab_total_brl,
                    population,
                    gdp_per_capita_brl,
                    ST_Y(centroid::geometry) as centroid_lat,
                    ST_X(centroid::geometry) as centroid_lng,
                    data_year
                FROM immediate_regions
                WHERE cd_rgi = %s
            """, (region_code,))

            region = cursor.fetchone()
            cursor.close()

        if region:
            # Cache for 5 minutes
            self.cache.set(cache_key, region, ttl=300)
            logger.debug(f"✅ Fetched region: {region['nm_rgi']}")
        else:
            logger.warning(f"⚠️  Region not found: {region_code}")

        return region

    def get_leontief_matrix(self) -> List[Dict[str, Any]]:
        """
        Fetch Leontief inverse matrix from database.

        Returns:
            List of matrix rows (4 rows for 4 sectors)

        Example:
            >>> service = EconomicDataService()
            >>> matrix = service.get_leontief_matrix()
            >>> len(matrix)  # 4
            >>> matrix[0]['from_sector']  # 'agriculture'
        """
        cache_key = "economic:leontief_matrix"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    matrix_type,
                    from_sector,
                    to_agriculture,
                    to_industry,
                    to_services,
                    to_public,
                    description,
                    data_year
                FROM leontief_matrix
                WHERE matrix_type = 'leontief_inverse'
                ORDER BY
                    CASE from_sector
                        WHEN 'agriculture' THEN 1
                        WHEN 'industry' THEN 2
                        WHEN 'services' THEN 3
                        WHEN 'public' THEN 4
                    END
            """)

            matrix_rows = cursor.fetchall()
            cursor.close()

        # Cache for 5 minutes
        self.cache.set(cache_key, matrix_rows, ttl=300)

        logger.info(f"✅ Fetched Leontief matrix ({len(matrix_rows)} rows)")
        return matrix_rows

    def get_conversion_factors(self) -> Dict[str, Dict[str, float]]:
        """
        Fetch all conversion factors from database.

        Returns:
            Dictionary organized by factor_type
            {
                'vab_coefficient': {'agriculture': 0.699, ...},
                'employment': {'agriculture': 12.5, ...},
                'tax_revenue': {'agriculture': 0.18, ...}
            }

        Example:
            >>> service = EconomicDataService()
            >>> factors = service.get_conversion_factors()
            >>> factors['vab_coefficient']['industry']  # 0.291
            >>> factors['employment']['services']  # 14.8
        """
        cache_key = "economic:conversion_factors"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    factor_type,
                    factor_name,
                    agriculture,
                    industry,
                    services,
                    public,
                    unit,
                    description,
                    source
                FROM economic_conversion_factors
                ORDER BY factor_type, factor_name
            """)

            rows = cursor.fetchall()
            cursor.close()

        # Organize by factor_type
        factors = {}
        for row in rows:
            factor_type = row['factor_type']
            if factor_type not in factors:
                factors[factor_type] = {}

            factors[factor_type] = {
                'agriculture': float(row['agriculture']) if row['agriculture'] else 0,
                'industry': float(row['industry']) if row['industry'] else 0,
                'services': float(row['services']) if row['services'] else 0,
                'public': float(row['public']) if row['public'] else 0,
            }

        # Cache for 5 minutes
        self.cache.set(cache_key, factors, ttl=300)

        logger.info(f"✅ Fetched conversion factors ({len(factors)} types)")
        return factors

    def get_leontief_calculator(self) -> LeontiefCalculator:
        """
        Get or create cached LeontiefCalculator instance.

        This method ensures we only create the calculator once and reuse it.
        The calculator is stateless, so it's safe to cache.

        Returns:
            Initialized LeontiefCalculator

        Example:
            >>> service = EconomicDataService()
            >>> calculator = service.get_leontief_calculator()
            >>> result = calculator.calculate_shock_impact(shock)
        """
        # Return cached calculator if available
        if self._leontief_calculator_cache:
            logger.debug("Using cached LeontiefCalculator")
            return self._leontief_calculator_cache

        # Fetch data
        matrix_rows = self.get_leontief_matrix()
        conversion_factors = self.get_conversion_factors()

        # Create calculator
        calculator = create_leontief_calculator_from_db(
            leontief_matrix_rows=matrix_rows,
            conversion_factors=conversion_factors
        )

        # Cache it
        self._leontief_calculator_cache = calculator

        logger.info("✅ Created and cached LeontiefCalculator")
        return calculator

    def get_state_summary(self) -> Dict[str, Any]:
        """
        Get state-wide economic summary statistics.

        Returns:
            Summary dictionary with totals and percentages

        Example:
            >>> service = EconomicDataService()
            >>> summary = service.get_state_summary()
            >>> summary['total_vab_brl']  # ~2.3 trillion
            >>> summary['industry_pct']  # ~22%
        """
        cache_key = "economic:state_summary"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database view
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM v_state_economic_summary")
            summary = cursor.fetchone()
            cursor.close()

        # Cache for 5 minutes
        self.cache.set(cache_key, summary, ttl=300)

        logger.info("✅ Fetched state economic summary")
        return summary

    def get_top_regions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top N regions by total VAB.

        Args:
            limit: Number of regions to return (default: 10)

        Returns:
            List of top region dictionaries

        Example:
            >>> service = EconomicDataService()
            >>> top5 = service.get_top_regions(limit=5)
            >>> top5[0]['nm_rgi']  # 'São Paulo'
            >>> top5[1]['nm_rgi']  # 'Campinas'
        """
        cache_key = f"economic:top_regions:{limit}"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database view
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"""
                SELECT * FROM v_top_regions_by_vab
                LIMIT %s
            """, (limit,))
            regions = cursor.fetchall()
            cursor.close()

        # Cache for 5 minutes
        self.cache.set(cache_key, regions, ttl=300)

        logger.info(f"✅ Fetched top {limit} regions")
        return regions

    def get_region_by_coordinates(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[Dict[str, Any]]:
        """
        Find region containing a point (uses PostGIS ST_Contains).

        Args:
            latitude: Point latitude
            longitude: Point longitude

        Returns:
            Region dictionary or None if point not in any region

        Example:
            >>> service = EconomicDataService()
            >>> region = service.get_region_by_coordinates(-23.5505, -46.6333)
            >>> region['nm_rgi']  # 'São Paulo'
        """
        # Note: This requires geometry data to be loaded
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT cd_rgi, nm_rgi, vab_total_brl
                FROM get_region_by_coordinates(%s, %s)
            """, (latitude, longitude))
            region_info = cursor.fetchone()
            cursor.close()

        if not region_info:
            logger.warning(f"⚠️  No region found at coordinates: {latitude}, {longitude}")
            return None

        # Fetch full region data
        return self.get_region_by_code(region_info['cd_rgi'])

    def calculate_distance_between_regions(
        self,
        region1_code: str,
        region2_code: str
    ) -> Optional[float]:
        """
        Calculate distance between two regions (uses PostGIS).

        Args:
            region1_code: First region code
            region2_code: Second region code

        Returns:
            Distance in kilometers or None if regions not found

        Example:
            >>> service = EconomicDataService()
            >>> distance = service.calculate_distance_between_regions("3501", "3509")
            >>> distance  # ~90.5 km (São Paulo to Campinas)
        """
        cache_key = f"economic:distance:{region1_code}:{region2_code}"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Calculate using PostGIS function
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT calculate_region_distance(%s, %s) as distance
            """, (region1_code, region2_code))
            result = cursor.fetchone()
            cursor.close()

        distance = float(result['distance']) if result and result['distance'] else None

        if distance:
            # Cache for 5 minutes
            self.cache.set(cache_key, distance, ttl=300)

        return distance

    def clear_cache(self):
        """Clear all cached economic data"""
        self.cache.clear()
        self._leontief_calculator_cache = None
        logger.info("✅ Economic data cache cleared")

    # ========================================================================
    # BRAZIL-WIDE SIMULATION METHODS
    # ========================================================================

    def get_all_brazil_regions(self) -> List[Dict[str, Any]]:
        """
        Fetch all 133 Brazil intermediary regions with VAB data.

        Returns:
            List of region dictionaries with VAB, population, etc.

        Example:
            >>> service = EconomicDataService()
            >>> regions = service.get_all_brazil_regions()
            >>> len(regions)  # 133
        """
        cache_key = "economic:brazil_regions"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    cd_rgint,
                    nm_rgint,
                    cd_uf,
                    sigla_uf,
                    vab_agriculture_brl,
                    vab_industry_brl,
                    vab_services_brl,
                    vab_public_brl,
                    vab_total_brl,
                    population,
                    gdp_per_capita_brl,
                    centroid_lat,
                    centroid_lng,
                    data_year,
                    created_at,
                    updated_at
                FROM br_intermediate_regions
                ORDER BY vab_total_brl DESC
            """)

            rows = cursor.fetchall()
            cursor.close()

        # Transform to match Pydantic schema
        regions = []
        for row in rows:
            region = dict(row)
            # Rename fields to match schema
            region['cd_rgi'] = region.pop('cd_rgint')
            region['nm_rgi'] = region.pop('nm_rgint')
            # Create centroid object
            region['centroid'] = {
                'lat': region.pop('centroid_lat'),
                'lng': region.pop('centroid_lng')
            }
            regions.append(region)

        # Cache for 5 minutes
        self.cache.set(cache_key, regions, ttl=300)

        logger.info(f"✅ Fetched {len(regions)} Brazil regions from database")
        return regions

    def get_brazil_region_by_code(self, region_code: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific Brazil intermediary region by IBGE code.

        Args:
            region_code: IBGE region code (e.g., "1101", "3501")

        Returns:
            Region dictionary or None if not found

        Example:
            >>> service = EconomicDataService()
            >>> sp = service.get_brazil_region_by_code("3501")
            >>> sp['nm_rgint']  # 'São Paulo'
        """
        cache_key = f"economic:brazil_region:{region_code}"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from database
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    cd_rgint,
                    nm_rgint,
                    cd_uf,
                    sigla_uf,
                    vab_agriculture_brl,
                    vab_industry_brl,
                    vab_services_brl,
                    vab_public_brl,
                    vab_total_brl,
                    population,
                    gdp_per_capita_brl,
                    centroid_lat,
                    centroid_lng,
                    data_year
                FROM br_intermediate_regions
                WHERE cd_rgint = %s
            """, (region_code,))

            row = cursor.fetchone()
            cursor.close()

        if row:
            region = dict(row)
            # Transform to match Pydantic schema
            region['cd_rgi'] = region.pop('cd_rgint')
            region['nm_rgi'] = region.pop('nm_rgint')
            region['centroid'] = {
                'lat': region.pop('centroid_lat'),
                'lng': region.pop('centroid_lng')
            }

            # Cache for 5 minutes
            self.cache.set(cache_key, region, ttl=300)
            logger.debug(f"✅ Fetched Brazil region: {region['nm_rgi']}")
            return region
        else:
            logger.warning(f"⚠️  Brazil region not found: {region_code}")
            return None

    def get_brazil_distance(
        self,
        origin_code: str,
        target_code: str
    ) -> Optional[float]:
        """
        Get pre-computed distance between two Brazil regions.

        Args:
            origin_code: Origin region code
            target_code: Target region code

        Returns:
            Distance in kilometers or None if not found
        """
        cache_key = f"economic:brazil_distance:{origin_code}:{target_code}"

        # Try cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data

        # Fetch from pre-computed distance matrix
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT distance_km
                FROM br_region_distances
                WHERE origin_cd_rgint = %s AND target_cd_rgint = %s
            """, (origin_code, target_code))
            result = cursor.fetchone()
            cursor.close()

        distance = float(result['distance_km']) if result else None

        if distance:
            # Cache for 5 minutes
            self.cache.set(cache_key, distance, ttl=300)

        return distance


# Singleton instance
_economic_data_service = None


def get_economic_data_service() -> EconomicDataService:
    """
    Get singleton instance of EconomicDataService.

    Returns:
        Shared EconomicDataService instance

    Example:
        >>> service = get_economic_data_service()
        >>> regions = service.get_all_regions()
    """
    global _economic_data_service

    if _economic_data_service is None:
        _economic_data_service = EconomicDataService()

    return _economic_data_service
