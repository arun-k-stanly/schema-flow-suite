from __future__ import annotations

from typing import Any

from .base import BaseAgent


class DataModelAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        # Stub implementation: echoes schema fields and optionally consults LLM
        schema = payload.get("schema") or payload.get("schema_def") or {}
        summary = {
            "numEntities": len(schema.get("entities", [])),
            "entities": [e.get("name") for e in schema.get("entities", [])],
        }

        suggestion: str | None = None
        if self.groq:
            try:
                suggestion = self.groq.chat(
                    [
                        {"role": "system", "content": "Suggest one improvement to a data model."},
                        {"role": "user", "content": f"Schema: {schema}"},
                    ]
                )
            except Exception:
                # If GROQ_API_KEY not configured or API error, skip suggestion gracefully
                suggestion = None

        return {"agent": self.name, "summary": summary, "suggestion": suggestion}


