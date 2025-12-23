"""
Unit tests for Economic Simulation Pydantic Schemas
Tests request/response validation for economic simulation API
"""
import pytest
from pydantic import ValidationError
from datetime import datetime

from app.schemas.economic_simulation import (
    EconomicSector,
    ShockSimulationRequest,
    CentroidSchema,
    RegionSummarySchema,
    RegionsListResponse,
    RegionalImpactSchema,
    SimulationInputSchema,
    SimulationResultsSchema,
    SimulationMetadataSchema,
    ShockSimulationResponse,
    MultipliersResponse,
    StateSummaryResponse,
    ErrorDetail
)


class TestEconomicSectorEnum:
    """Test EconomicSector enum"""

    def test_valid_sectors(self):
        """Test all valid economic sectors"""
        assert EconomicSector.AGRICULTURE == "agriculture"
        assert EconomicSector.INDUSTRY == "industry"
        assert EconomicSector.SERVICES == "services"
        assert EconomicSector.PUBLIC == "public"

    def test_sector_from_string(self):
        """Test creating sector from string"""
        assert EconomicSector("agriculture") == EconomicSector.AGRICULTURE
        assert EconomicSector("industry") == EconomicSector.INDUSTRY

    def test_invalid_sector_raises_error(self):
        """Test invalid sector value raises error"""
        with pytest.raises(ValueError):
            EconomicSector("invalid_sector")


class TestShockSimulationRequest:
    """Test ShockSimulationRequest schema"""

    def test_valid_request_minimal(self):
        """Test valid request with minimal fields"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector=EconomicSector.INDUSTRY
        )

        assert request.region_code == "3501"
        assert request.investment_brl == 10_000_000
        assert request.sector == EconomicSector.INDUSTRY
        # Options should have defaults
        assert request.options['include_spatial_spillover'] is True
        assert request.options['tax_rate'] == 0.18

    def test_valid_request_with_options(self):
        """Test valid request with custom options"""
        request = ShockSimulationRequest(
            region_code="3509",
            investment_brl=50_000_000,
            sector="agriculture",
            options={
                "include_spatial_spillover": False,
                "tax_rate": 0.25
            }
        )

        assert request.options['include_spatial_spillover'] is False
        assert request.options['tax_rate'] == 0.25

    def test_region_code_validation_min_length(self):
        """Test region code must be at least 4 characters"""
        with pytest.raises(ValidationError) as exc_info:
            ShockSimulationRequest(
                region_code="123",  # Too short
                investment_brl=10_000_000,
                sector="industry"
            )

        errors = exc_info.value.errors()
        assert any(e['loc'] == ('region_code',) for e in errors)

    def test_region_code_validation_max_length(self):
        """Test region code max length"""
        with pytest.raises(ValidationError):
            ShockSimulationRequest(
                region_code="12345678901",  # Too long
                investment_brl=10_000_000,
                sector="industry"
            )

    def test_investment_must_be_positive(self):
        """Test investment must be greater than zero"""
        with pytest.raises(ValidationError) as exc_info:
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=0,  # Not positive
                sector="industry"
            )

        errors = exc_info.value.errors()
        assert any('greater than 0' in str(e) for e in errors)

    def test_investment_negative_rejected(self):
        """Test negative investment rejected"""
        with pytest.raises(ValidationError):
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=-1000,
                sector="industry"
            )

    def test_investment_max_limit(self):
        """Test investment max limit (1 trillion)"""
        # At limit should work
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=1_000_000_000_000,
            sector="industry"
        )
        assert request.investment_brl == 1_000_000_000_000

        # Over limit should fail
        with pytest.raises(ValidationError):
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=1_000_000_000_001,
                sector="industry"
            )

    def test_sector_string_converted_to_enum(self):
        """Test sector string is converted to enum"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="agriculture"  # String
        )

        assert request.sector == EconomicSector.AGRICULTURE
        assert isinstance(request.sector, EconomicSector)

    def test_invalid_sector_rejected(self):
        """Test invalid sector value rejected"""
        with pytest.raises(ValidationError):
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=10_000_000,
                sector="invalid_sector"
            )

    def test_options_none_gets_defaults(self):
        """Test None options gets default values"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            options=None
        )

        assert request.options['include_spatial_spillover'] is True
        assert request.options['tax_rate'] == 0.18

    def test_options_partial_gets_defaults(self):
        """Test partial options get remaining defaults"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            options={"tax_rate": 0.25}
        )

        assert request.options['include_spatial_spillover'] is True
        assert request.options['tax_rate'] == 0.25

    def test_tax_rate_validation_min(self):
        """Test tax rate must be >= 0"""
        with pytest.raises(ValidationError) as exc_info:
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=10_000_000,
                sector="industry",
                options={"tax_rate": -0.1}
            )

        assert "tax_rate must be between 0 and 1" in str(exc_info.value)

    def test_tax_rate_validation_max(self):
        """Test tax rate must be <= 1"""
        with pytest.raises(ValidationError) as exc_info:
            ShockSimulationRequest(
                region_code="3501",
                investment_brl=10_000_000,
                sector="industry",
                options={"tax_rate": 1.5}
            )

        assert "tax_rate must be between 0 and 1" in str(exc_info.value)

    def test_tax_rate_boundary_values(self):
        """Test tax rate boundary values (0 and 1)"""
        # 0 should work
        request1 = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            options={"tax_rate": 0}
        )
        assert request1.options['tax_rate'] == 0

        # 1 should work
        request2 = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry",
            options={"tax_rate": 1.0}
        )
        assert request2.options['tax_rate'] == 1.0

    def test_serialization(self):
        """Test request can be serialized to dict"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry"
        )

        data = request.model_dump()
        assert data['region_code'] == "3501"
        assert data['investment_brl'] == 10_000_000
        assert data['sector'] == "industry"
        assert isinstance(data['options'], dict)


class TestCentroidSchema:
    """Test CentroidSchema"""

    def test_valid_centroid(self):
        """Test valid centroid coordinates"""
        centroid = CentroidSchema(lat=-23.5505, lng=-46.6333)

        assert centroid.lat == -23.5505
        assert centroid.lng == -46.6333

    def test_centroid_optional_fields(self):
        """Test centroid fields are optional"""
        centroid = CentroidSchema()

        assert centroid.lat is None
        assert centroid.lng is None

    def test_centroid_partial(self):
        """Test centroid with only one coordinate"""
        centroid = CentroidSchema(lat=-23.5505)

        assert centroid.lat == -23.5505
        assert centroid.lng is None


class TestRegionSummarySchema:
    """Test RegionSummarySchema"""

    def test_valid_region_summary(self):
        """Test valid region summary"""
        region = RegionSummarySchema(
            cd_rgi="3501",
            nm_rgi="São Paulo",
            vab_total_brl=500_000_000_000,
            vab_agriculture_brl=2_500_000_000,
            vab_industry_brl=110_000_000_000,
            vab_services_brl=355_000_000_000,
            vab_public_brl=32_500_000_000,
            population=12_325_232,
            centroid=CentroidSchema(lat=-23.5505, lng=-46.6333)
        )

        assert region.cd_rgi == "3501"
        assert region.nm_rgi == "São Paulo"
        assert region.population == 12_325_232

    def test_gdp_per_capita_optional(self):
        """Test gdp_per_capita is optional"""
        region = RegionSummarySchema(
            cd_rgi="3501",
            nm_rgi="São Paulo",
            vab_total_brl=500_000_000_000,
            vab_agriculture_brl=2_500_000_000,
            vab_industry_brl=110_000_000_000,
            vab_services_brl=355_000_000_000,
            vab_public_brl=32_500_000_000,
            population=12_325_232,
            centroid=CentroidSchema()
        )

        assert region.gdp_per_capita_brl is None


class TestRegionsListResponse:
    """Test RegionsListResponse"""

    def test_valid_regions_list(self):
        """Test valid regions list response"""
        response = RegionsListResponse(
            regions=[
                RegionSummarySchema(
                    cd_rgi="3501",
                    nm_rgi="São Paulo",
                    vab_total_brl=500_000_000_000,
                    vab_agriculture_brl=2_500_000_000,
                    vab_industry_brl=110_000_000_000,
                    vab_services_brl=355_000_000_000,
                    vab_public_brl=32_500_000_000,
                    population=12_325_232,
                    centroid=CentroidSchema(lat=-23.5505, lng=-46.6333)
                )
            ],
            total_regions=53
        )

        assert len(response.regions) == 1
        assert response.total_regions == 53

    def test_total_state_vab_optional(self):
        """Test total_state_vab_brl is optional"""
        response = RegionsListResponse(
            regions=[],
            total_regions=0
        )

        assert response.total_state_vab_brl is None


class TestRegionalImpactSchema:
    """Test RegionalImpactSchema"""

    def test_valid_regional_impact(self):
        """Test valid regional impact"""
        impact = RegionalImpactSchema(
            region_name="São Paulo",
            vab_impact_brl=12_364_000,
            vab_agriculture=3_355_200,
            vab_industry=5_005_200,
            vab_services=2_578_500,
            vab_public=1_425_000,
            impact_percentage=100.0,
            vab_per_capita_increase=1.00
        )

        assert impact.region_name == "São Paulo"
        assert impact.vab_impact_brl == 12_364_000
        assert impact.impact_percentage == 100.0


class TestSimulationSchemas:
    """Test simulation input/results/metadata schemas"""

    def test_simulation_input(self):
        """Test SimulationInputSchema"""
        input_data = SimulationInputSchema(
            origin_region="3501",
            origin_region_name="São Paulo",
            investment_brl=10_000_000,
            primary_sector="industry"
        )

        assert input_data.origin_region == "3501"
        assert input_data.primary_sector == "industry"

    def test_simulation_results(self):
        """Test SimulationResultsSchema"""
        results = SimulationResultsSchema(
            total_vab_impact_brl=12_364_000,
            economic_multiplier=1.24,
            vab_by_sector={
                "agriculture": 3_355_200,
                "industry": 5_005_200,
                "services": 2_578_500,
                "public": 1_425_000
            },
            tax_revenue_brl=2_225_520,
            jobs_created=137,
            regional_impacts={}
        )

        assert results.economic_multiplier == 1.24
        assert results.jobs_created == 137
        assert len(results.vab_by_sector) == 4

    def test_simulation_metadata(self):
        """Test SimulationMetadataSchema"""
        metadata = SimulationMetadataSchema(
            calculation_time_ms=45.2
        )

        assert metadata.calculation_time_ms == 45.2
        assert metadata.data_year == 2021  # Default


class TestShockSimulationResponse:
    """Test ShockSimulationResponse"""

    def test_valid_shock_response(self):
        """Test valid complete shock simulation response"""
        response = ShockSimulationResponse(
            simulation_id="sim_3501_1701360000",
            timestamp=datetime(2025, 11, 30, 15, 30, 0),
            input=SimulationInputSchema(
                origin_region="3501",
                origin_region_name="São Paulo",
                investment_brl=10_000_000,
                primary_sector="industry"
            ),
            results=SimulationResultsSchema(
                total_vab_impact_brl=12_364_000,
                economic_multiplier=1.24,
                vab_by_sector={
                    "agriculture": 3_355_200,
                    "industry": 5_005_200,
                    "services": 2_578_500,
                    "public": 1_425_000
                },
                tax_revenue_brl=2_225_520,
                jobs_created=137,
                regional_impacts={}
            ),
            metadata=SimulationMetadataSchema(
                calculation_time_ms=45.2
            )
        )

        assert response.simulation_id == "sim_3501_1701360000"
        assert response.results.economic_multiplier == 1.24
        assert response.metadata.data_year == 2021


class TestMultipliersResponse:
    """Test MultipliersResponse"""

    def test_valid_multipliers(self):
        """Test valid multipliers response"""
        response = MultipliersResponse(
            multipliers={
                "agriculture": 1.96,
                "industry": 2.80,
                "services": 2.50,
                "public": 2.00
            }
        )

        assert response.multipliers["industry"] == 2.80
        assert len(response.multipliers) == 4

    def test_empty_multipliers(self):
        """Test empty multipliers dict"""
        response = MultipliersResponse(multipliers={})

        assert response.multipliers == {}


class TestStateSummaryResponse:
    """Test StateSummaryResponse"""

    def test_valid_state_summary(self):
        """Test valid state summary response"""
        response = StateSummaryResponse(
            total_regions=53,
            total_population=46_000_000,
            total_vab_brl=2_300_000_000_000,
            total_agriculture_brl=34_500_000_000,
            total_industry_brl=506_000_000_000,
            total_services_brl=1_633_000_000_000,
            total_public_brl=126_500_000_000,
            avg_gdp_per_capita=50_000.00,
            agriculture_pct=1.5,
            industry_pct=22.0,
            services_pct=71.0,
            public_pct=5.5
        )

        assert response.total_regions == 53
        assert response.total_population == 46_000_000
        assert response.industry_pct == 22.0

    def test_percentages_sum_validation(self):
        """Test percentages are reasonable"""
        response = StateSummaryResponse(
            total_regions=53,
            total_population=46_000_000,
            total_vab_brl=2_300_000_000_000,
            total_agriculture_brl=34_500_000_000,
            total_industry_brl=506_000_000_000,
            total_services_brl=1_633_000_000_000,
            total_public_brl=126_500_000_000,
            avg_gdp_per_capita=50_000.00,
            agriculture_pct=1.5,
            industry_pct=22.0,
            services_pct=71.0,
            public_pct=5.5
        )

        # Percentages should sum to 100
        total_pct = (
            response.agriculture_pct +
            response.industry_pct +
            response.services_pct +
            response.public_pct
        )
        assert total_pct == 100.0


class TestErrorDetail:
    """Test ErrorDetail schema"""

    def test_valid_error(self):
        """Test valid error response"""
        error = ErrorDetail(
            error="Region not found",
            code="REGION_NOT_FOUND"
        )

        assert error.error == "Region not found"
        assert error.code == "REGION_NOT_FOUND"
        assert error.details is None

    def test_error_with_details(self):
        """Test error with additional details"""
        error = ErrorDetail(
            error="Region not found",
            code="REGION_NOT_FOUND",
            details={"region_code": "9999"}
        )

        assert error.details['region_code'] == "9999"

    def test_error_serialization(self):
        """Test error can be serialized"""
        error = ErrorDetail(
            error="Validation failed",
            code="VALIDATION_ERROR",
            details={"field": "investment_brl", "reason": "must be positive"}
        )

        data = error.model_dump()
        assert data['error'] == "Validation failed"
        assert data['code'] == "VALIDATION_ERROR"
        assert isinstance(data['details'], dict)


class TestSchemaSerialization:
    """Test schema serialization and JSON compatibility"""

    def test_request_to_json(self):
        """Test request schema can be converted to JSON"""
        request = ShockSimulationRequest(
            region_code="3501",
            investment_brl=10_000_000,
            sector="industry"
        )

        json_str = request.model_dump_json()
        assert "3501" in json_str
        assert "10000000" in json_str

    def test_response_to_json(self):
        """Test response schema can be converted to JSON"""
        response = MultipliersResponse(
            multipliers={"industry": 2.80}
        )

        json_str = response.model_dump_json()
        assert "industry" in json_str
        assert "2.80" in json_str

    def test_nested_schema_serialization(self):
        """Test nested schemas serialize correctly"""
        response = RegionsListResponse(
            regions=[
                RegionSummarySchema(
                    cd_rgi="3501",
                    nm_rgi="São Paulo",
                    vab_total_brl=500_000_000_000,
                    vab_agriculture_brl=2_500_000_000,
                    vab_industry_brl=110_000_000_000,
                    vab_services_brl=355_000_000_000,
                    vab_public_brl=32_500_000_000,
                    population=12_325_232,
                    centroid=CentroidSchema(lat=-23.5505, lng=-46.6333)
                )
            ],
            total_regions=1
        )

        data = response.model_dump()
        assert data['regions'][0]['centroid']['lat'] == -23.5505
