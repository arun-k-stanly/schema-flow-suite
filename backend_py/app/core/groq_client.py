from __future__ import annotations

from typing import Iterable, Optional

from groq import Groq

from .config import settings


class GroqClient:
    def __init__(self, api_key: Optional[str] = None):
        # Lazy initialization to avoid failing app startup when GROQ_API_KEY is missing
        self._api_key: Optional[str] = api_key or settings.groq_api_key
        self._client: Optional[Groq] = None

    def _ensure_client(self) -> Groq:
        if self._client is None:
            if not self._api_key:
                raise ValueError("GROQ_API_KEY not configured")
            self._client = Groq(api_key=self._api_key)
        return self._client

    def chat(self, messages: Iterable[dict], model: str = "llama-3.1-70b-versatile", temperature: float = 0.2) -> str:
        client = self._ensure_client()
        resp = client.chat.completions.create(
            model=model,
            messages=list(messages),
            temperature=temperature,
        )
        return resp.choices[0].message.content or ""


