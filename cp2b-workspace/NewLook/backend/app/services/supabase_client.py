"""
Supabase client initialization for CP2B Maps V3
Thread-safe singleton pattern with double-check locking
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional
import threading
import logging

logger = logging.getLogger(__name__)

# Global Supabase client (thread-safe singleton)
_supabase_client: Optional[Client] = None
_client_lock = threading.Lock()

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance (thread-safe singleton pattern).
    Uses double-check locking for optimal performance in multi-threaded environments.

    Returns:
        Client: Supabase client instance

    Raises:
        ValueError: If required environment variables are not set
    """
    global _supabase_client

    # First check (without lock) - fast path for already-initialized client
    if _supabase_client is None:
        # Acquire lock for initialization
        with _client_lock:
            # Double-check after acquiring lock (another thread might have initialized)
            if _supabase_client is None:
                if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                    raise ValueError(
                        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment"
                    )

                logger.info("Initializing Supabase client (service role)...")
                _supabase_client = create_client(
                    supabase_url=settings.SUPABASE_URL,
                    supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("✅ Supabase client initialized successfully")

    return _supabase_client

def get_supabase_anon_client() -> Client:
    """
    Get Supabase client with anon key (for client-side operations)

    Returns:
        Client: Supabase client with anon key
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment"
        )

    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_ANON_KEY
    )
