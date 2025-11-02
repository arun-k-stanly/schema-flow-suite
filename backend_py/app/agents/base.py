from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional

from ..core.groq_client import GroqClient


class BaseAgent(ABC):
    def __init__(self, name: str, groq_client: Optional[GroqClient] = None):
        self.name = name
        self.groq = groq_client

    @abstractmethod
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


