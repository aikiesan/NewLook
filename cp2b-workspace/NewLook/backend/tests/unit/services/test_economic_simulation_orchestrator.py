"""
Tests for Economic Simulation Orchestrator
Tests high-level simulation orchestration and workflow coordination
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime
import numpy as np

from app.services.economic_simulation_orchestrator import (
    SimulationResult,
    EconomicSimulationOrchestrator,
    get_orchestrator,
)
from app.services.leontief_calculator import LeontiefResult


class TestSimulationResult:
    """Test SimulationResult data class"""

    @pytest.fixture
    def sample_result(self):
        """Create sample SimulationResult"""
        return SimulationResult(
            simulation_id="sim_3501_1234567890",
            origin_region_code="3501",
            origin_region_name="São Paulo",
            investment_brl=10_000_000,
            primary_sector="industry",
            total_vab_impact=12_364_000,
            economic_multiplier=1.24,
            vab_by_sector={
                "agriculture": 3_355_200,
                "industry": 5_005_200,
                "services": 2_578_500,
                "public": 1_425_100,
            },
            tax_revenue_brl=2_225_520,
            jobs_created=137,
            regional_impacts={
                "3501": {
                    "region_name": "São Paulo",
                    "vab_impact_brl": 8_000_000,
                    "spillover_weight": 0.65,
                    "vab_agriculture": 2_181_380,
                    "vab_industry": 3_253_380,
                    "vab_services": 1_676_025,
                    "vab_public": 926_315,
                    "impact_percentage": 64.7,
                    "vab_per_capita_increase": 0.65,
                }
            },
            calculation_time_ms=45.5,
            timestamp=datetime(2024, 1, 1, 12, 0, 0),
        )

    def test_simulation_result_creation(self, sample_result):
        """Test creating SimulationResult instance"""
        assert sample_result.simulation_id == "sim_3501_1234567890"
        assert sample_result.origin_region_code == "3501"
        assert sample_result.investment_brl == 10_000_000
        assert sample_result.total_vab_impact == 12_364_000
        assert sample_result.jobs_created == 137

    def test_to_dict_structure(self, sample_result):
        """Test to_dict() produces correct structure"""
        result_dict = sample_result.to_dict()

        # Verify top-level keys
        assert "simulation_id" in result_dict
        assert "timestamp" in result_dict
        assert "input" in result_dict
        assert "results" in result_dict
        assert "metadata" in result_dict

    def test_to_dict_input_section(self, sample_result):
        """Test to_dict() input section"""
        result_dict = sample_result.to_dict()
        input_section = result_dict["input"]

        assert input_section["origin_region"] == "3501"
        assert input_section["origin_region_name"] == "São Paulo"
        assert input_section["investment_brl"] == 10_000_000
        assert input_section["primary_sector"] == "industry"

    def test_to_dict_results_section(self, sample_result):
        """Test to_dict() results section"""
        result_dict = sample_result.to_dict()
        results_section = result_dict["results"]

        assert results_section["total_vab_impact_brl"] == 12_364_000
        assert results_section["economic_multiplier"] == 1.24
        assert "vab_by_sector" in results_section
        assert results_section["tax_revenue_brl"] == 2_225_520
        assert results_section["jobs_created"] == 137
        assert "regional_impacts" in results_section

    def test_to_dict_metadata_section(self, sample_result):
        """Test to_dict() metadata section"""
        result_dict = sample_result.to_dict()
        metadata = result_dict["metadata"]

        assert metadata["calculation_time_ms"] == 45.5
        assert metadata["data_year"] == 2021

    def test_to_dict_timestamp_format(self, sample_result):
        """Test to_dict() timestamp is ISO formatted"""
        result_dict = sample_result.to_dict()

        assert result_dict["timestamp"] == "2024-01-01T12:00:00"


class TestEconomicSimulationOrchestrator:
    """Test EconomicSimulationOrchestrator class"""

    @pytest.fixture
    def mock_data_service(self):
        """Create mock EconomicDataService"""
        mock = Mock()

        # Mock region data
        mock.get_region_by_code.return_value = {
            "cd_rgi": "3501",
            "nm_rgi": "São Paulo",
            "vab_total_brl": 500_000_000_000,
            "vab_agriculture_brl": 50_000_000_000,
            "vab_industry_brl": 200_000_000_000,
            "vab_services_brl": 200_000_000_000,
            "vab_public_brl": 50_000_000_000,
            "population": 12_000_000,
            "gdp_per_capita_brl": 41_667,
            "centroid_lat": -23.5505,
            "centroid_lng": -46.6333,
        }

        # Mock all regions
        mock.get_all_regions.return_value = [
            {
                "cd_rgi": "3501",
                "nm_rgi": "São Paulo",
                "vab_total_brl": 500_000_000_000,
                "vab_agriculture_brl": 50_000_000_000,
                "vab_industry_brl": 200_000_000_000,
                "vab_services_brl": 200_000_000_000,
                "vab_public_brl": 50_000_000_000,
                "population": 12_000_000,
                "gdp_per_capita_brl": 41_667,
                "centroid_lat": -23.5505,
                "centroid_lng": -46.6333,
            },
            {
                "cd_rgi": "3502",
                "nm_rgi": "Campinas",
                "vab_total_brl": 50_000_000_000,
                "vab_agriculture_brl": 5_000_000_000,
                "vab_industry_brl": 20_000_000_000,
                "vab_services_brl": 20_000_000_000,
                "vab_public_brl": 5_000_000_000,
                "population": 1_200_000,
                "gdp_per_capita_brl": 41_667,
                "centroid_lat": -22.9068,
                "centroid_lng": -47.0631,
            },
        ]

        # Mock Leontief calculator
        mock_calculator = Mock()
        mock_calculator.calculate_shock_impact.return_value = LeontiefResult(
            total_production=np.array([4_800_000, 17_200_000, 4_500_000, 1_500_000]),
            total_vab=np.array([3_355_200, 5_005_200, 2_578_500, 1_425_100]),
            total_vab_sum=12_364_000,
            economic_multiplier=1.24,
            tax_revenue=2_225_520,
            jobs_created=137,
            vab_by_sector={
                "agriculture": 3_355_200,
                "industry": 5_005_200,
                "services": 2_578_500,
                "public": 1_425_100,
            },
        )
        mock_calculator.get_sector_multipliers.return_value = {
            "agriculture": 1.96,
            "industry": 2.80,
            "services": 2.50,
            "public": 2.00,
        }
        mock.get_leontief_calculator.return_value = mock_calculator

        # Mock state summary
        mock.get_state_summary.return_value = {
            "total_vab_brl": 2_300_000_000_000,
            "total_population": 45_000_000,
            "gdp_per_capita_brl": 51_111,
            "total_regions": 53,
        }

        return mock

    @pytest.fixture
    def mock_spillover_service(self):
        """Create mock SpatialSpilloverService"""
        mock = Mock()

        # Mock spillover weights
        mock.calculate_spillover_weights.return_value = {
            "3501": 0.70,  # 70% stays in origin
            "3502": 0.30,  # 30% spills to neighbor
        }

        # Mock distributed impact
        mock.distribute_impact.return_value = {
            "3501": 8_654_800,  # 70% of 12,364,000
            "3502": 3_709_200,  # 30% of 12,364,000
        }

        return mock

    @pytest.fixture
    def orchestrator(self, mock_data_service, mock_spillover_service):
        """Create orchestrator with mocked services"""
        return EconomicSimulationOrchestrator(
            data_service=mock_data_service,
            spillover_service=mock_spillover_service,
        )

    def test_initialization(self, orchestrator, mock_data_service, mock_spillover_service):
        """Test orchestrator initializes with services"""
        assert orchestrator.data_service == mock_data_service
        assert orchestrator.spillover_service == mock_spillover_service

    def test_sector_index_constant(self):
        """Test SECTOR_INDEX is correctly defined"""
        expected = {
            "agriculture": 0,
            "industry": 1,
            "services": 2,
            "public": 3,
        }
        assert EconomicSimulationOrchestrator.SECTOR_INDEX == expected

    def test_simulate_shock_success(self, orchestrator):
        """Test successful shock simulation"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            include_spatial_spillover=True,
            tax_rate=0.18,
        )

        # Verify result structure
        assert isinstance(result, SimulationResult)
        assert result.origin_region_code == "3501"
        assert result.origin_region_name == "São Paulo"
        assert result.investment_brl == 10_000_000
        assert result.primary_sector == "industry"

    def test_simulate_shock_creates_correct_shock_vector(self, orchestrator, mock_data_service):
        """Test simulate_shock creates correct shock vector for sector"""
        orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
        )

        # Verify calculator was called with correct shock vector
        calculator = mock_data_service.get_leontief_calculator()
        call_args = calculator.calculate_shock_impact.call_args

        shock_vector = call_args[1]["shock_vector"]
        expected = np.array([0, 10_000_000, 0, 0])  # Industry is index 1

        assert np.array_equal(shock_vector, expected)

    def test_simulate_shock_different_sectors(self, orchestrator, mock_data_service):
        """Test shock vectors for different sectors"""
        sectors_and_expected = [
            ("agriculture", np.array([10_000_000, 0, 0, 0])),
            ("industry", np.array([0, 10_000_000, 0, 0])),
            ("services", np.array([0, 0, 10_000_000, 0])),
            ("public", np.array([0, 0, 0, 10_000_000])),
        ]

        calculator = mock_data_service.get_leontief_calculator()

        for sector, expected_vector in sectors_and_expected:
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=10_000_000,
                sector=sector,
            )

            shock_vector = calculator.calculate_shock_impact.call_args[1]["shock_vector"]
            assert np.array_equal(shock_vector, expected_vector), f"Failed for {sector}"

    def test_simulate_shock_invalid_sector(self, orchestrator):
        """Test simulate_shock fails with invalid sector"""
        with pytest.raises(ValueError, match="Invalid sector"):
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=10_000_000,
                sector="invalid_sector",
            )

    def test_simulate_shock_negative_investment(self, orchestrator):
        """Test simulate_shock fails with negative investment"""
        with pytest.raises(ValueError, match="Investment must be positive"):
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=-1_000_000,
                sector="industry",
            )

    def test_simulate_shock_zero_investment(self, orchestrator):
        """Test simulate_shock fails with zero investment"""
        with pytest.raises(ValueError, match="Investment must be positive"):
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=0,
                sector="industry",
            )

    def test_simulate_shock_invalid_tax_rate_high(self, orchestrator):
        """Test simulate_shock fails with tax rate > 1"""
        with pytest.raises(ValueError, match="Tax rate must be 0-1"):
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=10_000_000,
                sector="industry",
                tax_rate=1.5,
            )

    def test_simulate_shock_invalid_tax_rate_negative(self, orchestrator):
        """Test simulate_shock fails with negative tax rate"""
        with pytest.raises(ValueError, match="Tax rate must be 0-1"):
            orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=10_000_000,
                sector="industry",
                tax_rate=-0.1,
            )

    def test_simulate_shock_region_not_found(self, orchestrator, mock_data_service):
        """Test simulate_shock fails when region not found"""
        mock_data_service.get_region_by_code.return_value = None

        with pytest.raises(ValueError, match="Region not found"):
            orchestrator.simulate_shock(
                region_code="9999",
                investment_brl=10_000_000,
                sector="industry",
            )

    def test_simulate_shock_with_spatial_spillover(self, orchestrator, mock_spillover_service):
        """Test simulate_shock includes spatial spillover"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            include_spatial_spillover=True,
        )

        # Verify spillover service was called
        mock_spillover_service.calculate_spillover_weights.assert_called_once()
        mock_spillover_service.distribute_impact.assert_called_once()

        # Verify regional impacts exist
        assert len(result.regional_impacts) > 0
        assert "3501" in result.regional_impacts

    def test_simulate_shock_without_spatial_spillover(
        self, orchestrator, mock_spillover_service
    ):
        """Test simulate_shock without spatial spillover"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            include_spatial_spillover=False,
        )

        # Verify spillover service was NOT called
        mock_spillover_service.calculate_spillover_weights.assert_not_called()
        mock_spillover_service.distribute_impact.assert_not_called()

        # Verify all impact is in origin region
        assert len(result.regional_impacts) == 1
        assert "3501" in result.regional_impacts
        assert result.regional_impacts["3501"]["impact_percentage"] == 100.0
        assert result.regional_impacts["3501"]["spillover_weight"] == 1.0

    def test_simulate_shock_regional_impacts_structure(self, orchestrator):
        """Test regional impacts have correct structure"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            include_spatial_spillover=True,
        )

        for region_code, impact in result.regional_impacts.items():
            assert "region_name" in impact
            assert "vab_impact_brl" in impact
            assert "spillover_weight" in impact
            assert "vab_agriculture" in impact
            assert "vab_industry" in impact
            assert "vab_services" in impact
            assert "vab_public" in impact
            assert "impact_percentage" in impact
            assert "vab_per_capita_increase" in impact

    def test_simulate_shock_calculation_time(self, orchestrator):
        """Test simulation records calculation time"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
        )

        assert result.calculation_time_ms > 0
        assert isinstance(result.calculation_time_ms, float)

    def test_simulate_shock_simulation_id_format(self, orchestrator):
        """Test simulation ID follows expected format"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
        )

        assert result.simulation_id.startswith("sim_3501_")
        assert len(result.simulation_id) > 10  # Should include timestamp

    def test_get_all_regions_summary(self, orchestrator):
        """Test getting all regions summary"""
        regions = orchestrator.get_all_regions_summary()

        assert isinstance(regions, list)
        assert len(regions) == 2  # Based on mock

        # Verify structure
        region = regions[0]
        assert "cd_rgi" in region
        assert "nm_rgi" in region
        assert "vab_total_brl" in region
        assert "vab_agriculture_brl" in region
        assert "vab_industry_brl" in region
        assert "vab_services_brl" in region
        assert "vab_public_brl" in region
        assert "population" in region
        assert "gdp_per_capita_brl" in region
        assert "centroid" in region

    def test_get_all_regions_summary_centroid_structure(self, orchestrator):
        """Test region centroid has correct structure"""
        regions = orchestrator.get_all_regions_summary()

        centroid = regions[0]["centroid"]
        assert "lat" in centroid
        assert "lng" in centroid
        assert isinstance(centroid["lat"], float)
        assert isinstance(centroid["lng"], float)

    def test_get_all_regions_summary_data_types(self, orchestrator):
        """Test region summary has correct data types"""
        regions = orchestrator.get_all_regions_summary()
        region = regions[0]

        assert isinstance(region["vab_total_brl"], float)
        assert isinstance(region["population"], int)

    def test_get_economic_multipliers(self, orchestrator):
        """Test getting economic multipliers"""
        multipliers = orchestrator.get_economic_multipliers()

        assert isinstance(multipliers, dict)
        assert "agriculture" in multipliers
        assert "industry" in multipliers
        assert "services" in multipliers
        assert "public" in multipliers

        # Verify values are reasonable
        assert multipliers["agriculture"] == 1.96
        assert multipliers["industry"] == 2.80
        assert multipliers["services"] == 2.50
        assert multipliers["public"] == 2.00

    def test_get_state_summary(self, orchestrator):
        """Test getting state summary"""
        summary = orchestrator.get_state_summary()

        assert isinstance(summary, dict)
        assert "total_vab_brl" in summary
        assert "total_population" in summary
        assert "gdp_per_capita_brl" in summary
        assert "total_regions" in summary


class TestGetOrchestrator:
    """Test get_orchestrator singleton function"""

    def test_get_orchestrator_returns_instance(self):
        """Test get_orchestrator returns EconomicSimulationOrchestrator"""
        with patch(
            "app.services.economic_simulation_orchestrator.get_economic_data_service"
        ), patch(
            "app.services.economic_simulation_orchestrator.get_spatial_spillover_service"
        ):
            orchestrator = get_orchestrator()
            assert isinstance(orchestrator, EconomicSimulationOrchestrator)

    def test_get_orchestrator_singleton_behavior(self):
        """Test get_orchestrator returns same instance on multiple calls"""
        # Reset singleton
        import app.services.economic_simulation_orchestrator as orch_module

        orch_module._orchestrator = None

        with patch(
            "app.services.economic_simulation_orchestrator.get_economic_data_service"
        ), patch(
            "app.services.economic_simulation_orchestrator.get_spatial_spillover_service"
        ):
            orchestrator1 = get_orchestrator()
            orchestrator2 = get_orchestrator()

            assert orchestrator1 is orchestrator2  # Same instance


class TestOrchestratorIntegration:
    """Test orchestrator integration workflows"""

    @pytest.fixture
    def orchestrator(self):
        """Create orchestrator with mocked services"""
        mock_data = Mock()
        mock_spillover = Mock()

        # Setup minimal mocks for integration
        mock_data.get_region_by_code.return_value = {
            "cd_rgi": "3501",
            "nm_rgi": "São Paulo",
            "vab_total_brl": 500_000_000_000,
            "vab_agriculture_brl": 50_000_000_000,
            "vab_industry_brl": 200_000_000_000,
            "vab_services_brl": 200_000_000_000,
            "vab_public_brl": 50_000_000_000,
            "population": 12_000_000,
            "gdp_per_capita_brl": 41_667,
            "centroid_lat": -23.5505,
            "centroid_lng": -46.6333,
        }

        mock_data.get_all_regions.return_value = [
            {
                "cd_rgi": "3501",
                "nm_rgi": "São Paulo",
                "vab_total_brl": 500_000_000_000,
                "vab_agriculture_brl": 50_000_000_000,
                "vab_industry_brl": 200_000_000_000,
                "vab_services_brl": 200_000_000_000,
                "vab_public_brl": 50_000_000_000,
                "population": 12_000_000,
                "gdp_per_capita_brl": 41_667,
                "centroid_lat": -23.5505,
                "centroid_lng": -46.6333,
            }
        ]

        mock_calculator = Mock()
        mock_calculator.calculate_shock_impact.return_value = LeontiefResult(
            total_production=np.array([4_800_000, 17_200_000, 4_500_000, 1_500_000]),
            total_vab=np.array([3_355_200, 5_005_200, 2_578_500, 1_425_100]),
            total_vab_sum=12_364_000,
            economic_multiplier=1.24,
            tax_revenue=2_225_520,
            jobs_created=137,
            vab_by_sector={
                "agriculture": 3_355_200,
                "industry": 5_005_200,
                "services": 2_578_500,
                "public": 1_425_100,
            },
        )
        mock_data.get_leontief_calculator.return_value = mock_calculator

        mock_spillover.calculate_spillover_weights.return_value = {"3501": 1.0}
        mock_spillover.distribute_impact.return_value = {"3501": 12_364_000}

        return EconomicSimulationOrchestrator(
            data_service=mock_data, spillover_service=mock_spillover
        )

    def test_complete_simulation_workflow(self, orchestrator):
        """Test complete simulation from start to finish"""
        result = orchestrator.simulate_shock(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            include_spatial_spillover=True,
            tax_rate=0.18,
        )

        # Verify complete result
        assert result.investment_brl == 10_000_000
        assert result.total_vab_impact == 12_364_000
        assert result.economic_multiplier == 1.24
        assert result.tax_revenue_brl == 2_225_520
        assert result.jobs_created == 137
        assert len(result.regional_impacts) > 0

        # Verify result can be serialized
        result_dict = result.to_dict()
        assert isinstance(result_dict, dict)
        assert "simulation_id" in result_dict

    def test_multiple_simulations_different_sectors(self, orchestrator):
        """Test running multiple simulations for different sectors"""
        sectors = ["agriculture", "industry", "services", "public"]

        results = []
        for sector in sectors:
            result = orchestrator.simulate_shock(
                region_code="3501",
                investment_brl=10_000_000,
                sector=sector,
            )
            results.append(result)

        # All should succeed
        assert len(results) == 4

        # Each should have unique simulation ID
        sim_ids = [r.simulation_id for r in results]
        assert len(set(sim_ids)) == 4  # All unique
