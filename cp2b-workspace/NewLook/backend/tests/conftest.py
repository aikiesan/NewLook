"""
PILAR-2b V3 Backend - Test Configuration
Pytest configuration and fixtures for comprehensive testing
"""
import pytest
import asyncio
import os
from typing import AsyncGenerator, Generator
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
import psycopg2

# Mock the database connection for tests
@pytest.fixture(autouse=True)
def mock_db_connection(monkeypatch):
    """Mock database connections for all tests"""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor

    def mock_get_db():
        yield mock_conn

    monkeypatch.setattr("app.core.database.get_db", mock_get_db)
    return mock_conn, mock_cursor

def create_test_app():
    """Create a FastAPI app for testing without middleware restrictions"""
    from app.api.v1.api import api_router

    test_app = FastAPI(
        title="PILAR-2b V3 API - Test",
        description="Test version without middleware restrictions",
        version="3.0.0",
    )

    # Include API routes without middleware
    test_app.include_router(api_router, prefix="/api/v1")
    return test_app

@pytest.fixture(scope="function")
def test_app() -> FastAPI:
    """Create a FastAPI app instance for testing"""
    return create_test_app()

@pytest.fixture(scope="function")
def client(test_app: FastAPI) -> Generator[TestClient, None, None]:
    """Create a TestClient for synchronous API testing"""
    with TestClient(test_app, base_url="http://testserver") as test_client:
        yield test_client

@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing"""
    mock_client = MagicMock()
    return mock_client

@pytest.fixture
def sample_municipality():
    """Sample municipality data for testing"""
    return {
        "id": 1,
        "name": "São Paulo",
        "cod_ibge": "3550308",
        "state": "SP",
        "area_km2": 1521.11,
        "population": 12396372,
    }

@pytest.fixture
def sample_residue():
    """Sample residue data for testing"""
    return {
        "id": 1,
        "name": "Vinhaça",
        "category": "agroindustrial",
        "biogas_potential": 25.5,
    }

@pytest.fixture
def sample_user():
    """Sample user data for testing"""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "full_name": "Test User",
        "role": "autenticado",
    }

@pytest.fixture
def auth_headers():
    """Authentication headers for testing"""
    return {
        "Authorization": "Bearer mock-jwt-token"
    }

@pytest.fixture
def mock_jwt_decode(monkeypatch):
    """Mock JWT token decoding"""
    def mock_decode(token, key, algorithms):
        return {
            "sub": "test-user-id",
            "email": "test@example.com",
            "exp": 9999999999,
        }

    monkeypatch.setattr("jose.jwt.decode", mock_decode)

# Database test fixtures
@pytest.fixture
def db_connection():
    """
    Real database connection for integration tests
    Use this sparingly and mark tests with @pytest.mark.database
    """
    # Only create real connection if DATABASE_URL is set for integration tests
    if not os.getenv("TEST_DATABASE_URL"):
        pytest.skip("Integration tests require TEST_DATABASE_URL")

    conn = psycopg2.connect(os.getenv("TEST_DATABASE_URL"))
    yield conn
    conn.close()

@pytest.fixture
def db_transaction(db_connection):
    """
    Database transaction that rolls back after test
    """
    db_connection.autocommit = False
    cursor = db_connection.cursor()
    yield cursor
    db_connection.rollback()
    cursor.close()

# Advanced testing fixtures
class TestSettings:
    """Test configuration settings"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = "sqlite:///:memory:"
    SECRET_KEY = "test-secret-key-do-not-use-in-production"

@pytest.fixture
def test_settings() -> TestSettings:
    """Test application settings"""
    return TestSettings()

# Event loop fixture for async tests
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Markers for test categorization
pytest.mark.unit = pytest.mark.unit
pytest.mark.integration = pytest.mark.integration
pytest.mark.api = pytest.mark.api
pytest.mark.slow = pytest.mark.slow
pytest.mark.auth = pytest.mark.auth
pytest.mark.database = pytest.mark.database