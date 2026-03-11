from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    debug: bool = True
    host: str = "127.0.0.1"
    port: int = 8000
    upload_dir: str = "uploads/routines"
    max_file_size_mb: int = 10
    allowed_origins: List[str] = [
        "http://localhost:3000"
    ]
    tesseract_cmd: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()