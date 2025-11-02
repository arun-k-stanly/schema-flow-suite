from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..utils.storage import read_json


router = APIRouter(prefix="/model", tags=["model"])


class ModelGenerateRequest(BaseModel):
    schema: Optional[Dict[str, Any]] = None
    prompt: Optional[str] = None


@router.post("/generate")
def generate_model(req: ModelGenerateRequest):
    schema = req.schema or (read_json("last_schema.json") or {})
    elements: List[Dict[str, Any]] = schema.get("elements") or []
    if not elements:
        return {"model": {"fact": {"name": "fact", "columns": []}, "dimensions": []}}

    root = elements[0]
    # Heuristic: repeated child becomes a fact; others become dimensions
    repeated = None
    others: List[Dict[str, Any]] = []
    for ch in root.get("children", []) or []:
        max_occurs = (ch.get("maxOccurs") or "1").lower()
        if repeated is None and (max_occurs == "unbounded" or max_occurs not in ("1", None)):
            repeated = ch
        else:
            others.append(ch)

    def to_columns(el: Dict[str, Any]) -> List[Dict[str, str]]:
        cols = []
        for a in el.get("attributes", []) or []:
            cols.append({"name": a, "type": "STRING", "key": ""})
        if not el.get("children"):
            cols.append({"name": el.get("name") or "value", "type": "STRING", "key": ""})
        else:
            for ch in el.get("children") or []:
                cols.extend(to_columns(ch))
        return cols

    fact = {
        "name": (repeated or root).get("name") or "fact",
        "columns": to_columns(repeated or root),
    }

    dimensions = [
        {"name": d.get("name") or "dim", "columns": to_columns(d)} for d in others
    ]

    return {"model": {"fact": fact, "dimensions": dimensions}}


