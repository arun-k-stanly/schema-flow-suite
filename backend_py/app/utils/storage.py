from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..core.config import settings


def ensure_storage_dir() -> Path:
    p = Path(settings.storage_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


class JsonTable:
    def __init__(self, filename: str, key_field: str = "id"):
        self.root = ensure_storage_dir()
        self.path = self.root / filename
        self.key_field = key_field
        if not self.path.exists():
            self._write([])

    def _read(self) -> List[Dict[str, Any]]:
        with self.path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, data: List[Dict[str, Any]]):
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def list_all(self) -> List[Dict[str, Any]]:
        return self._read()

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        for item in self._read():
            if item.get(self.key_field) == key:
                return item
        return None

    def upsert(self, item: Dict[str, Any]) -> Dict[str, Any]:
        data = self._read()
        key = item.get(self.key_field)
        if not key:
            raise ValueError(f"item missing key field '{self.key_field}'")
        updated = False
        for idx, existing in enumerate(data):
            if existing.get(self.key_field) == key:
                data[idx] = item
                updated = True
                break
        if not updated:
            data.append(item)
        self._write(data)
        return item

    def delete(self, key: str | None):
        if key is None:
            return
        data = [d for d in self._read() if d.get(self.key_field) != key]
        self._write(data)


def write_json(filename: str, data: Any) -> Path:
    root = ensure_storage_dir()
    path = root / filename
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return path


def read_json(filename: str) -> Optional[Any]:
    root = ensure_storage_dir()
    path = root / filename
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


