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

    def map_xsd_to_sql(xsd_type: Optional[str]) -> str:
        if not xsd_type:
            return "VARCHAR"
        t = xsd_type.lower()
        mapping = {
            "string": "VARCHAR",
            "normalizedstring": "VARCHAR",
            "token": "VARCHAR",
            "language": "VARCHAR",
            "boolean": "BOOLEAN",
            "decimal": "DECIMAL",
            "integer": "INTEGER",
            "nonnegativeinteger": "INTEGER",
            "positiveinteger": "INTEGER",
            "long": "BIGINT",
            "int": "INTEGER",
            "short": "SMALLINT",
            "byte": "SMALLINT",
            "float": "FLOAT",
            "double": "DOUBLE",
            "date": "DATE",
            "datetime": "TIMESTAMP",
            "time": "TIME",
            "gyear": "INTEGER",
            "gyearmonth": "VARCHAR",
            "gmonthday": "VARCHAR",
            "duration": "VARCHAR",
            "anyuri": "VARCHAR",
            "base64binary": "BINARY",
            "hexbinary": "BINARY",
        }
        return mapping.get(t, "VARCHAR")

    def to_columns(el: Dict[str, Any]) -> List[Dict[str, str]]:
        cols = []
        # Attributes with optional type details
        attr_details = { (ad.get("name") or ""): ad.get("xsdType") for ad in (el.get("attributeDetails") or []) }
        for a in el.get("attributes", []) or []:
            sql_type = map_xsd_to_sql(attr_details.get(a))
            cols.append({"name": a, "type": sql_type, "key": ""})
        if not el.get("children"):
            sql_type = map_xsd_to_sql(el.get("xsdType"))
            cols.append({"name": el.get("name") or "value", "type": sql_type, "key": ""})
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


