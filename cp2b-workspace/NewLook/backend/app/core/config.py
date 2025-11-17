"""
Configuration settings for CP2B Maps V3 Backend
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App settings
    APP_NAME: str = "CP2B Maps V3 API"
    VERSION: str = "3.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "https://your-frontend-domain.com",
        "*"  # Allow all origins in production (can be restricted later)
    ]
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "newlook-production.up.railway.app",
        "*"  # Allow all hosts in production
    ]

    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/cp2b_maps"
    DATABASE_URL_SYNC: str = "postgresql://user:password@localhost:5432/cp2b_maps"

    # PostgreSQL connection details (parsed from DATABASE_URL or set individually)
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "postgres"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""

    # Supabase settings
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # External APIs
    GEMINI_API_KEY: Optional[str] = None

    # File paths
    DATA_DIR: Path = Path(__file__).parent.parent.parent.parent / "data"
    UPLOAD_DIR: Path = Path(__file__).parent.parent.parent / "uploads"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create settings instance
settings = Settings()