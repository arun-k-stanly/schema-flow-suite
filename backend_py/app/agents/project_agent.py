from __future__ import annotations

from typing import Any

from .base import BaseAgent
from ..utils.storage import JsonTable


class ProjectAgent(BaseAgent):
    def __init__(self, *args, **kwargs):
        super().__init__(name="project", groq_client=kwargs.get("groq_client"))
        self._table = JsonTable("projects.json", key_field="id")

    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        action = payload.get("action")
        if action == "create":
            data = payload.get("data") or {}
            created = self._table.upsert(data)
            return {"agent": self.name, "project": created}
        if action == "list":
            return {"agent": self.name, "projects": self._table.list_all()}
        if action == "delete":
            pid = payload.get("id")
            self._table.delete(pid)
            return {"agent": self.name, "deleted": pid}

        return {"error": f"unsupported action: {action}"}


