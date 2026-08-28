"""
Chat API Endpoints.
Connects directly to the Multi-Agent Clinical AI Orchestrator with grounded citations,
safety guardrails, adherence monitoring, and live AI pipeline execution traces.
"""

import sys
import os
import traceback
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict

logger = logging.getLogger(__name__)

# Ensure root directory is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from ai.orchestrator import AIOrchestrator

router = APIRouter(prefix="/chat", tags=["chat"])
orchestrator = AIOrchestrator()

class ChatSource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    document: str = ""
    medication: str = ""
    page: int = 1
    section: str = ""
    content: Optional[str] = None

class EscalationPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    recipient: str = ""
    urgency: str = "HIGH"
    trigger: str = ""
    summary: str = ""
    recommended_action: Optional[str] = None
    notification_status: Optional[str] = None
    receipt_id: Optional[str] = None

class PipelineEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    agent: str = ""
    role: str = ""
    status: str = ""
    action: str = ""
    detail: str = ""

class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message: str = Field(..., example="I forgot my morning pill, what should I do?")
    patient_name: Optional[str] = Field(default="Lakshmi")
    medication: Optional[str] = Field(default="donepezil")
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    adherence_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    response: str
    intent: str
    risk_level: str
    safety_status: str
    escalation_required: bool
    escalation: Optional[EscalationPayload] = None
    sources: List[ChatSource] = Field(default_factory=list)
    ai_pipeline_events: List[PipelineEvent] = Field(default_factory=list)

@router.post("", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """
    Processes dialogue through the 4-Agent clinical safety & adherence pipeline.
    """
    try:
        result = orchestrator.process_message(
            message=payload.message,
            patient_name=payload.patient_name or "Lakshmi",
            medication_name=payload.medication or "donepezil"
        )

        escalation_data = result.get("escalation")

        return ChatResponse(
            response=result.get("response", ""),
            intent=result.get("intent", "GENERAL_QUERY"),
            risk_level=result.get("risk_level", "LOW"),
            safety_status=result.get("safety_status", "SAFE"),
            escalation_required=bool(result.get("escalation_required", False)),
            escalation=EscalationPayload(**escalation_data) if escalation_data else None,
            sources=[ChatSource(**s) for s in result.get("sources", []) if isinstance(s, dict)],
            ai_pipeline_events=[PipelineEvent(**e) for e in result.get("ai_pipeline_events", []) if isinstance(e, dict)]
        )
    except Exception as e:
        err_trace = traceback.format_exc()
        logger.error(f"Chat API Error: {err_trace}")
        raise HTTPException(status_code=500, detail=f"AI Orchestration error: {str(e)}")
