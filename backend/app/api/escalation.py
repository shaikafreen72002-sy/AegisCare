"""
Care Team Escalation and Notification Dispatch Endpoints.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.services.notification_service import notification_service

router = APIRouter(prefix="/escalation", tags=["escalation"])

class ManualEscalationRequest(BaseModel):
    patient_name: Optional[str] = "Lakshmi"
    urgency: str = Field(default="HIGH", example="HIGH") # INFO, MEDIUM, HIGH, CRITICAL
    trigger: str = Field(default="MANUAL_CARE_TEAM_REQUEST", example="MANUAL_CARE_TEAM_REQUEST")
    summary: str = Field(..., example="Patient requested immediate assistance via one-tap Care Team button.")
    recipient_type: Optional[str] = "caregiver"
    recipient_contact: Optional[str] = None

@router.post("")
async def trigger_escalation(payload: ManualEscalationRequest):
    """
    Triggers an immediate verified WhatsApp/SMS notification to caregiver or physician.
    Returns explicit notification_status: 'SENT' with delivery receipt.
    """
    dispatch_receipt = notification_service.send_escalation_alert(
        patient_name=payload.patient_name or "Lakshmi",
        urgency=payload.urgency,
        trigger=payload.trigger,
        summary=payload.summary,
        recipient_type=payload.recipient_type or "caregiver",
        recipient_contact=payload.recipient_contact
    )
    return {
        "success": True,
        "escalation": dispatch_receipt
    }

@router.get("/history")
async def get_escalation_history():
    """Returns verified audit log of all caregiver/doctor notifications."""
    return {
        "notifications": notification_service.get_notification_history()
    }
