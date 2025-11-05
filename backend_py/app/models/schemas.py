from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class AgentAskRequest(BaseModel):
    agent: str = Field(description="Which agent to use: groq|data_model|pipeline|validation|project")
    payload: dict[str, Any] = Field(default_factory=dict)


class AgentAskResponse(BaseModel):
    agent: str | None = None
    output: Any | None = None
    error: str | None = None


class ProjectItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


class ProjectCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None


class PipelineOperation(BaseModel):
    action: str
    columns: Optional[List[str]] = None
    column: Optional[str] = None
    value: Optional[Any] = None


class PipelineTransformRequest(BaseModel):
    rows: List[dict]
    ops: Optional[List[PipelineOperation]] = None
    output_path: Optional[str] = None


class ValidationRequest(BaseModel):
    item: Any


class DataModelRequest(BaseModel):
    # use alias to accept {"schema": ...} from clients while avoiding BaseModel.schema name clash
    schema_def: dict = Field(alias="schema")


