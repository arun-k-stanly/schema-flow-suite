from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..models.schemas import ProjectCreate, ProjectItem
from ..utils.storage import JsonTable


router = APIRouter(prefix="/projects", tags=["projects"])
_table = JsonTable("projects.json", key_field="id")


@router.get("")
def list_projects() -> list[dict]:
    return _table.list_all()


@router.post("")
def create_project(req: ProjectCreate) -> dict:
    if not req.id:
        raise HTTPException(status_code=400, detail="id is required")
    item: dict = {"id": req.id, "name": req.name, "description": req.description}
    return _table.upsert(item)


@router.delete("/{project_id}")
def delete_project(project_id: str) -> dict:
    existing = _table.get(project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="project not found")
    _table.delete(project_id)
    return {"deleted": project_id}


