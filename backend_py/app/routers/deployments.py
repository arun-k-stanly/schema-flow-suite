from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel

from ..utils.storage import read_json, write_json
from ..utils.prefect_helper import is_prefect_available, write_pipeline_code, register_prefect_deployment


router = APIRouter(prefix="/deployments", tags=["deployments"])


class DeploymentCreate(BaseModel):
    project_id: str
    name: str
    code: str


@router.get("")
def list_deployments(project_id: str | None = None):
    data = read_json("deployments.json") or []
    if project_id:
        return [d for d in data if d.get("project_id") == project_id]
    return data


@router.post("")
def create_deployment(req: DeploymentCreate):
    data = read_json("deployments.json") or []
    new_id = f"dep-{len(data)+1}"
    record = {"id": new_id, "project_id": req.project_id, "name": req.name, "status": "deployed"}
    data.append(record)
    write_json("deployments.json", data)
    # Attempt Prefect registration (best-effort)
    try:
        code_path = write_pipeline_code(req.project_id, new_id, req.code)
        if is_prefect_available():
            result = register_prefect_deployment(req.name, req.project_id, new_id, code_path)
            record["prefect"] = result
            write_json("deployments.json", data)
        else:
            record["prefect"] = {"registered": False, "reason": "prefect not installed"}
            write_json("deployments.json", data)
    except Exception as exc:
        record["prefect"] = {"registered": False, "error": str(exc)}
        write_json("deployments.json", data)
    return record


