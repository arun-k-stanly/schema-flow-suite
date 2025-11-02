from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env", "../../.env"), env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = Field(default="Schema Flow Suite API")
    environment: str = Field(default="development")
    api_prefix: str = Field(default="/api")

    # Frontend CORS
    allowed_origins_raw: str | None = Field(default=None, alias="ALLOWED_ORIGINS")

    # Groq
    groq_api_key: Optional[str] = Field(default=None, alias="GROQ_API_KEY")

    # Spark
    spark_master: str | None = Field(default=None, alias="SPARK_MASTER")

    # Storage
    # Store artifacts outside backend_py to avoid dev server reloads on writes
    storage_dir: str = Field(default="../storage", alias="STORAGE_DIR")

    @property
    def allowed_origins(self) -> List[str] | None:
        if not self.allowed_origins_raw:
            return None
        return [o.strip() for o in self.allowed_origins_raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()


