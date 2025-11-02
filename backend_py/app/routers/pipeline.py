from __future__ import annotations

from fastapi import APIRouter

from ..agents.pipeline_agent import PipelineAgent
from ..core.groq_client import GroqClient
from ..models.schemas import PipelineTransformRequest


router = APIRouter(prefix="/pipeline", tags=["pipeline"])
_agent = PipelineAgent(name="pipeline", groq_client=GroqClient())


@router.post("/transform")
def transform(req: PipelineTransformRequest):
    payload = req.model_dump()
    return _agent.handle(payload)


