from __future__ import annotations

from typing import Any, Dict, List, Optional, Set
import json
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..utils.storage import read_json
from ..core.groq_client import GroqClient


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

    # Helper: collect allowed leaf paths from schema and normalize to flattened column names
    def _collect_leaf_paths(el: Dict[str, Any], prefix: str = "") -> List[str]:
        paths: List[str] = []
        for a in el.get("attributes", []) or []:
            paths.append(f"{prefix}@{a}")
        children = el.get("children", []) or []
        if not children:
            if prefix:
                paths.append(prefix[:-1])
            return paths
        for ch in children:
            name = ch.get("name") or "value"
            child_prefix = f"{prefix}{name}."
            sub = _collect_leaf_paths(ch, child_prefix)
            if not sub:
                paths.append(child_prefix[:-1])
            else:
                paths.extend(sub)
        return paths

    def _flatten_name(path: str) -> str:
        return path.replace("@", "attr_").replace(".", "_")

    allowed_from_schema: Set[str] = set()
    try:
        allowed_from_schema = { _flatten_name(p) for p in _collect_leaf_paths(root) }
    except Exception:
        allowed_from_schema = set()

    # If a prompt is provided and GROQ is configured, attempt AI-designed model using sample rows
    if (req.prompt or "").strip():
        try:
            groq = GroqClient()
            # Try to include recently generated sample rows if available
            sample_rows = read_json("last_rows.json") or []
            sample_excerpt = sample_rows[:20] if isinstance(sample_rows, list) else []
            allowed_from_rows: Set[str] = set()
            if isinstance(sample_excerpt, list) and sample_excerpt:
                for k in sample_excerpt[0].keys():
                    try:
                        allowed_from_rows.add(str(k))
                    except Exception:
                        pass
            allowed_columns = sorted(list(allowed_from_schema.union(allowed_from_rows)))
            messages = [
                {"role": "system", "content": (
                    "You are a data modeling assistant. Given a prompt and sample tabular rows, "
                    "recommend the most appropriate analytical schema type (star, snowflake, galaxy, wide_table, or data_vault). "
                    "Then design the model accordingly. Respond ONLY with JSON in the exact shape: {\n"
                    "  \"schema_type\": \"star|snowflake|galaxy|wide_table|data_vault\",\n"
                    "  \"title\": string,\n"
                    "  \"description\": string,\n"
                    "  \"fact\": { \"name\": string, \"columns\": [ { \"name\": string, \"type\": string, \"key\"?: \"PK\"|\"FK\"|\"\" } ] },\n"
                    "  \"dimensions\": [ { \"name\": string, \"columns\": [ { \"name\": string, \"type\": string, \"key\"?: \"PK\"|\"FK\"|\"\" } ] } ]\n"
                    "}\n"
                    "Types should be SQL-ish (INTEGER, DECIMAL, VARCHAR, DATE, TIMESTAMP, BOOLEAN). "
                    "Prefer surrogate PKs for dimensions and FK references in fact to dimensions when applicable. "
                    "STRICT CONSTRAINTS: Do NOT invent new columns. Columns must come from allowed_columns. "
                    "If you include a derived column, you MUST add a \"derived_from\" field with a concise SQL expression using only allowed_columns."
                )},
                {"role": "user", "content": f"Prompt: {req.prompt}"},
                {"role": "user", "content": f"Sample rows (JSON): {json.dumps(sample_excerpt)}"},
                {"role": "user", "content": f"allowed_columns: {json.dumps(allowed_columns)}"},
            ]
            ai_text = groq.chat(messages)
            # Extract JSON payload if wrapped in code fences
            m = re.search(r"\{[\s\S]*\}", ai_text)
            raw = m.group(0) if m else ai_text
            ai_model = json.loads(raw)
            # Enforce constraint: drop columns not in allowed set unless explicitly derived
            def _filter_table(table: Dict[str, Any]) -> Dict[str, Any]:
                cols = table.get("columns", []) or []
                filtered = []
                # build identifier allowlist (column names + simple SQL function keywords)
                keyword_allow = {"cast", "coalesce", "sum", "avg", "min", "max", "count", "abs", "round", "date", "timestamp", "case", "when", "then", "else", "end", "and", "or", "not"}
                for c in cols:
                    name = str(c.get("name") or "").strip()
                    derived = c.get("derived_from")
                    if name in allowed_columns:
                        filtered.append(c)
                        continue
                    if derived is not None and str(derived).strip() != "":
                        # validate that derived expression only references allowed columns / keywords
                        tokens = set(re.findall(r"[A-Za-z_][A-Za-z0-9_]*", str(derived)))
                        unknown = {t for t in tokens if t.lower() not in keyword_allow and t not in allowed_columns}
                        if not unknown:
                            filtered.append(c)
                table["columns"] = filtered
                return table

            if ai_model and isinstance(ai_model, dict) and "fact" in ai_model:
                try:
                    ai_model["fact"] = _filter_table(ai_model.get("fact", {}))
                    dims = []
                    for d in ai_model.get("dimensions", []) or []:
                        dims.append(_filter_table(d))
                    ai_model["dimensions"] = dims
                except Exception:
                    pass
                return {"model": ai_model}
        except Exception:
            # Fall back silently to heuristic result
            pass

    # Heuristic fallback when AI is not used or fails; avoid prescribing a schema type
    return {"model": {"schema_type": "unknown", "title": "Data Model", "description": "Heuristic model generated from uploaded schema.", "fact": fact, "dimensions": dimensions}}


