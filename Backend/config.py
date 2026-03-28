# config.py
# Single source of truth for all environment variables.
# pydantic-settings reads from .env automatically.
# Import `settings` anywhere in the app — never os.environ directly.

from pydantic_settings import BaseSettings
from typing import List



class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/expense_tracker"
    JWT_SECRET_KEY: str = "change-this"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()