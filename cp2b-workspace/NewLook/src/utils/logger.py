"""
Sistema de logging estruturado para CP2B Maps V3.
"""
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
from typing import Optional

from config.settings import LOGS_DIR, LOG_LEVEL

def setup_logger(
    name: str = "cp2b_maps",
    log_file: Optional[str] = None,
    level: str = LOG_LEVEL
) -> logging.Logger:
    """
    Configura e retorna um logger estruturado.

    Args:
        name: Nome do logger
        log_file: Arquivo de log (opcional)
        level: Nível de log (DEBUG, INFO, WARNING, ERROR)

    Returns:
        Logger configurado
    """
    # Criar diretório de logs se não existir
    LOGS_DIR.mkdir(exist_ok=True)

    # Configurar logger
    logger = logging.getLogger(name)

    # Evitar duplicação de handlers
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, level.upper()))

    # Formato das mensagens
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Handler para console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Handler para arquivo (com rotação)
    if log_file is None:
        log_file = f"app.log"

    log_path = LOGS_DIR / log_file

    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_path,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

# Logger padrão da aplicação
logger = setup_logger()