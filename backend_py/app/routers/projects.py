from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..models.schemas import ProjectCreate, ProjectItem
from ..models.db_models import Project
from ..core.db import get_db


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def list_projects(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(Project).order_by(Project.created_at.desc()).all()
    return [
        {"id": r.id, "name": r.name, "description": r.description, "created_at": r.created_at.isoformat()} for r in rows
    ]


@router.post("")
def create_project(req: ProjectCreate, db: Session = Depends(get_db)) -> dict:
    if not req.id:
        raise HTTPException(status_code=400, detail="id is required")
    existing = db.get(Project, req.id)
    if existing:
        # upsert behavior
        existing.name = req.name
        existing.description = req.description or ""
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "name": existing.name, "description": existing.description}
    item = Project(id=req.id, name=req.name, description=req.description or "")
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "description": item.description}


@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)) -> dict:
    existing = db.get(Project, project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="project not found")
    db.delete(existing)
    db.commit()
    return {"deleted": project_id}


