"""
Agent Management & Orchestration API Endpoints.
Provides endpoints for executing agentic workflows, inspecting agent pipeline statuses,
and advancing the 1-5 adherence escalation tree.
"""

import sys
import os
from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from ai.orchestrator import AIOrchestrator

router = APIRouter(prefix="/agent", tags=["agent"])
orchestrator = AIOrchestrator()

class AgentRunRequest(BaseModel):
    message: str = Field(..., example="I took my evening medicine.")
    patient_name: Optional[str] = "Lakshmi"
    medication_name: Optional[str] = "donepezil"
    scenario_id: Optional[str] = None

@router.post("/run")
async def run_agent_pipeline(payload: AgentRunRequest):
    """Executes the full 4-Agent pipeline and returns decisions, citations, and execution trace."""
    res = orchestrator.process_message(
        message=payload.message,
        patient_name=payload.patient_name or "Lakshmi",
        medication_name=payload.medication_name or "donepezil"
    )
    return res

@router.post("/missed-dose-step")
async def simulate_missed_step(patient_name: Optional[str] = "Lakshmi"):
    """Advances the 1-5 escalation counter by 1 step (Scenario 2)."""
    res = orchestrator.simulate_missed_dose_escalation(patient_name=patient_name or "Lakshmi")
    return res

@router.get("/status")
async def get_agent_status():
    """Returns real-time status of all 4 agents in the system."""
    adherence_status = orchestrator.adherence_agent.get_current_status()
    doc_count = len(orchestrator.knowledge_agent.get_inventory())
    
    return {
        "agents": [
            {
                "id": "agent_1_guardrail",
                "name": "Clinical Guardrail Agent",
                "role": "Medical Information Specialist",
                "status": "ONLINE",
                "active_policy": "Zero Hallucination / No Prescribing / No Double-Dose"
            },
            {
                "id": "agent_2_adherence",
                "name": "Adherence Escalation Agent",
                "role": "Patient Monitoring Manager",
                "status": "ONLINE",
                "current_counter": f"{adherence_status['acknowledgement_count']}/5",
                "adherence_status": adherence_status["adherence_status"]
            },
            {
                "id": "agent_3_empathy",
                "name": "Empathetic Communicator Agent",
                "role": "Patient Empathy Coach",
                "status": "ONLINE",
                "model": orchestrator.empathy_agent.mistral_model,
                "whatsapp_tool": "ACTIVE"
            },
            {
                "id": "agent_4_knowledge",
                "name": "Document Knowledge Agent",
                "role": "Clinical Knowledge Librarian",
                "status": "ONLINE",
                "indexed_documents": doc_count
            }
        ],
        "adherence_escalation_state": adherence_status
    }
