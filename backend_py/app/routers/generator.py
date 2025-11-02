from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter
from pydantic import BaseModel, Field
from ..utils.storage import read_json


router = APIRouter(prefix="/generate", tags=["generate"]) 


class GenerateRequest(BaseModel):
    format: str = Field(description="xml|json|csv|table")
    count: int = 1
    variation: str | None = None
    schema: Optional[Dict[str, Any]] = None


def _fields_from_schema(schema: Optional[Dict[str, Any]]) -> tuple[str, List[str]]:
    if not schema:
        return "record", ["field1", "field2", "field3"]
    elements = schema.get("elements") or []
    if not elements:
        return "record", ["field1", "field2", "field3"]
    first = elements[0]
    name = first.get("name") or "record"
    # children may be nested structures; pick first-level child names for default
    child_defs = first.get("children") or []
    children = [ch.get("name") for ch in child_defs if isinstance(ch, dict) and ch.get("name")]
    if not children:
        children = ["value"]
    return name, list(children)


def _gen_value(field_name: str, idx: int) -> str:
    # simple deterministic values
    if any(k in field_name.lower() for k in ["id", "quantity", "count", "number"]):
        return str(idx + 1)
    if any(k in field_name.lower() for k in ["price", "amount", "total", "revenue"]):
        return f"{(idx + 1) * 10}.00"
    return f"{field_name}-{idx + 1}"


def _find_repeated_child(el: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for ch in el.get("children", []) or []:
        max_occurs = (ch.get("maxOccurs") or "1").lower()
        if max_occurs == "unbounded" or max_occurs not in ("1", None):
            return ch
    return None


def _collect_leaf_paths(el: Dict[str, Any], prefix: str = "") -> List[str]:
    paths: List[str] = []
    # attributes
    for a in el.get("attributes", []) or []:
        paths.append(f"{prefix}@{a}")
    children = el.get("children", []) or []
    if not children:
        if prefix:
            # prefix includes current name already
            paths.append(prefix[:-1])  # drop trailing dot
        return paths
    for ch in children:
        name = ch.get("name") or "value"
        child_prefix = f"{prefix}{name}."
        sub = _collect_leaf_paths(ch, child_prefix)
        # if child itself has no further children, collect itself as leaf
        if not sub:
            paths.append(child_prefix[:-1])
        else:
            paths.extend(sub)
    return paths


def _xml_from_structure(el: Dict[str, Any], idx: int, repeat_count: int) -> List[str]:
    name = el.get("name") or "record"
    lines: List[str] = []
    # attributes
    attrs = ""
    if el.get("attributes"):
        pairs = [f'{a}="{_gen_value(a, idx)}"' for a in el["attributes"]]
        attrs = " " + " ".join(pairs)

    children = el.get("children") or []
    if not children:
        lines.append(f"<{name}{attrs}>{_gen_value(name, idx)}</{name}>")
        return lines

    lines.append(f"<{name}{attrs}>")
    for ch in children:
        max_occurs = (ch.get("maxOccurs") or "1").lower()
        times = repeat_count if (max_occurs == "unbounded" or max_occurs not in ("1", None)) else 1
        for i in range(times):
            lines.extend(["  " + l for l in _xml_from_structure(ch, i, repeat_count)])
    lines.append(f"</{name}>")
    return lines


@router.post("/sample")
def generate_sample(req: GenerateRequest):
    fmt = req.format.lower()
    count = max(1, min(1000, req.count))
    schema = req.schema or (read_json("last_schema.json") or {})
    elements = (schema.get("elements") or []) if isinstance(schema, dict) else []

    if fmt in ("xml", "json", "csv", "table") and elements:
        root = elements[0]
        # pick repeated child (e.g., item) for row-level generation
        repeated = _find_repeated_child(root)
        # compute column paths for table/json/csv
        if repeated is not None:
            fixed_paths = [p for p in _collect_leaf_paths(root) if not p.startswith(f"{repeated.get('name')}.")]
            item_paths = [p[len(repeated.get('name') + '.'):] for p in _collect_leaf_paths(repeated)]
            # remove duplicates and attribute markers in headers for table
            fixed_headers = [p for p in fixed_paths]
            item_headers = [p for p in item_paths]
        else:
            fixed_headers = []
            item_headers = [p for p in _collect_leaf_paths(root)]

        # Build rows
        rows: List[Dict[str, str]] = []
        for i in range(count):
            row: Dict[str, str] = {}
            for h in fixed_headers:
                field = h.replace("@", "attr_").replace(".", "_")
                row[field] = _gen_value(field, 0)
            for h in item_headers:
                field = h.replace("@", "attr_").replace(".", "_")
                row[field] = _gen_value(field, i)
            rows.append(row)

        if fmt == "table":
            return {"format": fmt, "rows": rows}
        if fmt == "json":
            return {"format": fmt, "content": rows}
        if fmt == "csv":
            headers = list(rows[0].keys()) if rows else []
            lines = [",".join(headers)]
            for r in rows:
                lines.append(",".join(str(r[h]) for h in headers))
            return {"format": fmt, "content": "\n".join(lines)}
        # xml with nested structure respecting maxOccurs
        xml_lines: List[str] = []
        for i in range(1):
            xml_lines.extend(_xml_from_structure(root, 0, count))
        return {"format": "xml", "content": "\n".join(xml_lines)}

    # fallback if no schema provided
    item_name, fields = _fields_from_schema(schema)
    rows = [{f: _gen_value(f, i) for f in fields} for i in range(count)]
    if fmt == "table":
        return {"format": fmt, "rows": rows}
    if fmt == "json":
        return {"format": fmt, "content": rows}
    if fmt == "csv":
        header = ",".join(fields)
        lines = [header] + [",".join(str(r[f]) for f in fields) for r in rows]
        return {"format": fmt, "content": "\n".join(lines)}
    parts: List[str] = ["<records>"]
    for r in rows:
        parts.append(f"  <{item_name}>")
        for f in fields:
            parts.append(f"    <{f}>{r[f]}</{f}>")
        parts.append(f"  </{item_name}>")
    parts.append("</records>")
    return {"format": "xml", "content": "\n".join(parts)}


