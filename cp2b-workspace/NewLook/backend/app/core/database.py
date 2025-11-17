"""
Database Connection Management
PostgreSQL + PostGIS connection handling
"""

import os
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_db_connection():
    """
    Get PostgreSQL database connection

    Returns:
        psycopg2 connection object
    """
    try:
        conn = psycopg2.connect(
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            cursor_factory=RealDictCursor,  # Return rows as dictionaries
            connect_timeout=10
        )
        return conn
    except psycopg2.Error as e:
        raise Exception(f"Database connection error: {e}")


@contextmanager
def get_db():
    """
    Context manager for database connections (RECOMMENDED).
    Ensures connections are always closed, even if exceptions occur.

    Usage:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM table")
            # ... use connection
            cursor.close()

    Yields:
        psycopg2 connection
    """
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            cursor_factory=RealDictCursor,
            connect_timeout=10
        )
        logger.debug("Database connection opened")
        yield conn
    except psycopg2.Error as e:
        logger.error(f"Database error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()
            logger.debug("Database connection closed")


@contextmanager
def get_db_cursor(commit: bool = False):
    """
    Context manager for database cursor (LEGACY - prefer get_db())

    Args:
        commit: Whether to commit the transaction

    Yields:
        psycopg2 cursor
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        yield cursor

        if commit:
            conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()


def test_db_connection() -> bool:
    """
    Test database connection and PostGIS availability.
    Used for health checks.

    Returns:
        True if connection successful, False otherwise
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Test basic connectivity
            cursor.execute("SELECT 1")
            result = cursor.fetchone()

            # Test PostGIS
            cursor.execute("SELECT PostGIS_Version();")
            version = cursor.fetchone()

            cursor.close()

            logger.info(f"✓ Database connected successfully")
            logger.info(f"✓ PostGIS version: {version[0] if version else 'Unknown'}")

            return result is not None

    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        return False
