from __future__ import annotations

from fastapi import APIRouter

from ..agents.data_model_agent import DataModelAgent
from ..core.groq_client import GroqClient
from ..models.schemas import DataModelRequest


router = APIRouter(prefix="/data-model", tags=["data_model"])
_agent = DataModelAgent(name="data_model", groq_client=GroqClient())


@router.post("/summarize")
def summarize(req: DataModelRequest):
    # dump with alias so downstream sees key "schema"
    return _agent.handle(req.model_dump(by_alias=True))


