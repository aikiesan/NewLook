"""
Database Connection Management
PostgreSQL + PostGIS connection handling
"""

import os
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

from app.core.config import settings


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
def get_db_cursor(commit: bool = False):
    """
    Context manager for database cursor

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
    Test database connection

    Returns:
        True if connection successful, False otherwise
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Test PostGIS
        cursor.execute("SELECT PostGIS_Version();")
        version = cursor.fetchone()

        cursor.close()
        conn.close()

        print(f"✓ Database connected successfully")
        print(f"✓ PostGIS version: {version[0] if version else 'Unknown'}")

        return True

    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False
