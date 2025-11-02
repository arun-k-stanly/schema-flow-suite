from __future__ import annotations

from typing import Any

from .base import BaseAgent


SYSTEM_PROMPT = (
    "You are the AI core for Schema Flow Suite. Be concise and provide actionable steps."
)


class GroqAgent(BaseAgent):
    def handle(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.groq:
            return {"error": "Groq client not configured"}

        user_message = payload.get("message") or "Hello"
        context = payload.get("context") or {}
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {user_message}"},
        ]
        try:
            output = self.groq.chat(messages)
            return {"agent": self.name, "output": output}
        except Exception as exc:  # surface configuration or API errors cleanly
            return {"agent": self.name, "error": str(exc)}


