"""
Integration tests for Economic Simulation API endpoints
Tests the complete API layer for economic shock simulations
"""

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app
from app.services.economic_simulation_orchestrator import SimulationResult

client = TestClient(app)


class TestEconomicSimulationEndpoints:
    """Test economic simulation API endpoints"""

    @pytest.fixture
    def mock_orchestrator(self):
        """Create mock orchestrator"""
        mock = Mock()

        # Mock regions list
        mock.get_all_regions_summary.return_value = [
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
                "centroid": {"lat": -23.5505, "lng": -46.6333},
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
                "centroid": {"lat": -22.9068, "lng": -47.0631},
            },
        ]

        # Mock simulation result
        mock_result = SimulationResult(
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
                    "vab_impact_brl": 8_654_800,
                    "spillover_weight": 0.70,
                    "vab_agriculture": 2_348_640,
                    "vab_industry": 3_503_640,
                    "vab_services": 1_804_950,
                    "vab_public": 997_570,
                    "impact_percentage": 70.0,
                    "vab_per_capita_increase": 0.72,
                },
                "3502": {
                    "region_name": "Campinas",
                    "vab_impact_brl": 3_709_200,
                    "spillover_weight": 0.30,
                    "vab_agriculture": 1_006_560,
                    "vab_industry": 1_501_560,
                    "vab_services": 773_550,
                    "vab_public": 427_530,
                    "impact_percentage": 30.0,
                    "vab_per_capita_increase": 3.09,
                },
            },
            calculation_time_ms=45.5,
            timestamp=datetime(2024, 1, 1, 12, 0, 0),
        )
        mock.simulate_shock.return_value = mock_result

        # Mock multipliers
        mock.get_economic_multipliers.return_value = {
            "agriculture": 1.96,
            "industry": 2.80,
            "services": 2.50,
            "public": 2.00,
        }

        # Mock state summary
        mock.get_state_summary.return_value = {
            "total_vab_brl": 2_300_000_000_000,
            "total_population": 45_000_000,
            "gdp_per_capita_brl": 51_111,
            "total_regions": 53,
        }

        return mock

    def test_get_regions_success(self, mock_orchestrator):
        """Test GET /simulation/regions returns region list"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/regions")

        assert response.status_code == 200
        data = response.json()

        assert "regions" in data
        assert "total_regions" in data
        assert "total_state_vab_brl" in data

        assert len(data["regions"]) == 2
        assert data["total_regions"] == 2

    def test_get_regions_structure(self, mock_orchestrator):
        """Test regions response has correct structure"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/regions")

        data = response.json()
        region = data["regions"][0]

        # Verify required fields
        assert "cd_rgi" in region
        assert "nm_rgi" in region
        assert "vab_total_brl" in region
        assert "population" in region
        assert "centroid" in region

    def test_get_regions_total_vab_calculation(self, mock_orchestrator):
        """Test total state VAB is correctly calculated"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/regions")

        data = response.json()

        # Should be sum of all region VABs
        expected_total = 500_000_000_000 + 50_000_000_000
        assert data["total_state_vab_brl"] == expected_total

    def test_post_shock_simulation_success(self, mock_orchestrator):
        """Test POST /simulation/shock executes simulation"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                    "include_spatial_spillover": True,
                    "tax_rate": 0.18,
                },
            )

        assert response.status_code == 200
        data = response.json()

        # Verify orchestrator was called
        mock_orchestrator.simulate_shock.assert_called_once()

    def test_post_shock_simulation_response_structure(self, mock_orchestrator):
        """Test shock simulation response structure"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                },
            )

        data = response.json()

        # Verify result structure (from SimulationResult.to_dict())
        assert "simulation_id" in data
        assert "timestamp" in data
        assert "input" in data
        assert "results" in data
        assert "metadata" in data

    def test_post_shock_simulation_input_validation(self, mock_orchestrator):
        """Test shock simulation validates input parameters"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                    "include_spatial_spillover": True,
                    "tax_rate": 0.18,
                },
            )

        # Verify orchestrator was called with correct params
        call_kwargs = mock_orchestrator.simulate_shock.call_args[1]
        assert call_kwargs["region_code"] == "3501"
        assert call_kwargs["investment_brl"] == 10_000_000
        assert call_kwargs["sector"] == "industry"
        assert call_kwargs["include_spatial_spillover"] is True
        assert call_kwargs["tax_rate"] == 0.18

    def test_post_shock_simulation_default_values(self, mock_orchestrator):
        """Test shock simulation uses default values"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                    # Not specifying include_spatial_spillover or tax_rate
                },
            )

        assert response.status_code == 200

    def test_post_shock_simulation_missing_required_field(self):
        """Test shock simulation fails with missing required field"""
        response = client.post(
            "/api/v1/simulation/shock",
            json={
                "region_code": "3501",
                # Missing investment_brl
                "sector": "industry",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_post_shock_simulation_invalid_sector(self, mock_orchestrator):
        """Test shock simulation fails with invalid sector"""
        mock_orchestrator.simulate_shock.side_effect = ValueError("Invalid sector")

        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "invalid_sector",
                },
            )

        assert response.status_code == 400  # Bad request

    def test_post_shock_simulation_negative_investment(self, mock_orchestrator):
        """Test shock simulation fails with negative investment"""
        mock_orchestrator.simulate_shock.side_effect = ValueError(
            "Investment must be positive"
        )

        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": -1_000_000,
                    "sector": "industry",
                },
            )

        assert response.status_code == 400

    def test_get_multipliers_success(self, mock_orchestrator):
        """Test GET /simulation/multipliers returns multipliers"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/multipliers")

        assert response.status_code == 200
        data = response.json()

        assert "multipliers" in data
        assert "agriculture" in data["multipliers"]
        assert "industry" in data["multipliers"]
        assert "services" in data["multipliers"]
        assert "public" in data["multipliers"]

    def test_get_multipliers_values(self, mock_orchestrator):
        """Test multipliers have reasonable values"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/multipliers")

        data = response.json()
        multipliers = data["multipliers"]

        # Verify values are from mock
        assert multipliers["agriculture"] == 1.96
        assert multipliers["industry"] == 2.80
        assert multipliers["services"] == 2.50
        assert multipliers["public"] == 2.00

    def test_get_state_summary_success(self, mock_orchestrator):
        """Test GET /simulation/state-summary returns summary"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/state-summary")

        assert response.status_code == 200
        data = response.json()

        assert "total_vab_brl" in data
        assert "total_population" in data
        assert "gdp_per_capita_brl" in data
        assert "total_regions" in data

    def test_get_state_summary_values(self, mock_orchestrator):
        """Test state summary has correct values"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/state-summary")

        data = response.json()

        assert data["total_vab_brl"] == 2_300_000_000_000
        assert data["total_population"] == 45_000_000
        assert data["gdp_per_capita_brl"] == 51_111
        assert data["total_regions"] == 53


class TestEconomicSimulationErrorHandling:
    """Test error handling in economic simulation endpoints"""

    def test_get_regions_service_error(self):
        """Test GET /regions handles service errors"""
        mock_orchestrator = Mock()
        mock_orchestrator.get_all_regions_summary.side_effect = Exception(
            "Database error"
        )

        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.get("/api/v1/simulation/regions")

        assert response.status_code == 500
        assert "error" in response.json()["detail"]

    def test_post_shock_runtime_error(self):
        """Test POST /shock handles runtime errors"""
        mock_orchestrator = Mock()
        mock_orchestrator.simulate_shock.side_effect = RuntimeError("Calculation failed")

        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                },
            )

        assert response.status_code == 500


class TestEconomicSimulationDataFlow:
    """Test complete data flow through simulation endpoints"""

    @pytest.fixture
    def mock_orchestrator(self):
        """Create orchestrator mock with realistic data"""
        mock = Mock()

        mock_result = SimulationResult(
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
                    "vab_impact_brl": 12_364_000,
                    "spillover_weight": 1.0,
                    "vab_agriculture": 3_355_200,
                    "vab_industry": 5_005_200,
                    "vab_services": 2_578_500,
                    "vab_public": 1_425_100,
                    "impact_percentage": 100.0,
                    "vab_per_capita_increase": 1.03,
                }
            },
            calculation_time_ms=45.5,
            timestamp=datetime(2024, 1, 1, 12, 0, 0),
        )
        mock.simulate_shock.return_value = mock_result

        return mock

    def test_complete_simulation_workflow(self, mock_orchestrator):
        """Test complete simulation workflow from request to response"""
        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            # 1. Execute simulation
            response = client.post(
                "/api/v1/simulation/shock",
                json={
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                    "include_spatial_spillover": False,
                },
            )

        assert response.status_code == 200
        data = response.json()

        # 2. Verify input was captured
        assert data["input"]["investment_brl"] == 10_000_000
        assert data["input"]["primary_sector"] == "industry"

        # 3. Verify results were calculated
        assert data["results"]["total_vab_impact_brl"] == 12_364_000
        assert data["results"]["economic_multiplier"] == 1.24
        assert data["results"]["jobs_created"] == 137
        assert data["results"]["tax_revenue_brl"] == 2_225_520

        # 4. Verify regional impacts
        assert "regional_impacts" in data["results"]
        assert "3501" in data["results"]["regional_impacts"]

        # 5. Verify metadata
        assert data["metadata"]["calculation_time_ms"] == 45.5
        assert data["metadata"]["data_year"] == 2021

    def test_simulation_with_different_sectors(self, mock_orchestrator):
        """Test simulations work for all sectors"""
        sectors = ["agriculture", "industry", "services", "public"]

        with patch(
            "app.api.v1.endpoints.economic_simulation.get_orchestrator",
            return_value=mock_orchestrator,
        ):
            for sector in sectors:
                response = client.post(
                    "/api/v1/simulation/shock",
                    json={
                        "region_code": "3501",
                        "investment_brl": 10_000_000,
                        "sector": sector,
                    },
                )

                assert response.status_code == 200, f"Failed for sector: {sector}"
                data = response.json()
                assert data["input"]["primary_sector"] == sector
