"""
Pytest configuration and fixtures for CP2B Maps V3 Backend
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
import psycopg2
from typing import Generator

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

@pytest.fixture
def client() -> Generator:
    """
    Test client for FastAPI app
    """
    from app.main import app

    with TestClient(app) as test_client:
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
    import os
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
