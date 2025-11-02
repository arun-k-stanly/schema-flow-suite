from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..agents.groq_agent import GroqAgent
from ..agents.data_model_agent import DataModelAgent
from ..agents.pipeline_agent import PipelineAgent
from ..agents.validation_agent import ValidationAgent
from ..agents.project_agent import ProjectAgent
from ..core.groq_client import GroqClient
from ..models.schemas import AgentAskRequest


router = APIRouter(prefix="/agents", tags=["agents"])


_groq_client = GroqClient()


@router.post("/ask")
def ask(req: AgentAskRequest):
    agent_name = req.agent.lower()
    if agent_name == "groq":
        agent = GroqAgent(name="groq", groq_client=_groq_client)
    elif agent_name == "data_model":
        agent = DataModelAgent(name="data_model", groq_client=_groq_client)
    elif agent_name == "pipeline":
        agent = PipelineAgent(name="pipeline", groq_client=_groq_client)
    elif agent_name == "validation":
        agent = ValidationAgent(name="validation", groq_client=_groq_client)
    elif agent_name == "project":
        agent = ProjectAgent(groq_client=_groq_client)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown agent: {req.agent}")

    return agent.handle(req.payload)


