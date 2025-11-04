from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(1000), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


