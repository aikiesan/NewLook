"""
CP2B Maps V3 - Leontief Calculator Service
Pure calculation engine for Input-Output economic analysis

SOLID Principles:
- Single Responsibility: Only handles Leontief matrix calculations
- Open/Closed: Extensible for new sectors without modification
- Liskov Substitution: Can be replaced with alternative calculation engines
- Interface Segregation: Focused interface for economic calculations
- Dependency Inversion: Depends on abstractions (numpy arrays) not concrete implementations

Author: CP2B Development Team
Date: 2025-11-30
"""

import logging
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class LeontiefResult:
    """
    Result of Leontief calculation

    Attributes:
        total_production: Production by sector (BRL)
        total_vab: VAB by sector (BRL)
        total_vab_sum: Total VAB across all sectors (BRL)
        economic_multiplier: Total VAB / Initial investment
        tax_revenue: Tax revenue generated (BRL)
        jobs_created: Total jobs created (count)
        vab_by_sector: Dictionary with sector names as keys
    """
    total_production: np.ndarray  # [agriculture, industry, services, public]
    total_vab: np.ndarray         # [agriculture, industry, services, public]
    total_vab_sum: float
    economic_multiplier: float
    tax_revenue: float
    jobs_created: int
    vab_by_sector: Dict[str, float]


class LeontiefCalculator:
    """
    Leontief Input-Output calculation engine.

    Handles all matrix operations and economic multiplier calculations.
    This class is stateless and thread-safe.

    Mathematical Foundation:
        Total Production: X = L × Y
        Where:
        - X = total production vector (direct + indirect)
        - L = Leontief inverse matrix (I - A)^-1
        - Y = shock vector (final demand / investment)

    Example:
        >>> calculator = LeontiefCalculator(
        ...     leontief_inverse=np.array([[1.25, 0.48, ...], ...]),
        ...     vab_coefficients={'agriculture': 0.699, ...},
        ...     employment_coefficients={'agriculture': 12.5, ...}
        ... )
        >>> result = calculator.calculate_shock_impact(
        ...     shock_vector=np.array([0, 10_000_000, 0, 0]),  # 10M in industry
        ...     tax_rate=0.18
        ... )
        >>> print(f"Total VAB: R$ {result.total_vab_sum:,.2f}")
    """

    # Sector names (order must match matrix columns)
    SECTORS = ['agriculture', 'industry', 'services', 'public']

    def __init__(
        self,
        leontief_inverse: np.ndarray,
        vab_coefficients: Dict[str, float],
        employment_coefficients: Dict[str, float]
    ):
        """
        Initialize Leontief calculator with economic parameters

        Args:
            leontief_inverse: 4×4 Leontief inverse matrix (I-A)^-1
            vab_coefficients: Production → VAB conversion by sector
            employment_coefficients: Jobs per million BRL VAB by sector

        Raises:
            ValueError: If matrix dimensions or coefficients are invalid
        """
        # Validate matrix dimensions
        if leontief_inverse.shape != (4, 4):
            raise ValueError(f"Leontief matrix must be 4×4, got {leontief_inverse.shape}")

        # Validate coefficients
        for sector in self.SECTORS:
            if sector not in vab_coefficients:
                raise ValueError(f"Missing VAB coefficient for sector: {sector}")
            if sector not in employment_coefficients:
                raise ValueError(f"Missing employment coefficient for sector: {sector}")

        self.L = leontief_inverse
        self.vab_coef = vab_coefficients
        self.employment_coef = employment_coefficients

        logger.info("✅ LeontiefCalculator initialized with 4×4 matrix")

    def calculate_total_production(self, shock_vector: np.ndarray) -> np.ndarray:
        """
        Calculate total production (direct + indirect) using Leontief equation.

        Formula: X = L × Y

        Args:
            shock_vector: Initial investment by sector [agri, industry, services, public]

        Returns:
            Total production vector [agri, industry, services, public]

        Example:
            >>> shock = np.array([0, 10_000_000, 0, 0])  # 10M in industry
            >>> production = calculator.calculate_total_production(shock)
            >>> # production = [4_800_000, 17_200_000, 4_500_000, 1_500_000]
        """
        if shock_vector.shape != (4,):
            raise ValueError(f"Shock vector must be length 4, got {shock_vector.shape}")

        # Matrix multiplication: X = L × Y
        total_production = self.L @ shock_vector

        logger.debug(f"Shock: {shock_vector} → Production: {total_production}")

        return total_production

    def production_to_vab(self, production: np.ndarray) -> np.ndarray:
        """
        Convert production to VAB (Gross Value Added) using sector coefficients.

        Formula: VAB_sector = Production_sector × VAB_coefficient_sector

        Args:
            production: Production by sector [agri, industry, services, public]

        Returns:
            VAB by sector [agri, industry, services, public]

        Example:
            >>> production = np.array([4_800_000, 17_200_000, 4_500_000, 1_500_000])
            >>> vab = calculator.production_to_vab(production)
            >>> # vab = [3_355_200, 5_005_200, 2_578_500, 1_425_000]
        """
        vab_coef_array = np.array([
            self.vab_coef['agriculture'],
            self.vab_coef['industry'],
            self.vab_coef['services'],
            self.vab_coef['public']
        ])

        vab = production * vab_coef_array

        logger.debug(f"Production: {production} → VAB: {vab}")

        return vab

    def calculate_tax_revenue(self, total_vab: float, tax_rate: float = 0.18) -> float:
        """
        Calculate tax revenue from total VAB.

        Formula: Tax = VAB × Tax_Rate

        Args:
            total_vab: Total VAB across all sectors (BRL)
            tax_rate: Effective tax rate (default: 18%)

        Returns:
            Tax revenue (BRL)

        Example:
            >>> vab = 12_364_000
            >>> tax = calculator.calculate_tax_revenue(vab, tax_rate=0.18)
            >>> # tax = 2_225_520
        """
        if tax_rate < 0 or tax_rate > 1:
            raise ValueError(f"Tax rate must be between 0 and 1, got {tax_rate}")

        tax_revenue = total_vab * tax_rate

        logger.debug(f"VAB: R$ {total_vab:,.2f} × {tax_rate*100}% = Tax: R$ {tax_revenue:,.2f}")

        return tax_revenue

    def calculate_jobs_created(self, vab_by_sector: np.ndarray) -> int:
        """
        Calculate total jobs created using employment coefficients.

        Formula: Jobs_sector = (VAB_sector / 1_000_000) × Employment_coefficient_sector

        Args:
            vab_by_sector: VAB by sector [agri, industry, services, public] in BRL

        Returns:
            Total jobs created (integer)

        Example:
            >>> vab = np.array([3_355_200, 5_005_200, 2_578_500, 1_425_000])
            >>> jobs = calculator.calculate_jobs_created(vab)
            >>> # jobs = 42 + 41 + 38 + 16 = 137
        """
        employment_coef_array = np.array([
            self.employment_coef['agriculture'],
            self.employment_coef['industry'],
            self.employment_coef['services'],
            self.employment_coef['public']
        ])

        # Convert VAB to millions, then multiply by coefficients
        vab_millions = vab_by_sector / 1_000_000
        jobs_by_sector = vab_millions * employment_coef_array
        total_jobs = int(np.sum(jobs_by_sector))

        logger.debug(f"VAB: {vab_by_sector} → Jobs: {total_jobs}")

        return total_jobs

    def calculate_shock_impact(
        self,
        shock_vector: np.ndarray,
        tax_rate: float = 0.18
    ) -> LeontiefResult:
        """
        Calculate complete economic impact of an investment shock.

        This is the main entry point for shock calculations. Performs:
        1. Calculate total production (Leontief equation)
        2. Convert production to VAB
        3. Calculate tax revenue
        4. Calculate jobs created
        5. Calculate economic multiplier

        Args:
            shock_vector: Initial investment by sector [agri, ind, serv, pub] in BRL
            tax_rate: Effective tax rate (default: 18%)

        Returns:
            LeontiefResult with complete impact analysis

        Example:
            >>> shock = np.array([0, 10_000_000, 0, 0])  # 10M in industry
            >>> result = calculator.calculate_shock_impact(shock, tax_rate=0.18)
            >>> print(f"Total VAB: R$ {result.total_vab_sum:,.2f}")
            >>> print(f"Multiplier: {result.economic_multiplier:.2f}×")
            >>> print(f"Jobs: {result.jobs_created}")
            >>> print(f"Tax Revenue: R$ {result.tax_revenue:,.2f}")
        """
        # Validate input
        if shock_vector.shape != (4,):
            raise ValueError(f"Shock vector must be length 4, got {shock_vector.shape}")

        initial_investment = np.sum(shock_vector)
        if initial_investment <= 0:
            raise ValueError(f"Investment must be positive, got {initial_investment}")

        logger.info(f"Calculating shock impact for investment: R$ {initial_investment:,.2f}")

        # Step 1: Calculate total production
        total_production = self.calculate_total_production(shock_vector)

        # Step 2: Convert to VAB
        vab_by_sector = self.production_to_vab(total_production)
        total_vab = float(np.sum(vab_by_sector))

        # Step 3: Calculate economic multiplier
        economic_multiplier = total_vab / initial_investment

        # Step 4: Calculate tax revenue
        tax_revenue = self.calculate_tax_revenue(total_vab, tax_rate)

        # Step 5: Calculate jobs created
        jobs_created = self.calculate_jobs_created(vab_by_sector)

        # Create result
        result = LeontiefResult(
            total_production=total_production,
            total_vab=vab_by_sector,
            total_vab_sum=total_vab,
            economic_multiplier=economic_multiplier,
            tax_revenue=tax_revenue,
            jobs_created=jobs_created,
            vab_by_sector={
                'agriculture': float(vab_by_sector[0]),
                'industry': float(vab_by_sector[1]),
                'services': float(vab_by_sector[2]),
                'public': float(vab_by_sector[3])
            }
        )

        logger.info(f"✅ Shock impact calculated:")
        logger.info(f"   Total VAB: R$ {total_vab:,.2f}")
        logger.info(f"   Multiplier: {economic_multiplier:.2f}×")
        logger.info(f"   Jobs: {jobs_created}")
        logger.info(f"   Tax Revenue: R$ {tax_revenue:,.2f}")

        return result

    def get_sector_multipliers(self) -> Dict[str, float]:
        """
        Calculate output multipliers for each sector.

        Multiplier = sum of column in Leontief inverse matrix
        Shows total economic output generated per BRL invested in each sector.

        Returns:
            Dictionary of {sector: multiplier}

        Example:
            >>> multipliers = calculator.get_sector_multipliers()
            >>> # {'agriculture': 1.96, 'industry': 2.80, 'services': 2.50, 'public': 2.00}
        """
        column_sums = np.sum(self.L, axis=0)  # Sum each column

        multipliers = {
            sector: float(column_sums[i])
            for i, sector in enumerate(self.SECTORS)
        }

        logger.debug(f"Sector multipliers: {multipliers}")

        return multipliers

    def validate_matrix(self) -> bool:
        """
        Validate Leontief inverse matrix properties.

        Checks:
        1. Diagonal elements > 1.0 (required for valid Leontief inverse)
        2. All elements are positive (typical for modern economy)
        3. Column sums (multipliers) are reasonable (1.5 - 4.0)

        Returns:
            True if matrix is valid

        Raises:
            ValueError: If matrix fails validation
        """
        # Check 1: Diagonal elements > 1.0
        diagonal = np.diag(self.L)
        if not np.all(diagonal > 1.0):
            raise ValueError(f"Leontief matrix diagonal must be > 1.0, got {diagonal}")

        # Check 2: All elements positive
        if not np.all(self.L >= 0):
            raise ValueError("Leontief matrix must have all non-negative elements")

        # Check 3: Reasonable multipliers
        multipliers = self.get_sector_multipliers()
        for sector, mult in multipliers.items():
            if mult < 1.0 or mult > 5.0:
                logger.warning(f"⚠️  Unusual multiplier for {sector}: {mult:.2f}")

        logger.info("✅ Leontief matrix validation passed")
        return True


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_leontief_calculator_from_db(
    leontief_matrix_rows: List[Dict],
    conversion_factors: Dict[str, Dict]
) -> LeontiefCalculator:
    """
    Factory function to create LeontiefCalculator from database rows.

    Args:
        leontief_matrix_rows: List of database rows with matrix data
        conversion_factors: Dictionary of conversion factors from database

    Returns:
        Initialized LeontiefCalculator

    Example:
        >>> # From database query results
        >>> calculator = create_leontief_calculator_from_db(
        ...     leontief_matrix_rows=[
        ...         {'from_sector': 'agriculture', 'to_agriculture': 1.25, ...},
        ...         ...
        ...     ],
        ...     conversion_factors={
        ...         'vab_coefficient': {'agriculture': 0.699, ...},
        ...         'employment': {'agriculture': 12.5, ...}
        ...     }
        ... )
    """
    # Build Leontief inverse matrix
    leontief_inverse = np.zeros((4, 4))
    sector_index = {
        'agriculture': 0,
        'industry': 1,
        'services': 2,
        'public': 3
    }

    for row in leontief_matrix_rows:
        if row['matrix_type'] != 'leontief_inverse':
            continue

        i = sector_index[row['from_sector']]
        leontief_inverse[i, 0] = row['to_agriculture']
        leontief_inverse[i, 1] = row['to_industry']
        leontief_inverse[i, 2] = row['to_services']
        leontief_inverse[i, 3] = row['to_public']

    # Extract coefficients
    vab_coefficients = conversion_factors.get('vab_coefficient', {})
    employment_coefficients = conversion_factors.get('employment', {})

    # Create calculator
    calculator = LeontiefCalculator(
        leontief_inverse=leontief_inverse,
        vab_coefficients=vab_coefficients,
        employment_coefficients=employment_coefficients
    )

    # Validate matrix
    calculator.validate_matrix()

    return calculator
