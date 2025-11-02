from __future__ import annotations

from fastapi import APIRouter

from ..agents.validation_agent import ValidationAgent
from ..core.groq_client import GroqClient
from ..models.schemas import ValidationRequest


router = APIRouter(prefix="/validation", tags=["validation"])
_agent = ValidationAgent(name="validation", groq_client=GroqClient())


@router.post("/check")
def check(req: ValidationRequest):
    return _agent.handle(req.model_dump())


