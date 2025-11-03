from functools import lru_cache
from typing import List, Optional
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_file_candidates() -> tuple[str, ...]:
    # Resolve .env locations robustly regardless of where uvicorn is launched from
    # This file lives at backend_py/app/core/config.py
    here = Path(__file__).resolve()
    backend_root = here.parents[2]  # backend_py/
    repo_root = backend_root.parent  # project root
    candidates = [
        backend_root / ".env",  # backend_py/.env (preferred)
        repo_root / ".env",      # project/.env
        here.parent / ".env",    # backend_py/app/core/.env (fallback if present)
    ]
    # Only include files that exist to avoid slow I/O inside settings loader
    return tuple(str(p) for p in candidates if p.exists()) or (str(backend_root / ".env"),)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_file_candidates(), env_file_encoding="utf-8", case_sensitive=False)

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


