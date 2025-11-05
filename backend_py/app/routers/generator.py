from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter
from pydantic import BaseModel, Field
from ..utils.storage import read_json, write_json
from ..agents.sample_data_agent import SampleDataAgent
from ..core.groq_client import GroqClient


router = APIRouter(prefix="/generate", tags=["generate"]) 


class GenerateRequest(BaseModel):
    format: str = Field(description="xml|json|csv|table")
    count: int = 1
    variation: str | None = None
    schema: Optional[Dict[str, Any]] = None
    context: Optional[str] = None  # User-provided business context


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
    count = max(1, min(100, req.count))  # Limit to 100 for AI generation
    schema = req.schema or (read_json("last_schema.json") or {})
    
    # Use AI-powered sample data generation
    groq_client = GroqClient()
    sample_agent = SampleDataAgent(name="sample_data", groq_client=groq_client)
    
    # Generate intelligent sample data
    ai_result = sample_agent.handle({
        "schema": schema,
        "count": count,
        "format": fmt,
        "context": req.context  # Pass user context to the agent
    })
    
    sample_data = ai_result.get("output", [])
    
    if not sample_data:
        # Fallback to legacy generation if AI fails
        return _generate_legacy_sample(req, schema)
    
    # Convert AI-generated data to requested format
    if fmt == "table":
        try:
            write_json("last_rows.json", sample_data)
        except Exception:
            pass
        return {"format": fmt, "rows": sample_data}
    
    elif fmt == "json":
        try:
            write_json("last_rows.json", sample_data)
        except Exception:
            pass
        return {"format": fmt, "content": sample_data}
    
    elif fmt == "csv":
        if not sample_data:
            return {"format": fmt, "content": ""}
        
        # Get all unique keys from all records
        all_keys = set()
        for record in sample_data:
            all_keys.update(record.keys())
        headers = sorted(list(all_keys))
        
        lines = [",".join(headers)]
        for record in sample_data:
            row = []
            for header in headers:
                value = record.get(header, "")
                # Escape commas and quotes in CSV
                if isinstance(value, str) and ("," in value or '"' in value):
                    value = f'"{value.replace('"', '""')}"'
                row.append(str(value))
            lines.append(",".join(row))
        
        return {"format": fmt, "content": "\n".join(lines)}
    
    elif fmt == "xml":
        return _convert_to_xml(sample_data, schema)
    
    else:
        return {"format": fmt, "content": sample_data}


def _convert_to_xml(sample_data: List[Dict[str, Any]], schema: Dict[str, Any]) -> Dict[str, str]:
    """Convert AI-generated sample data to XML format based on schema structure"""
    
    if not sample_data:
        return {"format": "xml", "content": "<root></root>"}
    
    elements = schema.get("elements", [])
    if not elements:
        return {"format": "xml", "content": "<root></root>"}
    
    root_element = elements[0]
    root_name = root_element.get("name", "record")
    
    xml_lines = []
    
    # Check if we need a wrapper element
    if len(sample_data) > 1:
        xml_lines.append(f"<{root_name}s>")
        indent = "  "
    else:
        indent = ""
    
    for record in sample_data:
        xml_lines.extend(_record_to_xml(record, root_name, root_element, indent))
    
    if len(sample_data) > 1:
        xml_lines.append(f"</{root_name}s>")
    
    return {"format": "xml", "content": "\n".join(xml_lines)}


def _record_to_xml(record: Dict[str, Any], element_name: str, element_def: Dict[str, Any], indent: str = "") -> List[str]:
    """Convert a single record to XML based on element definition"""
    
    lines = []
    
    # Extract attributes (keys starting with @)
    attributes = {}
    content = {}
    
    for key, value in record.items():
        if key.startswith("@"):
            attributes[key[1:]] = value
        else:
            content[key] = value
    
    # Build opening tag with attributes
    attr_str = ""
    if attributes:
        attr_parts = [f'{k}="{v}"' for k, v in attributes.items()]
        attr_str = " " + " ".join(attr_parts)
    
    if not content:
        # Self-closing tag if no content
        lines.append(f"{indent}<{element_name}{attr_str}/>")
    else:
        lines.append(f"{indent}<{element_name}{attr_str}>")
        
        # Add content elements
        for key, value in content.items():
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        lines.extend(_record_to_xml(item, key, {}, indent + "  "))
                    else:
                        lines.append(f"{indent}  <{key}>{item}</{key}>")
            elif isinstance(value, dict):
                lines.extend(_record_to_xml(value, key, {}, indent + "  "))
            else:
                lines.append(f"{indent}  <{key}>{value}</{key}>")
        
        lines.append(f"{indent}</{element_name}>")
    
    return lines


def _generate_legacy_sample(req: GenerateRequest, schema: Dict[str, Any]) -> Dict[str, Any]:
    """Legacy sample generation as fallback"""
    fmt = req.format.lower()
    count = req.count
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
            try:
                write_json("last_rows.json", rows)
            except Exception:
                pass
            return {"format": fmt, "rows": rows}
        if fmt == "json":
            try:
                write_json("last_rows.json", rows)
            except Exception:
                pass
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
        try:
            write_json("last_rows.json", rows)
        except Exception:
            pass
        return {"format": fmt, "rows": rows}
    if fmt == "json":
        try:
            write_json("last_rows.json", rows)
        except Exception:
            pass
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


