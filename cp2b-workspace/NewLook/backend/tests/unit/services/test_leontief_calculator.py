"""
Tests for Leontief Calculator Service
Tests Input-Output economic analysis calculations
"""

import pytest
import numpy as np
from numpy.testing import assert_array_almost_equal

from app.services.leontief_calculator import (
    LeontiefCalculator,
    LeontiefResult,
    create_leontief_calculator_from_db,
)


class TestLeontiefCalculator:
    """Test LeontiefCalculator class"""

    @pytest.fixture
    def sample_leontief_matrix(self):
        """Sample Leontief inverse matrix (4×4)"""
        # Realistic values based on economic structure
        return np.array([
            [1.25, 0.48, 0.22, 0.15],  # Agriculture
            [0.35, 1.72, 0.28, 0.20],  # Industry
            [0.25, 0.45, 1.57, 0.30],  # Services
            [0.11, 0.15, 0.18, 1.50],  # Public
        ])

    @pytest.fixture
    def sample_vab_coefficients(self):
        """Sample VAB (Gross Value Added) coefficients"""
        return {
            'agriculture': 0.699,
            'industry': 0.291,
            'services': 0.573,
            'public': 0.950,
        }

    @pytest.fixture
    def sample_employment_coefficients(self):
        """Sample employment coefficients (jobs per million BRL VAB)"""
        return {
            'agriculture': 12.5,
            'industry': 8.2,
            'services': 14.8,
            'public': 11.3,
        }

    @pytest.fixture
    def calculator(
        self, sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients
    ):
        """Create calculator instance for testing"""
        return LeontiefCalculator(
            leontief_inverse=sample_leontief_matrix,
            vab_coefficients=sample_vab_coefficients,
            employment_coefficients=sample_employment_coefficients,
        )

    def test_initialization_success(
        self, sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients
    ):
        """Test successful calculator initialization"""
        calculator = LeontiefCalculator(
            leontief_inverse=sample_leontief_matrix,
            vab_coefficients=sample_vab_coefficients,
            employment_coefficients=sample_employment_coefficients,
        )

        assert calculator.L.shape == (4, 4)
        assert calculator.vab_coef == sample_vab_coefficients
        assert calculator.employment_coef == sample_employment_coefficients

    def test_initialization_invalid_matrix_shape(
        self, sample_vab_coefficients, sample_employment_coefficients
    ):
        """Test initialization fails with wrong matrix shape"""
        invalid_matrix = np.array([[1.0, 0.5], [0.3, 1.2]])  # 2×2 instead of 4×4

        with pytest.raises(ValueError, match="must be 4×4"):
            LeontiefCalculator(
                leontief_inverse=invalid_matrix,
                vab_coefficients=sample_vab_coefficients,
                employment_coefficients=sample_employment_coefficients,
            )

    def test_initialization_missing_vab_coefficient(
        self, sample_leontief_matrix, sample_employment_coefficients
    ):
        """Test initialization fails with missing VAB coefficient"""
        incomplete_vab = {
            'agriculture': 0.699,
            'industry': 0.291,
            # Missing 'services' and 'public'
        }

        with pytest.raises(ValueError, match="Missing VAB coefficient"):
            LeontiefCalculator(
                leontief_inverse=sample_leontief_matrix,
                vab_coefficients=incomplete_vab,
                employment_coefficients=sample_employment_coefficients,
            )

    def test_initialization_missing_employment_coefficient(
        self, sample_leontief_matrix, sample_vab_coefficients
    ):
        """Test initialization fails with missing employment coefficient"""
        incomplete_employment = {
            'agriculture': 12.5,
            'industry': 8.2,
            # Missing 'services' and 'public'
        }

        with pytest.raises(ValueError, match="Missing employment coefficient"):
            LeontiefCalculator(
                leontief_inverse=sample_leontief_matrix,
                vab_coefficients=sample_vab_coefficients,
                employment_coefficients=incomplete_employment,
            )

    def test_calculate_total_production(self, calculator):
        """Test total production calculation (Leontief equation)"""
        # 10M investment in industry
        shock = np.array([0, 10_000_000, 0, 0])

        production = calculator.calculate_total_production(shock)

        # Verify shape and values
        assert production.shape == (4,)
        assert production[1] >= 10_000_000  # Industry should be at least the shock value
        assert np.all(production >= 0)  # All production should be non-negative

        # Verify production follows economic logic
        # With our sample matrix, industry column is [0.48, 1.72, 0.45, 0.15]
        # So production should be close to these values × 10M
        expected_production = calculator.L @ shock
        assert_array_almost_equal(production, expected_production)

    def test_calculate_total_production_invalid_shape(self, calculator):
        """Test production calculation fails with wrong shock vector shape"""
        invalid_shock = np.array([1, 2, 3])  # Only 3 elements

        with pytest.raises(ValueError, match="must be length 4"):
            calculator.calculate_total_production(invalid_shock)

    def test_calculate_total_production_all_sectors(self, calculator):
        """Test production calculation with investment in all sectors"""
        shock = np.array([1_000_000, 2_000_000, 1_500_000, 500_000])

        production = calculator.calculate_total_production(shock)

        # Total production should be greater than initial shock due to multiplier effect
        assert np.sum(production) > np.sum(shock)

    def test_production_to_vab(self, calculator):
        """Test conversion of production to VAB"""
        production = np.array([5_000_000, 10_000_000, 7_000_000, 3_000_000])

        vab = calculator.production_to_vab(production)

        # Verify shape
        assert vab.shape == (4,)

        # Verify calculations
        assert vab[0] == pytest.approx(5_000_000 * 0.699)  # Agriculture
        assert vab[1] == pytest.approx(10_000_000 * 0.291)  # Industry
        assert vab[2] == pytest.approx(7_000_000 * 0.573)  # Services
        assert vab[3] == pytest.approx(3_000_000 * 0.950)  # Public

    def test_production_to_vab_zero_production(self, calculator):
        """Test VAB calculation with zero production"""
        production = np.array([0, 0, 0, 0])

        vab = calculator.production_to_vab(production)

        assert_array_almost_equal(vab, np.zeros(4))

    def test_calculate_tax_revenue(self, calculator):
        """Test tax revenue calculation"""
        total_vab = 10_000_000
        tax_rate = 0.18

        tax = calculator.calculate_tax_revenue(total_vab, tax_rate)

        assert tax == pytest.approx(1_800_000)

    def test_calculate_tax_revenue_different_rates(self, calculator):
        """Test tax revenue with different tax rates"""
        total_vab = 10_000_000

        # Test various rates
        assert calculator.calculate_tax_revenue(total_vab, 0.0) == 0
        assert calculator.calculate_tax_revenue(total_vab, 0.15) == pytest.approx(1_500_000)
        assert calculator.calculate_tax_revenue(total_vab, 0.25) == pytest.approx(2_500_000)
        assert calculator.calculate_tax_revenue(total_vab, 1.0) == pytest.approx(10_000_000)

    def test_calculate_tax_revenue_invalid_rate(self, calculator):
        """Test tax revenue fails with invalid tax rate"""
        total_vab = 10_000_000

        with pytest.raises(ValueError, match="must be between 0 and 1"):
            calculator.calculate_tax_revenue(total_vab, -0.1)

        with pytest.raises(ValueError, match="must be between 0 and 1"):
            calculator.calculate_tax_revenue(total_vab, 1.5)

    def test_calculate_jobs_created(self, calculator):
        """Test jobs creation calculation"""
        vab = np.array([3_000_000, 5_000_000, 4_000_000, 2_000_000])

        jobs = calculator.calculate_jobs_created(vab)

        # Expected: (3M/1M)*12.5 + (5M/1M)*8.2 + (4M/1M)*14.8 + (2M/1M)*11.3
        #         = 37.5 + 41.0 + 59.2 + 22.6 = 160.3 ≈ 160 jobs
        expected = int((3 * 12.5) + (5 * 8.2) + (4 * 14.8) + (2 * 11.3))
        assert jobs == expected

    def test_calculate_jobs_created_zero_vab(self, calculator):
        """Test jobs calculation with zero VAB"""
        vab = np.array([0, 0, 0, 0])

        jobs = calculator.calculate_jobs_created(vab)

        assert jobs == 0

    def test_calculate_jobs_created_returns_integer(self, calculator):
        """Test jobs calculation returns integer"""
        vab = np.array([1_234_567, 2_345_678, 3_456_789, 4_567_890])

        jobs = calculator.calculate_jobs_created(vab)

        assert isinstance(jobs, int)

    def test_calculate_shock_impact_complete(self, calculator):
        """Test complete shock impact calculation"""
        shock = np.array([0, 10_000_000, 0, 0])  # 10M in industry
        tax_rate = 0.18

        result = calculator.calculate_shock_impact(shock, tax_rate)

        # Verify result structure
        assert isinstance(result, LeontiefResult)
        assert result.total_production.shape == (4,)
        assert result.total_vab.shape == (4,)
        assert isinstance(result.total_vab_sum, float)
        assert isinstance(result.economic_multiplier, float)
        assert isinstance(result.tax_revenue, float)
        assert isinstance(result.jobs_created, int)
        assert isinstance(result.vab_by_sector, dict)

        # Verify economic logic
        assert result.total_vab_sum > 0
        assert result.economic_multiplier > 0  # Should have positive multiplier
        assert result.tax_revenue == pytest.approx(result.total_vab_sum * tax_rate)
        assert result.jobs_created >= 0

        # Verify VAB by sector dictionary
        assert set(result.vab_by_sector.keys()) == {
            'agriculture',
            'industry',
            'services',
            'public',
        }
        assert result.vab_by_sector['agriculture'] == pytest.approx(float(result.total_vab[0]))
        assert result.vab_by_sector['industry'] == pytest.approx(float(result.total_vab[1]))

    def test_calculate_shock_impact_multiplier_logic(self, calculator):
        """Test economic multiplier is correctly calculated"""
        shock = np.array([0, 10_000_000, 0, 0])

        result = calculator.calculate_shock_impact(shock, tax_rate=0.18)

        # Multiplier = Total VAB / Initial Investment
        expected_multiplier = result.total_vab_sum / 10_000_000
        assert result.economic_multiplier == pytest.approx(expected_multiplier)

        # Multiplier should typically be between 0.5 and 3.0 for realistic economies
        assert 0.5 < result.economic_multiplier < 3.0

    def test_calculate_shock_impact_zero_investment(self, calculator):
        """Test shock impact fails with zero investment"""
        shock = np.array([0, 0, 0, 0])

        with pytest.raises(ValueError, match="Investment must be positive"):
            calculator.calculate_shock_impact(shock)

    def test_calculate_shock_impact_negative_investment(self, calculator):
        """Test shock impact fails with negative investment"""
        shock = np.array([0, -1_000_000, 0, 0])

        with pytest.raises(ValueError, match="Investment must be positive"):
            calculator.calculate_shock_impact(shock)

    def test_calculate_shock_impact_invalid_shape(self, calculator):
        """Test shock impact fails with wrong shock vector shape"""
        shock = np.array([1_000_000, 2_000_000])  # Only 2 elements

        with pytest.raises(ValueError, match="must be length 4"):
            calculator.calculate_shock_impact(shock)

    def test_calculate_shock_impact_all_sectors(self, calculator):
        """Test shock impact with investment across all sectors"""
        shock = np.array([2_000_000, 3_000_000, 2_500_000, 1_500_000])

        result = calculator.calculate_shock_impact(shock, tax_rate=0.20)

        # Total investment
        total_investment = 9_000_000

        # Verify multiplier
        assert result.economic_multiplier == pytest.approx(result.total_vab_sum / total_investment)

        # Verify tax with 20% rate
        assert result.tax_revenue == pytest.approx(result.total_vab_sum * 0.20)

    def test_get_sector_multipliers(self, calculator):
        """Test sector multiplier calculation"""
        multipliers = calculator.get_sector_multipliers()

        # Verify structure
        assert isinstance(multipliers, dict)
        assert set(multipliers.keys()) == {'agriculture', 'industry', 'services', 'public'}

        # Verify values are reasonable
        for sector, mult in multipliers.items():
            assert isinstance(mult, float)
            assert mult > 1.0  # Multiplier should be > 1 for valid Leontief matrix
            assert mult < 5.0  # Should be reasonable for modern economy

        # Verify calculation (sum of columns)
        expected_agri = np.sum(calculator.L[:, 0])
        assert multipliers['agriculture'] == pytest.approx(expected_agri)

    def test_validate_matrix_success(self, calculator):
        """Test matrix validation passes for valid matrix"""
        assert calculator.validate_matrix() is True

    def test_validate_matrix_diagonal_check(self, sample_vab_coefficients, sample_employment_coefficients):
        """Test matrix validation fails if diagonal elements <= 1.0"""
        # Create matrix with diagonal element <= 1.0
        invalid_matrix = np.array([
            [0.95, 0.48, 0.22, 0.15],  # Diagonal < 1.0
            [0.35, 1.72, 0.28, 0.20],
            [0.25, 0.45, 1.57, 0.30],
            [0.11, 0.15, 0.18, 1.50],
        ])

        calculator = LeontiefCalculator(
            leontief_inverse=invalid_matrix,
            vab_coefficients=sample_vab_coefficients,
            employment_coefficients=sample_employment_coefficients,
        )

        with pytest.raises(ValueError, match="diagonal must be > 1.0"):
            calculator.validate_matrix()

    def test_validate_matrix_negative_elements(
        self, sample_vab_coefficients, sample_employment_coefficients
    ):
        """Test matrix validation fails with negative elements"""
        invalid_matrix = np.array([
            [1.25, -0.48, 0.22, 0.15],  # Negative element
            [0.35, 1.72, 0.28, 0.20],
            [0.25, 0.45, 1.57, 0.30],
            [0.11, 0.15, 0.18, 1.50],
        ])

        calculator = LeontiefCalculator(
            leontief_inverse=invalid_matrix,
            vab_coefficients=sample_vab_coefficients,
            employment_coefficients=sample_employment_coefficients,
        )

        with pytest.raises(ValueError, match="must have all non-negative elements"):
            calculator.validate_matrix()

    def test_sectors_constant(self):
        """Test SECTORS constant is defined correctly"""
        assert LeontiefCalculator.SECTORS == ['agriculture', 'industry', 'services', 'public']


class TestLeontiefResultDataclass:
    """Test LeontiefResult dataclass"""

    def test_leontief_result_creation(self):
        """Test creating LeontiefResult instance"""
        result = LeontiefResult(
            total_production=np.array([1, 2, 3, 4]),
            total_vab=np.array([0.5, 1.0, 1.5, 2.0]),
            total_vab_sum=5.0,
            economic_multiplier=1.5,
            tax_revenue=0.9,
            jobs_created=100,
            vab_by_sector={'agriculture': 0.5, 'industry': 1.0, 'services': 1.5, 'public': 2.0},
        )

        assert result.total_vab_sum == 5.0
        assert result.economic_multiplier == 1.5
        assert result.tax_revenue == 0.9
        assert result.jobs_created == 100


class TestCreateLeontiefCalculatorFromDB:
    """Test factory function for creating calculator from database"""

    @pytest.fixture
    def sample_db_matrix_rows(self):
        """Sample database rows for Leontief matrix"""
        return [
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'agriculture',
                'to_agriculture': 1.25,
                'to_industry': 0.48,
                'to_services': 0.22,
                'to_public': 0.15,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'industry',
                'to_agriculture': 0.35,
                'to_industry': 1.72,
                'to_services': 0.28,
                'to_public': 0.20,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'services',
                'to_agriculture': 0.25,
                'to_industry': 0.45,
                'to_services': 1.57,
                'to_public': 0.30,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'public',
                'to_agriculture': 0.11,
                'to_industry': 0.15,
                'to_services': 0.18,
                'to_public': 1.50,
            },
        ]

    @pytest.fixture
    def sample_db_conversion_factors(self):
        """Sample conversion factors from database"""
        return {
            'vab_coefficient': {
                'agriculture': 0.699,
                'industry': 0.291,
                'services': 0.573,
                'public': 0.950,
            },
            'employment': {
                'agriculture': 12.5,
                'industry': 8.2,
                'services': 14.8,
                'public': 11.3,
            },
        }

    def test_create_calculator_from_db(self, sample_db_matrix_rows, sample_db_conversion_factors):
        """Test creating calculator from database rows"""
        calculator = create_leontief_calculator_from_db(
            sample_db_matrix_rows, sample_db_conversion_factors
        )

        assert isinstance(calculator, LeontiefCalculator)
        assert calculator.L.shape == (4, 4)

        # Verify matrix values
        assert calculator.L[0, 0] == pytest.approx(1.25)  # Agriculture -> Agriculture
        assert calculator.L[1, 1] == pytest.approx(1.72)  # Industry -> Industry
        assert calculator.L[2, 2] == pytest.approx(1.57)  # Services -> Services
        assert calculator.L[3, 3] == pytest.approx(1.50)  # Public -> Public

    def test_create_calculator_validates_matrix(
        self, sample_db_matrix_rows, sample_db_conversion_factors
    ):
        """Test factory function validates the created matrix"""
        # This should succeed without raising
        calculator = create_leontief_calculator_from_db(
            sample_db_matrix_rows, sample_db_conversion_factors
        )

        # Validation should have been called during creation
        assert calculator.validate_matrix() is True

    def test_create_calculator_filters_matrix_type(self, sample_db_conversion_factors):
        """Test factory function filters by matrix_type"""
        # Include a row with wrong matrix_type
        mixed_rows = [
            {
                'matrix_type': 'technical_coefficients',  # Wrong type
                'from_sector': 'agriculture',
                'to_agriculture': 999.0,  # Should be ignored
                'to_industry': 999.0,
                'to_services': 999.0,
                'to_public': 999.0,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'agriculture',
                'to_agriculture': 1.25,
                'to_industry': 0.48,
                'to_services': 0.22,
                'to_public': 0.15,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'industry',
                'to_agriculture': 0.35,
                'to_industry': 1.72,
                'to_services': 0.28,
                'to_public': 0.20,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'services',
                'to_agriculture': 0.25,
                'to_industry': 0.45,
                'to_services': 1.57,
                'to_public': 0.30,
            },
            {
                'matrix_type': 'leontief_inverse',
                'from_sector': 'public',
                'to_agriculture': 0.11,
                'to_industry': 0.15,
                'to_services': 0.18,
                'to_public': 1.50,
            },
        ]

        calculator = create_leontief_calculator_from_db(mixed_rows, sample_db_conversion_factors)

        # Should not have used the technical_coefficients row
        assert calculator.L[0, 0] == pytest.approx(1.25)
        assert calculator.L[0, 0] != 999.0


class TestLeontiefCalculatorEdgeCases:
    """Test edge cases and special scenarios"""

    def test_very_small_investment(self, sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients):
        """Test calculation with very small investment"""
        calculator = LeontiefCalculator(
            sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients
        )

        shock = np.array([0, 100, 0, 0])  # Only 100 BRL

        result = calculator.calculate_shock_impact(shock)

        # Should still calculate correctly
        assert result.total_vab_sum > 0
        assert result.economic_multiplier > 0

    def test_very_large_investment(self, sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients):
        """Test calculation with very large investment"""
        calculator = LeontiefCalculator(
            sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients
        )

        shock = np.array([0, 1_000_000_000_000, 0, 0])  # 1 trillion BRL

        result = calculator.calculate_shock_impact(shock)

        # Should handle large numbers
        assert result.total_vab_sum > 1_000_000_000_000
        assert result.economic_multiplier > 0
        assert np.isfinite(result.total_vab_sum)

    def test_thread_safety(self, sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients):
        """Test calculator is thread-safe (stateless)"""
        import threading

        calculator = LeontiefCalculator(
            sample_leontief_matrix, sample_vab_coefficients, sample_employment_coefficients
        )

        results = []
        errors = []

        def calculate():
            try:
                shock = np.array([0, 10_000_000, 0, 0])
                result = calculator.calculate_shock_impact(shock)
                results.append(result.total_vab_sum)
            except Exception as e:
                errors.append(e)

        # Run calculations in parallel
        threads = [threading.Thread(target=calculate) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All should succeed
        assert len(errors) == 0
        assert len(results) == 10

        # All should give same result
        assert all(r == pytest.approx(results[0]) for r in results)
