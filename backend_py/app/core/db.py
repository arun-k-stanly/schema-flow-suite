from __future__ import annotations

from pathlib import Path
from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import settings


_engine = None
_SessionLocal: Optional[sessionmaker] = None


def _resolve_sqlite_url() -> str:
    # Default to a SQLite DB under the shared storage dir
    storage_dir = Path(settings.storage_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)
    db_path = storage_dir / "app.db"
    return f"sqlite:///{db_path.as_posix()}"


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        database_url = getattr(settings, "database_url", None) or _resolve_sqlite_url()
        _engine = create_engine(database_url, connect_args={"check_same_thread": False})
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def get_db() -> Generator[Session, None, None]:
    # Dependency for FastAPI routes
    global _SessionLocal
    if _SessionLocal is None:
        get_engine()
    assert _SessionLocal is not None
    db: Session = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(create_all: bool = True):
    # Create tables if requested
    engine = get_engine()
    if create_all:
        from ..models.db_models import Base  # local import to avoid circulars
        Base.metadata.create_all(bind=engine)


