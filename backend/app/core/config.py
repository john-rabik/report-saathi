import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ReportSaathi API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # AI & Services
    GEMINI_API_KEY: str = ""
    TESSERACT_CMD: str = ""  # If empty, relies on system PATH
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Limits
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
