from __future__ import annotations

from typing import Any

from .base import BaseAgent


class ValidationAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        # Stub validation logic; in real implementation, validate XML/XSD or data contracts
        item = payload.get("item")
        is_valid = item is not None
        reasons: list[str] = []
        if item is None:
            reasons.append("item is required")

        return {"agent": self.name, "valid": is_valid, "reasons": reasons}


