from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..utils.xml_parse import parse_xsd_structure
from ..utils.storage import write_json


router = APIRouter(prefix="/metadata", tags=["metadata"])


@router.post("/parse")
async def parse_metadata(format: str = Form(...), file: UploadFile = File(...)):
    fmt = (format or "").lower()
    if fmt != "xsd":
        raise HTTPException(status_code=400, detail="Only format 'xsd' is supported currently")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        summary = parse_xsd_structure(content)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse XSD: {exc}")

    # persist last parsed schema for later generation fallback
    write_json("last_schema.json", summary)

    return {"format": fmt, "summary": summary}


