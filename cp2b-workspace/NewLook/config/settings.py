"""
Configurações centralizadas da aplicação.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_RATE_LIMIT = int(os.getenv("GEMINI_RATE_LIMIT_PER_DAY", 5))

# Application
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")

# Database
DATABASE_PATH = DATA_DIR / "database" / "municipios.db"

# Validações
def validate_config():
    """Valida configurações essenciais."""
    required = {
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_ANON_KEY": SUPABASE_ANON_KEY,
    }

    missing = [k for k, v in required.items() if not v]

    if missing:
        raise ValueError(f"Missing required env vars: {', '.join(missing)}")

# Tema CP2B
THEME = {
    "primary_color": "#1E5128",
    "secondary_color": "#4E9F3D",
    "background_color": "#FFFFFF",
    "text_color": "#191A19",
    "accent_color": "#D8E9A8",
}