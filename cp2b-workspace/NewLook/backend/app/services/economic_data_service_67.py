"""
CP2B Maps V3 - Economic Data Service for 67-Sector IBGE Model
Data access layer for 67-sector economic simulation data

SOLID Principles:
- Single Responsibility: Only handles data access for IBGE 67-sector model
- Dependency Inversion: Depends on database abstraction
- Interface Segregation: Minimal focused interface

Author: CP2B Development Team
Date: 2026-01-30
"""

import logging
from typing import List, Dict, Optional, Any
from contextlib import contextmanager

from app.core.database import get_db
from app.services.cache_service import get_cache_service
from app.services.leontief_calculator_67 import (
    LeontiefCalculator67,
    create_leontief_calculator_67_from_db
)

logger = logging.getLogger(__name__)


class EconomicDataService67:
    """
    Data access service for 67-sector IBGE economic model

    Responsibilities:
    - Fetch 67 sector metadata from database
    - Fetch Leontief 67×67 inverse matrix
    - Fetch pre-calculated output multipliers
    - Cache frequently accessed data
    - Provide data to calculation services

    This service is the ONLY place that interacts with the database
    for IBGE 67-sector data (Single Responsibility Principle).
    """

    def __init__(self):
        """Initialize economic data service with cache"""
        self.cache = get_cache_service()
        self._leontief_calculator_cache: Optional[LeontiefCalculator67] = None
        logger.info("✅ EconomicDataService67 initialized")

    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        with get_db() as conn:
            yield conn

    def get_all_sectors(self) -> List[Dict[str, Any]]:
        """
        Fetch all 67 IBGE sectors with metadata

        Returns:
            List of sector dictionaries

        Example:
            >>> service = EconomicDataService67()
            >>> sectors = service.get_all_sectors()
            >>> len(sectors)  # 67
            >>> sectors[0]['sector_name']  # 'Agricultura, inclusive o apoio...'
        """
        cache_key = "economic_67:all_sectors"

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
                    sector_id,
                    sector_code,
                    sector_name,
                    data_year,
                    data_source
                FROM ibge_io_sectors_67
                ORDER BY sector_id
            """)

            sectors = cursor.fetchall()
            cursor.close()

        # Cache for 10 minutes (longer than other data since it rarely changes)
        self.cache.set(cache_key, sectors, ttl=600)

        logger.info(f"✅ Fetched {len(sectors)} IBGE sectors from database")
        return sectors

    def get_sector_by_id(self, sector_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific sector by ID

        Args:
            sector_id: Sector ID (1-67)

        Returns:
            Sector dictionary or None if not found

        Example:
            >>> service = EconomicDataService67()
            >>> sector = service.get_sector_by_id(1)
            >>> sector['sector_name']  # 'Agricultura...'
        """
        cache_key = f"economic_67:sector:{sector_id}"

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
                    sector_id,
                    sector_code,
                    sector_name,
                    data_year,
                    data_source
                FROM ibge_io_sectors_67
                WHERE sector_id = %s
            """, (sector_id,))

            sector = cursor.fetchone()
            cursor.close()

        if sector:
            # Cache for 10 minutes
            self.cache.set(cache_key, sector, ttl=600)
            logger.debug(f"✅ Fetched sector: {sector['sector_name']}")
        else:
            logger.warning(f"⚠️  Sector not found: {sector_id}")

        return sector

    def get_leontief_matrix_data(self) -> List[Dict[str, Any]]:
        """
        Fetch Leontief inverse matrix (67×67) from database in sparse format

        Returns:
            List of matrix coefficients (only non-zero values)

        Example:
            >>> service = EconomicDataService67()
            >>> matrix = service.get_leontief_matrix_data()
            >>> len(matrix)  # ~4,357 non-zero entries
            >>> matrix[0]  # {'from_sector_id': 1, 'to_sector_id': 1, 'coefficient_value': 1.25}
        """
        cache_key = "economic_67:leontief_matrix"

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
                    from_sector_id,
                    to_sector_id,
                    coefficient_value,
                    data_year
                FROM ibge_io_matrices_67
                WHERE matrix_type = 'leontief_inverse'
                  AND data_year = 2015
                ORDER BY from_sector_id, to_sector_id
            """)

            matrix_data = cursor.fetchall()
            cursor.close()

        # Cache for 10 minutes
        self.cache.set(cache_key, matrix_data, ttl=600)

        logger.info(f"✅ Fetched Leontief 67×67 matrix ({len(matrix_data)} non-zero entries)")
        return matrix_data

    def get_output_multipliers(self) -> Dict[int, float]:
        """
        Fetch pre-calculated output multipliers for all 67 sectors

        Returns:
            Dictionary {sector_id: multiplier}

        Example:
            >>> service = EconomicDataService67()
            >>> multipliers = service.get_output_multipliers()
            >>> multipliers[15]  # Petroleum refining multiplier (~2.484)
        """
        cache_key = "economic_67:multipliers"

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
                    sector_id,
                    output_multiplier,
                    data_year
                FROM ibge_io_multipliers_67
                WHERE data_year = 2015
                ORDER BY sector_id
            """)

            rows = cursor.fetchall()
            cursor.close()

        # Convert to dictionary
        multipliers = {
            row['sector_id']: float(row['output_multiplier'])
            for row in rows
        }

        # Cache for 10 minutes
        self.cache.set(cache_key, multipliers, ttl=600)

        logger.info(f"✅ Fetched output multipliers for {len(multipliers)} sectors")
        return multipliers

    def get_top_sectors_by_multiplier(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get top N sectors by output multiplier

        Args:
            limit: Number of sectors to return (default: 20)

        Returns:
            List of sector dictionaries sorted by multiplier (descending)

        Example:
            >>> service = EconomicDataService67()
            >>> top10 = service.get_top_sectors_by_multiplier(limit=10)
            >>> top10[0]['sector_name']  # 'Abate e produtos de carne' (highest multiplier)
        """
        cache_key = f"economic_67:top_multipliers:{limit}"

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
                    s.sector_id,
                    s.sector_code,
                    s.sector_name,
                    m.output_multiplier
                FROM ibge_io_multipliers_67 m
                JOIN ibge_io_sectors_67 s ON m.sector_id = s.sector_id
                WHERE m.data_year = 2015
                ORDER BY m.output_multiplier DESC
                LIMIT %s
            """, (limit,))

            sectors = cursor.fetchall()
            cursor.close()

        # Cache for 10 minutes
        self.cache.set(cache_key, sectors, ttl=600)

        logger.info(f"✅ Fetched top {len(sectors)} sectors by multiplier")
        return sectors

    def get_leontief_calculator(
        self,
        use_sparse: bool = True
    ) -> LeontiefCalculator67:
        """
        Get or create cached LeontiefCalculator67 instance

        This method ensures we only create the calculator once and reuse it.
        The calculator is stateless, so it's safe to cache.

        Args:
            use_sparse: Whether to use sparse matrix format (default: True)

        Returns:
            Initialized LeontiefCalculator67

        Example:
            >>> service = EconomicDataService67()
            >>> calculator = service.get_leontief_calculator()
            >>> result = calculator.calculate_shock_impact(sector_id=15, investment_brl=10_000_000)
        """
        # Return cached calculator if available
        if self._leontief_calculator_cache:
            logger.debug("Using cached LeontiefCalculator67")
            return self._leontief_calculator_cache

        # Fetch data
        logger.info("Building LeontiefCalculator67 from database...")

        matrix_data = self.get_leontief_matrix_data()
        all_sectors = self.get_all_sectors()

        # Build sector metadata dictionary
        sector_metadata = {
            sector['sector_id']: {
                'sector_code': sector['sector_code'],
                'sector_name': sector['sector_name']
            }
            for sector in all_sectors
        }

        # Create calculator
        calculator = create_leontief_calculator_67_from_db(
            matrix_data=matrix_data,
            sector_metadata=sector_metadata,
            use_sparse=use_sparse
        )

        # Cache it
        self._leontief_calculator_cache = calculator

        logger.info("✅ Created and cached LeontiefCalculator67")
        return calculator

    def get_sector_aggregation_mapping(self) -> Dict[int, str]:
        """
        Get mapping from 67 sectors to 4 aggregate sectors

        Returns:
            Dictionary {sector_id_67: aggregate_sector_code}
            Where aggregate_sector_code is one of: 'agriculture', 'industry', 'services', 'public'

        Example:
            >>> service = EconomicDataService67()
            >>> mapping = service.get_sector_aggregation_mapping()
            >>> mapping[1]  # 'agriculture' (sector 1 maps to agriculture)
            >>> mapping[15]  # 'industry' (sector 15 maps to industry)
        """
        cache_key = "economic_67:aggregation_mapping"

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
                    sector_id_67,
                    aggregate_sector_code
                FROM ibge_io_sector_aggregation
                ORDER BY sector_id_67
            """)

            rows = cursor.fetchall()
            cursor.close()

        if not rows:
            # If aggregation table doesn't exist, return default mapping
            logger.warning("⚠️  Aggregation table not found, using default mapping")
            return self._get_default_aggregation_mapping()

        # Convert to dictionary
        mapping = {
            row['sector_id_67']: row['aggregate_sector_code']
            for row in rows
        }

        # Cache for 10 minutes
        self.cache.set(cache_key, mapping, ttl=600)

        logger.info(f"✅ Fetched aggregation mapping for {len(mapping)} sectors")
        return mapping

    def _get_default_aggregation_mapping(self) -> Dict[int, str]:
        """
        Generate default aggregation mapping (67 → 4 sectors)

        This is a fallback when the database table doesn't exist.
        Based on IBGE sector classification logic.

        Returns:
            Dictionary {sector_id: aggregate_sector}
        """
        # Default mapping based on typical IBGE classification
        # Sectors 1-3: Agriculture
        # Sectors 4-39: Industry
        # Sectors 40-61: Services
        # Sectors 62-67: Public administration

        mapping = {}

        for sector_id in range(1, 68):
            if 1 <= sector_id <= 3:
                mapping[sector_id] = 'agriculture'
            elif 4 <= sector_id <= 39:
                mapping[sector_id] = 'industry'
            elif 40 <= sector_id <= 61:
                mapping[sector_id] = 'services'
            else:  # 62-67
                mapping[sector_id] = 'public'

        logger.info("✅ Generated default aggregation mapping")
        return mapping

    def aggregate_67_to_4_sectors(
        self,
        sector_production_67: Dict[int, float]
    ) -> Dict[str, float]:
        """
        Aggregate 67-sector production to 4 aggregate sectors

        Args:
            sector_production_67: Production by 67 sectors {sector_id: production_brl}

        Returns:
            Production by 4 aggregate sectors {'agriculture': ..., 'industry': ..., 'services': ..., 'public': ...}

        Example:
            >>> service = EconomicDataService67()
            >>> production_67 = {1: 1000000, 2: 500000, 15: 2000000, ...}
            >>> production_4 = service.aggregate_67_to_4_sectors(production_67)
            >>> production_4['agriculture']  # Sum of sectors 1-3
            >>> production_4['industry']  # Sum of sectors 4-39
        """
        # Get aggregation mapping
        mapping = self.get_sector_aggregation_mapping()

        # Initialize aggregate production
        aggregate_production = {
            'agriculture': 0.0,
            'industry': 0.0,
            'services': 0.0,
            'public': 0.0
        }

        # Sum production by aggregate sector
        for sector_id, production in sector_production_67.items():
            aggregate_sector = mapping.get(sector_id)
            if aggregate_sector:
                aggregate_production[aggregate_sector] += production

        logger.debug(f"Aggregated 67 sectors → 4 sectors")
        return aggregate_production

    def clear_cache(self):
        """Clear all cached 67-sector economic data"""
        self.cache.clear()
        self._leontief_calculator_cache = None
        logger.info("✅ Economic 67-sector data cache cleared")


# Singleton instance
_economic_data_service_67 = None


def get_economic_data_service_67() -> EconomicDataService67:
    """
    Get singleton instance of EconomicDataService67

    Returns:
        Shared EconomicDataService67 instance

    Example:
        >>> service = get_economic_data_service_67()
        >>> sectors = service.get_all_sectors()
    """
    global _economic_data_service_67

    if _economic_data_service_67 is None:
        _economic_data_service_67 = EconomicDataService67()

    return _economic_data_service_67
