"""
Patient Profile and Caregiver Settings Endpoints.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

PATIENT_PROFILE = {
    "patient_id": "pt_lakshmi_102",
    "name": "Lakshmi",
    "preferred_name": "Lakshmi Amma",
    "age": 74,
    "gender": "Female",
    "height_cm": 158,
    "weight_kg": 56,
    "condition": "Mild Cognitive Impairment / Early Alzheimer's Type",
    "diagnosis_date": "2024-03-15",
    "primary_medication": {
        "name": "Donepezil Hydrochloride",
        "brand": "Aricept",
        "dosage": "5 mg",
        "frequency": "Once daily in the evening",
        "instructions": "Take with water at 8:00 PM before retiring."
    },
    "caregiver": {
        "name": "Priya",
        "relation": "Daughter & Primary Caregiver",
        "phone": "+1 (555) 234-5678",
        "email": "priya.care@example.com",
        "preferred_channel": "WHATSAPP",
        "alert_on_missed_dose": True,
        "alert_on_symptoms": True
    },
    "physician": {
        "name": "Dr. Aarav Mehta, MD",
        "specialty": "Geriatric Neurologist",
        "clinic": "Metro Memory & Cognitive Health Center",
        "phone": "+1 (555) 987-6543"
    },
    "accessibility_settings": {
        "high_contrast": False,
        "large_text": True,
        "voice_auto_speak": False,
        "reduced_motion": False
    }
}

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    preferred_name: Optional[str] = None
    age: Optional[int] = None
    condition: Optional[str] = None
    primary_medication: Optional[Dict[str, Any]] = None
    caregiver: Optional[Dict[str, Any]] = None
    accessibility_settings: Optional[Dict[str, Any]] = None

@router.get("")
async def get_profile():
    return PATIENT_PROFILE

@router.post("")
async def update_profile(payload: ProfileUpdateRequest):
    if payload.name:
        PATIENT_PROFILE["name"] = payload.name
    if payload.preferred_name:
        PATIENT_PROFILE["preferred_name"] = payload.preferred_name
    if payload.age:
        PATIENT_PROFILE["age"] = payload.age
    if payload.condition:
        PATIENT_PROFILE["condition"] = payload.condition
    if payload.primary_medication:
        PATIENT_PROFILE["primary_medication"].update(payload.primary_medication)
    if payload.caregiver:
        PATIENT_PROFILE["caregiver"].update(payload.caregiver)
    if payload.accessibility_settings:
        PATIENT_PROFILE["accessibility_settings"].update(payload.accessibility_settings)
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": PATIENT_PROFILE
    }
