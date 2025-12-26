"""
CP2B Maps V3 Backend - Test Configuration
Shared fixtures and test setup for all backend tests
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient
import os
import tempfile

from app.main import app
from app.core.config import settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def test_app() -> FastAPI:
    """
    Create a FastAPI app instance for testing
    """
    return app


@pytest.fixture(scope="function")
def client(test_app: FastAPI) -> Generator[TestClient, None, None]:
    """
    Create a TestClient for synchronous API testing
    """
    # Override settings for testing
    from app.core.config import settings
    original_debug = settings.DEBUG
    settings.DEBUG = True

    with TestClient(test_app, base_url="http://testserver") as test_client:
        yield test_client

    # Restore original settings
    settings.DEBUG = original_debug


@pytest.fixture(scope="function")
async def async_client(test_app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an AsyncClient for asynchronous API testing
    """
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(scope="function")
def sample_municipality_data():
    """Sample municipality data for testing"""
    return {
        "id": 999,
        "name": "Test Municipality",
        "code": "9999999",
        "population": 50000,
        "area_km2": 100.0,
        "biogas_potential": 45.5,
        "coordinates": {
            "lat": -23.5505,
            "lng": -46.6333
        }
    }


@pytest.fixture(scope="function")
def sample_municipalities_list():
    """Sample list of municipalities for testing"""
    return [
        {
            "id": 1,
            "name": "Test City A",
            "code": "1111111",
            "population": 100000,
            "area_km2": 150.0,
            "biogas_potential": 75.0,
            "coordinates": {"lat": -22.0, "lng": -45.0}
        },
        {
            "id": 2,
            "name": "Test City B",
            "code": "2222222",
            "population": 75000,
            "area_km2": 120.0,
            "biogas_potential": 60.0,
            "coordinates": {"lat": -23.0, "lng": -46.0}
        }
    ]


@pytest.fixture(scope="session")
def test_env():
    """Set test environment variables"""
    original_env = os.environ.copy()

    # Set test environment
    os.environ["ENVIRONMENT"] = "test"
    os.environ["TESTING"] = "true"
    os.environ["DEBUG"] = "false"

    yield

    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)


@pytest.fixture(scope="function")
def temp_dir():
    """Create a temporary directory for test files"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield tmp_dir


class TestSettings:
    """Test-specific settings"""
    TESTING = True
    DEBUG = False
    HOST = "127.0.0.1"
    PORT = 8001  # Different port for testing
    ALLOWED_ORIGINS = ["http://localhost:3000", "http://test"]
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "test"]


@pytest.fixture(scope="session")
def test_settings():
    """Provide test-specific settings"""
    return TestSettings()


# Markers for test categorization
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.api = pytest.mark.api
pytest.mark.slow = pytest.mark.slow
pytest.mark.auth = pytest.mark.auth