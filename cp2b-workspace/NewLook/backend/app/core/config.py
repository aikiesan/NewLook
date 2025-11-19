"""
Configuration settings for CP2B Maps V3 Backend
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import List, Optional
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App settings
    APP_NAME: str = "CP2B Maps V3 API"
    VERSION: str = "3.0.1"
    APP_ENV: str = "development"  # development, staging, production
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings - NO WILDCARDS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
    ]
    # Production origins - comma-separated, includes main and preview deployments
    PRODUCTION_ORIGINS: str = "https://new-look-nu.vercel.app,https://new-look-ouz6xcmpk-lucas-nakamura-cerejos-projects.vercel.app,https://newlook.vercel.app"
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "newlook-production.up.railway.app",
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

    # JWT settings - CRITICAL: Change in production
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

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v, info):
        """Ensure SECRET_KEY is secure in production"""
        app_env = os.getenv("APP_ENV", "development")

        if v == "your-secret-key-change-in-production":
            if app_env == "production":
                raise ValueError(
                    "🚨 SECURITY ERROR: SECRET_KEY must be changed in production!\n"
                    "Generate a secure key with: openssl rand -hex 32\n"
                    "Set in environment: export SECRET_KEY=<generated-key>"
                )
            logger.warning("⚠️  Using default SECRET_KEY in development")

        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY too short ({len(v)} chars). Must be at least 32 characters.\n"
                f"Generate with: openssl rand -hex 32"
            )

        return v

    @field_validator('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
    @classmethod
    def validate_supabase(cls, v, info):
        """Ensure Supabase credentials are set if using auth"""
        app_env = os.getenv("APP_ENV", "development")
        field_name = info.field_name

        if not v and app_env == "production":
            logger.warning(
                f"⚠️  {field_name} not set in production. "
                f"Set with: export {field_name}=<your-value>"
            )

        return v

    @field_validator('POSTGRES_PASSWORD')
    @classmethod
    def validate_postgres_password(cls, v):
        """Ensure database password is set"""
        app_env = os.getenv("APP_ENV", "development")

        if not v and app_env == "production":
            raise ValueError(
                "🚨 POSTGRES_PASSWORD is required in production!\n"
                "Set in environment: export POSTGRES_PASSWORD=<secure-password>"
            )

        if v and len(v) < 12 and app_env == "production":
            raise ValueError(
                "POSTGRES_PASSWORD must be at least 12 characters in production"
            )

        return v

    def get_all_origins(self) -> List[str]:
        """Get all allowed CORS origins including production"""
        origins = self.ALLOWED_ORIGINS.copy()

        if self.PRODUCTION_ORIGINS:
            prod_origins = [o.strip() for o in self.PRODUCTION_ORIGINS.split(",")]
            origins.extend(prod_origins)
            logger.info(f"Added {len(prod_origins)} production origins")

        return origins

    def validate_all(self) -> bool:
        """Validate all settings and log status"""
        try:
            logger.info(f"Environment: {self.APP_ENV}")
            logger.info(f"Debug mode: {self.DEBUG}")
            logger.info(f"Database: {self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}")

            all_origins = self.get_all_origins()
            logger.info(f"CORS origins: {len(all_origins)} configured")

            # Security checks for production
            if self.APP_ENV == "production":
                if "*" in all_origins:
                    raise ValueError("🚨 Wildcard CORS (*) not allowed in production!")
                if len(self.SECRET_KEY) < 32:
                    raise ValueError("🚨 SECRET_KEY too short for production")
                logger.info("✅ Production security validation passed")

            return True

        except Exception as e:
            logger.error(f"❌ Settings validation failed: {e}")
            return False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance with error handling
try:
    settings = Settings()
    settings.validate_all()
    logger.info("✅ Configuration loaded successfully")
except ValidationError as e:
    logger.error(f"\n{'='*60}\n🚨 CONFIGURATION ERROR\n{'='*60}")
    for error in e.errors():
        field = error['loc'][0]
        message = error['msg']
        logger.error(f"❌ {field}: {message}")
    logger.error(f"{'='*60}\n")
    raise
except Exception as e:
    logger.error(f"Failed to load settings: {e}")
    raise