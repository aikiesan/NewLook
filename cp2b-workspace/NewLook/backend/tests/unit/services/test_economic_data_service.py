"""
Unit tests for Economic Data Service
Tests data access layer for economic simulation data
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from contextlib import contextmanager

from app.services.economic_data_service import (
    EconomicDataService,
    get_economic_data_service
)


class MockCursor:
    """Mock database cursor"""
    def __init__(self, return_value=None):
        self.return_value = return_value
        self.executed_queries = []
        self.executed_params = []

    def execute(self, query, params=None):
        self.executed_queries.append(query)
        self.executed_params.append(params)

    def fetchone(self):
        if isinstance(self.return_value, list):
            return self.return_value[0] if self.return_value else None
        return self.return_value

    def fetchall(self):
        if isinstance(self.return_value, list):
            return self.return_value
        return [self.return_value] if self.return_value else []

    def close(self):
        pass


class MockConnection:
    """Mock database connection"""
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self):
        return self._cursor


@contextmanager
def mock_db_context(cursor):
    """Mock get_db context manager"""
    yield MockConnection(cursor)


@pytest.fixture
def mock_cache():
    """Mock cache service"""
    cache = Mock()
    cache.get.return_value = None  # Default: cache miss
    cache.set.return_value = None
    cache.clear.return_value = None
    return cache


@pytest.fixture
def service(mock_cache):
    """Create service instance with mocked cache"""
    with patch("app.services.economic_data_service.get_cache_service", return_value=mock_cache):
        service = EconomicDataService()
        return service


class TestInitialization:
    """Test service initialization"""

    def test_initialization(self, mock_cache):
        """Test service initializes with cache"""
        with patch("app.services.economic_data_service.get_cache_service", return_value=mock_cache):
            service = EconomicDataService()

            assert service.cache == mock_cache
            assert service._leontief_calculator_cache is None


class TestGetAllRegions:
    """Test get_all_regions method"""

    def test_get_all_regions_prefers_brazil(self, service):
        """Test that Brazil regions are preferred when available"""
        brazil_regions = [
            {'cd_rgint': '3501', 'nm_rgint': 'São Paulo', 'vab_total_brl': 1000000}
        ]

        with patch.object(service, 'get_all_brazil_regions', return_value=brazil_regions):
            regions = service.get_all_regions()

            assert regions == brazil_regions
            assert len(regions) == 1

    def test_get_all_regions_falls_back_to_sp(self, service):
        """Test fallback to São Paulo regions when Brazil regions empty"""
        sp_regions = [
            {'id': 1, 'cd_rgi': '3501', 'nm_rgi': 'São Paulo', 'vab_total_brl': 500000}
        ]

        mock_cursor = MockCursor(sp_regions)

        with patch.object(service, 'get_all_brazil_regions', return_value=[]):
            with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
                regions = service.get_all_regions()

                assert len(regions) == 1
                assert regions[0]['nm_rgi'] == 'São Paulo'

    def test_get_all_regions_cache_hit(self, service):
        """Test cache hit returns cached data"""
        cached_regions = [{'cd_rgi': '3501', 'nm_rgi': 'São Paulo'}]
        service.cache.get.return_value = cached_regions

        with patch.object(service, 'get_all_brazil_regions', return_value=[]):
            regions = service.get_all_regions()

            assert regions == cached_regions
            service.cache.get.assert_called_once()

    def test_get_all_regions_caches_result(self, service):
        """Test result is cached after database fetch"""
        sp_regions = [{'id': 1, 'nm_rgi': 'São Paulo'}]
        mock_cursor = MockCursor(sp_regions)

        with patch.object(service, 'get_all_brazil_regions', return_value=[]):
            with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
                service.get_all_regions()

                service.cache.set.assert_called_once()
                call_args = service.cache.set.call_args
                assert call_args[0][0] == "economic:all_regions"
                assert call_args[0][1] == sp_regions
                assert call_args[1]['ttl'] == 300


class TestGetRegionByCode:
    """Test get_region_by_code method"""

    def test_get_region_prefers_brazil(self, service):
        """Test Brazil region is returned first"""
        brazil_region = {'cd_rgi': '3501', 'nm_rgi': 'São Paulo', 'vab_total_brl': 1000000}

        with patch.object(service, 'get_brazil_region_by_code', return_value=brazil_region):
            region = service.get_region_by_code('3501')

            assert region == brazil_region

    def test_get_region_falls_back_to_sp(self, service):
        """Test fallback to SP region when Brazil not found"""
        sp_region = {'id': 1, 'cd_rgi': '3501', 'nm_rgi': 'São Paulo'}
        mock_cursor = MockCursor(sp_region)

        with patch.object(service, 'get_brazil_region_by_code', return_value=None):
            with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
                region = service.get_region_by_code('3501')

                assert region['nm_rgi'] == 'São Paulo'

    def test_get_region_cache_hit(self, service):
        """Test cache hit returns cached region"""
        cached_region = {'cd_rgi': '3501', 'nm_rgi': 'São Paulo'}
        service.cache.get.return_value = cached_region

        with patch.object(service, 'get_brazil_region_by_code', return_value=None):
            region = service.get_region_by_code('3501')

            assert region == cached_region

    def test_get_region_not_found(self, service):
        """Test returns None when region not found"""
        mock_cursor = MockCursor(None)

        with patch.object(service, 'get_brazil_region_by_code', return_value=None):
            with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
                region = service.get_region_by_code('99999')

                assert region is None

    def test_get_region_caches_result(self, service):
        """Test successful fetch is cached"""
        sp_region = {'cd_rgi': '3501', 'nm_rgi': 'São Paulo'}
        mock_cursor = MockCursor(sp_region)

        with patch.object(service, 'get_brazil_region_by_code', return_value=None):
            with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
                service.get_region_by_code('3501')

                service.cache.set.assert_called_once()


class TestGetLeontiefMatrix:
    """Test get_leontief_matrix method"""

    def test_get_leontief_matrix_success(self, service):
        """Test fetching Leontief matrix"""
        matrix_rows = [
            {'from_sector': 'agriculture', 'to_agriculture': 1.2, 'to_industry': 0.3},
            {'from_sector': 'industry', 'to_agriculture': 0.5, 'to_industry': 1.4},
            {'from_sector': 'services', 'to_agriculture': 0.2, 'to_industry': 0.3},
            {'from_sector': 'public', 'to_agriculture': 0.1, 'to_industry': 0.2}
        ]
        mock_cursor = MockCursor(matrix_rows)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            matrix = service.get_leontief_matrix()

            assert len(matrix) == 4
            assert matrix[0]['from_sector'] == 'agriculture'

    def test_get_leontief_matrix_cache_hit(self, service):
        """Test cache hit returns cached matrix"""
        cached_matrix = [{'from_sector': 'agriculture'}]
        service.cache.get.return_value = cached_matrix

        matrix = service.get_leontief_matrix()

        assert matrix == cached_matrix
        service.cache.get.assert_called_with("economic:leontief_matrix")

    def test_get_leontief_matrix_caches_result(self, service):
        """Test matrix is cached after fetch"""
        matrix_rows = [{'from_sector': 'agriculture'}]
        mock_cursor = MockCursor(matrix_rows)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            service.get_leontief_matrix()

            service.cache.set.assert_called_once()
            assert service.cache.set.call_args[0][0] == "economic:leontief_matrix"

    def test_get_leontief_matrix_filters_by_type(self, service):
        """Test query filters for leontief_inverse type"""
        mock_cursor = MockCursor([])

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            service.get_leontief_matrix()

            query = mock_cursor.executed_queries[0]
            assert "WHERE matrix_type = 'leontief_inverse'" in query


class TestGetConversionFactors:
    """Test get_conversion_factors method"""

    def test_get_conversion_factors_success(self, service):
        """Test fetching conversion factors"""
        db_rows = [
            {
                'factor_type': 'vab_coefficient',
                'factor_name': 'VAB Coefficient',
                'agriculture': 0.699,
                'industry': 0.291,
                'services': 0.615,
                'public': 0.0,
                'unit': 'ratio',
                'description': 'VAB to GDP conversion',
                'source': 'IBGE'
            },
            {
                'factor_type': 'employment',
                'factor_name': 'Employment',
                'agriculture': 12.5,
                'industry': 8.3,
                'services': 14.8,
                'public': 10.2,
                'unit': 'jobs/million BRL',
                'description': 'Employment generation',
                'source': 'IBGE'
            }
        ]
        mock_cursor = MockCursor(db_rows)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            factors = service.get_conversion_factors()

            assert 'vab_coefficient' in factors
            assert 'employment' in factors
            assert factors['vab_coefficient']['agriculture'] == 0.699
            assert factors['employment']['services'] == 14.8

    def test_get_conversion_factors_handles_null(self, service):
        """Test NULL values are converted to 0"""
        db_rows = [
            {
                'factor_type': 'test',
                'factor_name': 'Test',
                'agriculture': None,
                'industry': 1.5,
                'services': None,
                'public': None,
                'unit': 'test',
                'description': 'test',
                'source': 'test'
            }
        ]
        mock_cursor = MockCursor(db_rows)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            factors = service.get_conversion_factors()

            assert factors['test']['agriculture'] == 0
            assert factors['test']['industry'] == 1.5
            assert factors['test']['services'] == 0

    def test_get_conversion_factors_cache_hit(self, service):
        """Test cache hit"""
        cached_factors = {'vab_coefficient': {'agriculture': 0.699}}
        service.cache.get.return_value = cached_factors

        factors = service.get_conversion_factors()

        assert factors == cached_factors


class TestGetLeontiefCalculator:
    """Test get_leontief_calculator method"""

    def test_get_calculator_creates_instance(self, service):
        """Test calculator is created from database data"""
        matrix_rows = [{'from_sector': 'agriculture'}]
        factors = {'vab_coefficient': {}}

        with patch.object(service, 'get_leontief_matrix', return_value=matrix_rows):
            with patch.object(service, 'get_conversion_factors', return_value=factors):
                with patch("app.services.economic_data_service.create_leontief_calculator_from_db") as mock_create:
                    mock_calculator = Mock()
                    mock_create.return_value = mock_calculator

                    calculator = service.get_leontief_calculator()

                    assert calculator == mock_calculator
                    mock_create.assert_called_once_with(
                        leontief_matrix_rows=matrix_rows,
                        conversion_factors=factors
                    )

    def test_get_calculator_caches_instance(self, service):
        """Test calculator is cached after creation"""
        matrix_rows = [{'from_sector': 'agriculture'}]
        factors = {'vab_coefficient': {}}

        with patch.object(service, 'get_leontief_matrix', return_value=matrix_rows):
            with patch.object(service, 'get_conversion_factors', return_value=factors):
                with patch("app.services.economic_data_service.create_leontief_calculator_from_db") as mock_create:
                    mock_calculator = Mock()
                    mock_create.return_value = mock_calculator

                    # First call
                    calc1 = service.get_leontief_calculator()
                    # Second call should return cached instance
                    calc2 = service.get_leontief_calculator()

                    assert calc1 == calc2
                    # Should only create once
                    assert mock_create.call_count == 1


class TestGetStateSummary:
    """Test get_state_summary method"""

    def test_get_state_summary_success(self, service):
        """Test fetching state summary"""
        summary = {
            'total_vab_brl': 2300000000000,
            'total_population': 44000000,
            'industry_pct': 22.5
        }
        mock_cursor = MockCursor(summary)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            result = service.get_state_summary()

            assert result['total_vab_brl'] == 2300000000000
            assert 'industry_pct' in result

    def test_get_state_summary_cache_hit(self, service):
        """Test cache hit"""
        cached_summary = {'total_vab_brl': 2300000000000}
        service.cache.get.return_value = cached_summary

        result = service.get_state_summary()

        assert result == cached_summary


class TestGetTopRegions:
    """Test get_top_regions method"""

    def test_get_top_regions_default_limit(self, service):
        """Test getting top 10 regions by default"""
        top_regions = [
            {'nm_rgi': 'São Paulo', 'vab_total_brl': 1000000},
            {'nm_rgi': 'Campinas', 'vab_total_brl': 500000}
        ]
        mock_cursor = MockCursor(top_regions)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            regions = service.get_top_regions()

            assert len(regions) == 2
            # Verify LIMIT was used
            assert mock_cursor.executed_params[0] == (10,)

    def test_get_top_regions_custom_limit(self, service):
        """Test custom limit parameter"""
        top_regions = [{'nm_rgi': 'São Paulo'}]
        mock_cursor = MockCursor(top_regions)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            regions = service.get_top_regions(limit=5)

            assert mock_cursor.executed_params[0] == (5,)

    def test_get_top_regions_cache_hit(self, service):
        """Test cache hit with limit in key"""
        cached_regions = [{'nm_rgi': 'São Paulo'}]
        service.cache.get.return_value = cached_regions

        regions = service.get_top_regions(limit=5)

        assert regions == cached_regions
        service.cache.get.assert_called_with("economic:top_regions:5")


class TestGetRegionByCoordinates:
    """Test get_region_by_coordinates method"""

    def test_get_region_by_coordinates_success(self, service):
        """Test finding region by coordinates"""
        coord_result = {'cd_rgi': '3501', 'nm_rgi': 'São Paulo'}
        full_region = {'cd_rgi': '3501', 'nm_rgi': 'São Paulo', 'vab_total_brl': 1000000}

        mock_cursor = MockCursor(coord_result)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            with patch.object(service, 'get_region_by_code', return_value=full_region):
                region = service.get_region_by_coordinates(-23.5505, -46.6333)

                assert region == full_region
                # Verify function was called with correct params
                assert mock_cursor.executed_params[0] == (-23.5505, -46.6333)

    def test_get_region_by_coordinates_not_found(self, service):
        """Test returns None when point not in any region"""
        mock_cursor = MockCursor(None)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            region = service.get_region_by_coordinates(-23.5505, -46.6333)

            assert region is None


class TestCalculateDistanceBetweenRegions:
    """Test calculate_distance_between_regions method"""

    def test_calculate_distance_success(self, service):
        """Test calculating distance between regions"""
        distance_result = {'distance': 90.5}
        mock_cursor = MockCursor(distance_result)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            distance = service.calculate_distance_between_regions('3501', '3509')

            assert distance == 90.5
            # Verify parameters
            assert mock_cursor.executed_params[0] == ('3501', '3509')

    def test_calculate_distance_cache_hit(self, service):
        """Test cache hit"""
        service.cache.get.return_value = 90.5

        distance = service.calculate_distance_between_regions('3501', '3509')

        assert distance == 90.5
        service.cache.get.assert_called_with("economic:distance:3501:3509")

    def test_calculate_distance_not_found(self, service):
        """Test returns None when regions not found"""
        mock_cursor = MockCursor(None)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            distance = service.calculate_distance_between_regions('99999', '99998')

            assert distance is None

    def test_calculate_distance_caches_result(self, service):
        """Test result is cached"""
        distance_result = {'distance': 90.5}
        mock_cursor = MockCursor(distance_result)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            service.calculate_distance_between_regions('3501', '3509')

            service.cache.set.assert_called_once()
            assert service.cache.set.call_args[0][0] == "economic:distance:3501:3509"
            assert service.cache.set.call_args[0][1] == 90.5


class TestBrazilRegions:
    """Test Brazil-specific region methods"""

    def test_get_all_brazil_regions(self, service):
        """Test fetching all Brazil regions"""
        brazil_rows = [
            {
                'cd_rgint': '3501',
                'nm_rgint': 'São Paulo',
                'cd_uf': '35',
                'sigla_uf': 'SP',
                'vab_total_brl': 1000000,
                'vab_agriculture_brl': 100000,
                'vab_industry_brl': 300000,
                'vab_services_brl': 500000,
                'vab_public_brl': 100000,
                'population': 12000000,
                'gdp_per_capita_brl': 83333,
                'centroid_lat': -23.5505,
                'centroid_lng': -46.6333,
                'data_year': 2021,
                'created_at': None,
                'updated_at': None
            }
        ]
        mock_cursor = MockCursor(brazil_rows)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            regions = service.get_all_brazil_regions()

            assert len(regions) == 1
            # Verify field transformation
            assert regions[0]['cd_rgi'] == '3501'  # Renamed from cd_rgint
            assert regions[0]['nm_rgi'] == 'São Paulo'  # Renamed from nm_rgint
            # Verify centroid object created
            assert regions[0]['centroid']['lat'] == -23.5505
            assert regions[0]['centroid']['lng'] == -46.6333
            # Verify flat fields kept
            assert regions[0]['centroid_lat'] == -23.5505

    def test_get_brazil_region_by_code(self, service):
        """Test fetching specific Brazil region"""
        brazil_row = {
            'cd_rgint': '3501',
            'nm_rgint': 'São Paulo',
            'cd_uf': '35',
            'sigla_uf': 'SP',
            'vab_total_brl': 1000000,
            'vab_agriculture_brl': 100000,
            'vab_industry_brl': 300000,
            'vab_services_brl': 500000,
            'vab_public_brl': 100000,
            'population': 12000000,
            'gdp_per_capita_brl': 83333,
            'centroid_lat': -23.5505,
            'centroid_lng': -46.6333,
            'data_year': 2021
        }
        mock_cursor = MockCursor(brazil_row)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            region = service.get_brazil_region_by_code('3501')

            assert region['cd_rgi'] == '3501'
            assert region['nm_rgi'] == 'São Paulo'
            assert 'centroid' in region

    def test_get_brazil_region_not_found(self, service):
        """Test returns None when Brazil region not found"""
        mock_cursor = MockCursor(None)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            region = service.get_brazil_region_by_code('99999')

            assert region is None

    def test_get_brazil_distance(self, service):
        """Test fetching pre-computed Brazil distance"""
        distance_row = {'distance_km': 1500.5}
        mock_cursor = MockCursor(distance_row)

        with patch("app.services.economic_data_service.get_db", return_value=mock_db_context(mock_cursor)):
            distance = service.get_brazil_distance('3501', '4106')

            assert distance == 1500.5

    def test_get_brazil_distance_cache_hit(self, service):
        """Test Brazil distance cache"""
        service.cache.get.return_value = 1500.5

        distance = service.get_brazil_distance('3501', '4106')

        assert distance == 1500.5
        service.cache.get.assert_called_with("economic:brazil_distance:3501:4106")


class TestClearCache:
    """Test clear_cache method"""

    def test_clear_cache(self, service):
        """Test clearing all caches"""
        # Set calculator cache
        service._leontief_calculator_cache = Mock()

        service.clear_cache()

        # Verify cache cleared
        service.cache.clear.assert_called_once()
        assert service._leontief_calculator_cache is None


class TestSingleton:
    """Test singleton pattern"""

    def test_get_economic_data_service_singleton(self):
        """Test singleton returns same instance"""
        # Reset singleton
        import app.services.economic_data_service as module
        module._economic_data_service = None

        with patch("app.services.economic_data_service.get_cache_service"):
            service1 = get_economic_data_service()
            service2 = get_economic_data_service()

            assert service1 is service2

    def test_get_economic_data_service_creates_instance(self):
        """Test singleton creates instance on first call"""
        import app.services.economic_data_service as module
        module._economic_data_service = None

        with patch("app.services.economic_data_service.get_cache_service"):
            service = get_economic_data_service()

            assert isinstance(service, EconomicDataService)
