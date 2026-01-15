from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # --- Proyecto ---
    PROJECT_NAME: str = "Sistema de Reservas Vecinos"
    API_V1_STR: str = "/api/v1"

    # --- Base de datos ---
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    DATABASE_URL: str

    # --- Seguridad ---
    SECRET_KEY: str
    PASSWORD_RESET_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- Administración ---
    ADMIN_USER: str
    ADMIN_PASSWORD: str
    ADMIN_EMAIL: str
    # Email al que se desvían los correos si el destinatario es el admin (para pruebas)
    DEVIATION_EMAIL: Optional[str] = None

    # --- Email (SMTP) ---
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str
    MAIL_FROM_NAME: str = "Sistema Residencial"

    # --- Firebase ---
    FIREBASE_CREDENTIALS_PATH: str

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()