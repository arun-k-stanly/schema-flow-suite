from __future__ import annotations

from typing import Iterable, Optional
import os
from pathlib import Path
from dotenv import load_dotenv

from groq import Groq

from .config import settings


class GroqClient:
    def __init__(self, api_key: Optional[str] = None):
        # Lazy initialization to avoid failing app startup when GROQ_API_KEY is missing
        self._api_key: Optional[str] = api_key or settings.groq_api_key
        self._client: Optional[Groq] = None

    def _ensure_client(self) -> Groq:
        if self._client is None:
            # Re-read the key at call time as a safety net in dev when .env changes
            api_key = self._api_key or settings.groq_api_key or os.getenv("GROQ_API_KEY")
            if not api_key:
                # Try to load from common .env locations dynamically (dev convenience)
                for candidate in (Path(".env"), Path("../.env"), Path("../../.env")):
                    try:
                        if candidate.exists():
                            load_dotenv(dotenv_path=candidate, override=False)
                            api_key = os.getenv("GROQ_API_KEY")
                            if api_key:
                                break
                    except Exception:
                        # ignore and continue
                        pass
            if not api_key:
                raise ValueError("GROQ_API_KEY not configured")
            self._api_key = api_key
            self._client = Groq(api_key=api_key)
        return self._client

    def chat(self, messages: Iterable[dict], model: str = "llama-3.1-70b-versatile", temperature: float = 0.2) -> str:
        client = self._ensure_client()
        resp = client.chat.completions.create(
            model=model,
            messages=list(messages),
            temperature=temperature,
        )
        return resp.choices[0].message.content or ""


