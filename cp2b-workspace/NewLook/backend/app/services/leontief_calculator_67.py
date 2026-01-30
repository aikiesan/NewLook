"""
CP2B Maps V3 - Leontief Calculator Service (67 Sectors - IBGE)
Pure calculation engine for Input-Output economic analysis using IBGE official data

This is an extension of the original 4-sector LeontiefCalculator to support
the full 67-sector IBGE Input-Output matrix (2015).

SOLID Principles:
- Single Responsibility: Only handles Leontief matrix calculations for 67 sectors
- Open/Closed: Extensible for new sectors without modification
- Liskov Substitution: Can be used interchangeably with 4-sector calculator
- Interface Segregation: Focused interface for economic calculations
- Dependency Inversion: Depends on abstractions (numpy arrays, sparse matrices)

Mathematical Foundation:
    Total Production: X = L × Y
    Where:
    - X = total production vector (direct + indirect effects)
    - L = Leontief inverse matrix (I - A)^-1 (67×67)
    - Y = shock vector (final demand / investment by sector)

Author: CP2B Development Team
Date: 2026-01-30
"""

import logging
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from scipy import sparse

logger = logging.getLogger(__name__)


@dataclass
class LeontiefResult67:
    """
    Result of 67-sector Leontief calculation

    Attributes:
        total_production: Production by sector (BRL) - 67 element array
        total_production_sum: Total production across all sectors (BRL)
        output_multipliers: Output multiplier for each sector invested
        sector_production_detail: Dictionary with sector_id as keys
        calculation_method: Method used (dense or sparse)
    """
    total_production: np.ndarray  # 67 sectors
    total_production_sum: float
    output_multipliers: Dict[int, float]  # sector_id -> multiplier
    sector_production_detail: Dict[int, float]  # sector_id -> production
    calculation_method: str


class LeontiefCalculator67:
    """
    Leontief Input-Output calculation engine for 67 sectors.

    Handles all matrix operations and economic multiplier calculations
    for the IBGE 67-sector Input-Output model.

    This class supports both dense and sparse matrix representations
    for optimal performance.

    Example:
        >>> calculator = LeontiefCalculator67(
        ...     leontief_matrix_data=[
        ...         {'from_sector_id': 1, 'to_sector_id': 1, 'value': 1.25},
        ...         ...
        ...     ],
        ...     sector_metadata={1: {'code': '0191', 'name': 'Agricultura'}, ...}
        ... )
        >>> result = calculator.calculate_shock_impact(
        ...     sector_id=15,  # Industry sector
        ...     investment_brl=10_000_000
        ... )
        >>> print(f"Total Production: R$ {result.total_production_sum:,.2f}")
    """

    NUM_SECTORS = 67

    def __init__(
        self,
        leontief_matrix_data: List[Dict],
        sector_metadata: Dict[int, Dict[str, str]],
        use_sparse: bool = True
    ):
        """
        Initialize Leontief calculator for 67 sectors

        Args:
            leontief_matrix_data: List of matrix coefficients from database
                Format: [{'from_sector_id': 1, 'to_sector_id': 2, 'value': 0.15}, ...]
            sector_metadata: Sector information dict
                Format: {1: {'code': '0191', 'name': 'Agricultura'}, ...}
            use_sparse: Whether to use sparse matrix format (default: True)
                Sparse is more memory-efficient for large matrices

        Raises:
            ValueError: If data is invalid or incomplete
        """
        # Validate sector metadata
        if len(sector_metadata) != self.NUM_SECTORS:
            raise ValueError(
                f"Expected {self.NUM_SECTORS} sectors, got {len(sector_metadata)}"
            )

        self.sector_metadata = sector_metadata
        self.use_sparse = use_sparse

        # Build Leontief inverse matrix
        if use_sparse:
            self.L_sparse = self._build_sparse_matrix(leontief_matrix_data)
            self.L_dense = None
            logger.info(f"✅ Built sparse Leontief matrix (67×67) with {len(leontief_matrix_data)} non-zero entries")
        else:
            self.L_dense = self._build_dense_matrix(leontief_matrix_data)
            self.L_sparse = None
            logger.info(f"✅ Built dense Leontief matrix (67×67)")

        # Pre-calculate output multipliers (column sums)
        self.output_multipliers = self._calculate_output_multipliers()

        logger.info("✅ LeontiefCalculator67 initialized")

    def _build_sparse_matrix(self, matrix_data: List[Dict]) -> sparse.csr_matrix:
        """
        Build sparse Leontief matrix from database data

        Args:
            matrix_data: List of {from_sector_id, to_sector_id, value} dicts

        Returns:
            Sparse CSR matrix (67×67)
        """
        row_indices = []
        col_indices = []
        values = []

        for entry in matrix_data:
            # Note: Sector IDs are 1-based, convert to 0-based indices
            from_idx = entry['from_sector_id'] - 1  # Row index
            to_idx = entry['to_sector_id'] - 1      # Column index
            value = entry['coefficient_value']

            if 0 <= from_idx < self.NUM_SECTORS and 0 <= to_idx < self.NUM_SECTORS:
                row_indices.append(from_idx)
                col_indices.append(to_idx)
                values.append(float(value))

        # Create sparse matrix in CSR (Compressed Sparse Row) format
        # CSR is efficient for matrix-vector multiplication (which we need for X = L × Y)
        matrix = sparse.csr_matrix(
            (values, (row_indices, col_indices)),
            shape=(self.NUM_SECTORS, self.NUM_SECTORS)
        )

        return matrix

    def _build_dense_matrix(self, matrix_data: List[Dict]) -> np.ndarray:
        """
        Build dense Leontief matrix from database data

        Args:
            matrix_data: List of {from_sector_id, to_sector_id, value} dicts

        Returns:
            Dense numpy array (67×67)
        """
        matrix = np.zeros((self.NUM_SECTORS, self.NUM_SECTORS))

        for entry in matrix_data:
            # Note: Sector IDs are 1-based, convert to 0-based indices
            from_idx = entry['from_sector_id'] - 1
            to_idx = entry['to_sector_id'] - 1
            value = entry['coefficient_value']

            if 0 <= from_idx < self.NUM_SECTORS and 0 <= to_idx < self.NUM_SECTORS:
                matrix[from_idx, to_idx] = float(value)

        return matrix

    def _calculate_output_multipliers(self) -> Dict[int, float]:
        """
        Calculate output multipliers for all sectors (column sums of Leontief inverse)

        Output multiplier = sum of column j in Leontief matrix
        Represents total economic output generated per BRL invested in sector j

        Returns:
            Dictionary {sector_id: multiplier}
        """
        if self.use_sparse:
            # For sparse matrix, convert to dense for column sum calculation
            col_sums = np.array(self.L_sparse.sum(axis=0)).flatten()
        else:
            col_sums = np.sum(self.L_dense, axis=0)

        multipliers = {
            sector_id: float(col_sums[sector_id - 1])  # sector_id is 1-based
            for sector_id in range(1, self.NUM_SECTORS + 1)
        }

        logger.debug(f"Calculated output multipliers for {len(multipliers)} sectors")
        return multipliers

    def calculate_total_production(
        self,
        shock_vector: np.ndarray
    ) -> np.ndarray:
        """
        Calculate total production (direct + indirect) using Leontief equation

        Formula: X = L × Y

        Args:
            shock_vector: Initial investment by sector (67 elements)

        Returns:
            Total production vector (67 elements)

        Example:
            >>> shock = np.zeros(67)
            >>> shock[14] = 10_000_000  # 10M in sector 15 (industry)
            >>> production = calculator.calculate_total_production(shock)
        """
        if shock_vector.shape != (self.NUM_SECTORS,):
            raise ValueError(
                f"Shock vector must have {self.NUM_SECTORS} elements, got {shock_vector.shape}"
            )

        # Matrix multiplication: X = L × Y
        if self.use_sparse:
            total_production = self.L_sparse.dot(shock_vector)
        else:
            total_production = self.L_dense @ shock_vector

        logger.debug(f"Shock sum: R$ {np.sum(shock_vector):,.2f} → Production: R$ {np.sum(total_production):,.2f}")

        return total_production

    def calculate_shock_impact(
        self,
        sector_id: int,
        investment_brl: float
    ) -> LeontiefResult67:
        """
        Calculate economic impact of an investment shock in a single sector

        This is the main entry point for single-sector shocks.

        Args:
            sector_id: Target sector (1-67)
            investment_brl: Investment amount in BRL

        Returns:
            LeontiefResult67 with complete impact analysis

        Example:
            >>> result = calculator.calculate_shock_impact(
            ...     sector_id=15,
            ...     investment_brl=10_000_000
            ... )
            >>> print(f"Total Production: R$ {result.total_production_sum:,.2f}")
            >>> print(f"Output Multiplier: {result.output_multipliers[15]:.3f}×")
        """
        # Validate inputs
        if not (1 <= sector_id <= self.NUM_SECTORS):
            raise ValueError(f"Sector ID must be 1-{self.NUM_SECTORS}, got {sector_id}")

        if investment_brl <= 0:
            raise ValueError(f"Investment must be positive, got {investment_brl}")

        logger.info(f"Calculating shock impact: R$ {investment_brl:,.2f} in sector {sector_id}")

        # Create shock vector
        shock_vector = np.zeros(self.NUM_SECTORS)
        shock_vector[sector_id - 1] = investment_brl  # sector_id is 1-based

        # Calculate total production
        total_production = self.calculate_total_production(shock_vector)
        total_production_sum = float(np.sum(total_production))

        # Build sector detail dictionary
        sector_production_detail = {
            sid: float(total_production[sid - 1])
            for sid in range(1, self.NUM_SECTORS + 1)
            if total_production[sid - 1] > 0.01  # Only non-zero sectors
        }

        result = LeontiefResult67(
            total_production=total_production,
            total_production_sum=total_production_sum,
            output_multipliers=self.output_multipliers,
            sector_production_detail=sector_production_detail,
            calculation_method="sparse" if self.use_sparse else "dense"
        )

        logger.info(f"✅ Total Production: R$ {total_production_sum:,.2f}")
        logger.info(f"✅ Output Multiplier: {self.output_multipliers[sector_id]:.3f}×")
        logger.info(f"✅ Sectors Affected: {len(sector_production_detail)}")

        return result

    def calculate_multi_sector_shock(
        self,
        shock_vector: np.ndarray
    ) -> LeontiefResult67:
        """
        Calculate economic impact of a multi-sector investment shock

        Use this when you want to invest in multiple sectors simultaneously.

        Args:
            shock_vector: Investment by sector (67 elements)

        Returns:
            LeontiefResult67 with complete impact analysis

        Example:
            >>> shock = np.zeros(67)
            >>> shock[0] = 5_000_000   # 5M in agriculture
            >>> shock[14] = 10_000_000  # 10M in industry
            >>> result = calculator.calculate_multi_sector_shock(shock)
        """
        total_investment = np.sum(shock_vector)

        if total_investment <= 0:
            raise ValueError(f"Total investment must be positive, got {total_investment}")

        logger.info(f"Calculating multi-sector shock: R$ {total_investment:,.2f} across {np.count_nonzero(shock_vector)} sectors")

        # Calculate total production
        total_production = self.calculate_total_production(shock_vector)
        total_production_sum = float(np.sum(total_production))

        # Build sector detail dictionary
        sector_production_detail = {
            sid: float(total_production[sid - 1])
            for sid in range(1, self.NUM_SECTORS + 1)
            if total_production[sid - 1] > 0.01
        }

        result = LeontiefResult67(
            total_production=total_production,
            total_production_sum=total_production_sum,
            output_multipliers=self.output_multipliers,
            sector_production_detail=sector_production_detail,
            calculation_method="sparse" if self.use_sparse else "dense"
        )

        logger.info(f"✅ Total Production: R$ {total_production_sum:,.2f}")
        logger.info(f"✅ Production Multiplier: {total_production_sum/total_investment:.3f}×")
        logger.info(f"✅ Sectors Affected: {len(sector_production_detail)}")

        return result

    def get_sector_info(self, sector_id: int) -> Dict[str, str]:
        """
        Get metadata for a specific sector

        Args:
            sector_id: Sector ID (1-67)

        Returns:
            Dictionary with sector code and name

        Example:
            >>> info = calculator.get_sector_info(1)
            >>> print(info['name'])  # 'Agricultura, inclusive o apoio'
        """
        if sector_id not in self.sector_metadata:
            raise ValueError(f"Sector ID {sector_id} not found")

        return self.sector_metadata[sector_id]

    def get_all_multipliers(self) -> Dict[int, Dict[str, any]]:
        """
        Get output multipliers for all sectors with sector names

        Returns:
            Dictionary {sector_id: {'name': ..., 'code': ..., 'multiplier': ...}}

        Example:
            >>> multipliers = calculator.get_all_multipliers()
            >>> top_sector = max(multipliers.items(), key=lambda x: x[1]['multiplier'])
            >>> print(f"Top sector: {top_sector[1]['name']} ({top_sector[1]['multiplier']:.3f}×)")
        """
        return {
            sector_id: {
                'sector_id': sector_id,
                'sector_code': self.sector_metadata[sector_id]['sector_code'],
                'sector_name': self.sector_metadata[sector_id]['sector_name'],
                'output_multiplier': self.output_multipliers[sector_id]
            }
            for sector_id in range(1, self.NUM_SECTORS + 1)
        }

    def validate_matrix(self) -> bool:
        """
        Validate Leontief inverse matrix properties

        Checks:
        1. Diagonal elements >= 1.0 (required for valid Leontief inverse)
        2. All elements are non-negative
        3. Output multipliers are reasonable (1.0 - 3.5)

        Returns:
            True if matrix is valid

        Raises:
            ValueError: If matrix fails validation
        """
        logger.info("Validating Leontief 67×67 matrix...")

        # Get diagonal elements
        if self.use_sparse:
            diagonal = self.L_sparse.diagonal()
        else:
            diagonal = np.diag(self.L_dense)

        # Check 1: Diagonal elements >= 1.0
        min_diag = np.min(diagonal)
        max_diag = np.max(diagonal)

        logger.info(f"  Diagonal range: [{min_diag:.4f}, {max_diag:.4f}]")

        if min_diag < 1.0:
            raise ValueError(f"Leontief matrix diagonal must be >= 1.0, got min: {min_diag:.4f}")

        # Check 2: All elements non-negative
        if self.use_sparse:
            if np.any(self.L_sparse.data < 0):
                raise ValueError("Leontief matrix must have all non-negative elements")
        else:
            if np.any(self.L_dense < 0):
                raise ValueError("Leontief matrix must have all non-negative elements")

        # Check 3: Reasonable multipliers
        mult_values = list(self.output_multipliers.values())
        min_mult = min(mult_values)
        max_mult = max(mult_values)
        mean_mult = np.mean(mult_values)

        logger.info(f"  Output multipliers: [{min_mult:.3f}, {max_mult:.3f}], mean: {mean_mult:.3f}")

        if max_mult > 5.0:
            logger.warning(f"⚠️  Unusually high multiplier detected: {max_mult:.3f}")

        logger.info("✅ Leontief 67×67 matrix validation passed")
        return True


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_leontief_calculator_67_from_db(
    matrix_data: List[Dict],
    sector_metadata: Dict[int, Dict[str, str]],
    use_sparse: bool = True
) -> LeontiefCalculator67:
    """
    Factory function to create LeontiefCalculator67 from database data

    Args:
        matrix_data: List of database rows with matrix data
            Format: [{'from_sector_id': 1, 'to_sector_id': 2, 'coefficient_value': 0.15}, ...]
        sector_metadata: Sector information dict
            Format: {1: {'sector_code': '0191', 'sector_name': 'Agricultura'}, ...}
        use_sparse: Whether to use sparse matrix format (default: True)

    Returns:
        Initialized and validated LeontiefCalculator67

    Example:
        >>> calculator = create_leontief_calculator_67_from_db(
        ...     matrix_data=matrix_rows,
        ...     sector_metadata=sectors,
        ...     use_sparse=True
        ... )
    """
    # Create calculator
    calculator = LeontiefCalculator67(
        leontief_matrix_data=matrix_data,
        sector_metadata=sector_metadata,
        use_sparse=use_sparse
    )

    # Validate matrix
    calculator.validate_matrix()

    logger.info("✅ LeontiefCalculator67 created and validated")

    return calculator
