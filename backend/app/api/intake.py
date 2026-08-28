"""
Clinical Intake & Agentic AI Calibration Endpoints.
Connects patient intake parameters (Name, Age, Height, Weight, Severity, Daily Meds, Diagnosis Date)
to the Mistral-powered Intake Calibration Agent.
"""

import sys
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Ensure root directory is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from ai.intake_agent import IntakeCalibrationAgent
from backend.app.api.adherence import ADHERENCE_STATE
from backend.app.api.profile import PATIENT_PROFILE

router = APIRouter(prefix="/intake", tags=["intake"])
intake_agent = IntakeCalibrationAgent()

class PatientIntakeRequest(BaseModel):
    name: str = Field(..., example="Lakshmi Devi")
    preferred_name: Optional[str] = Field(default="Lakshmi Amma")
    age: int = Field(..., example=74)
    gender: Optional[str] = Field(default="Female")
    height_cm: float = Field(..., example=158.0)
    weight_kg: float = Field(..., example=56.0)
    condition_severity: str = Field(..., example="Mild Cognitive Impairment / Early Alzheimer's")
    diagnosis_date: str = Field(..., example="2024-03")
    medications: List[str] = Field(default_factory=lambda: ["Donepezil Hydrochloride"])
    primary_medication: Optional[str] = Field(default="Donepezil Hydrochloride")
    primary_dosage: Optional[str] = Field(default="5 mg")
    evening_time: Optional[str] = Field(default="20:00")
    caregiver_name: Optional[str] = Field(default="Priya")
    caregiver_phone: Optional[str] = Field(default="+1 (555) 234-5678")
    caregiver_relation: Optional[str] = Field(default="Daughter & Primary Caregiver")
    physician_name: Optional[str] = Field(default="Dr. Aarav Mehta, MD")
    physician_phone: Optional[str] = Field(default="+1 (555) 987-6543")

@router.post("/calibrate")
async def calibrate_intake_endpoint(payload: PatientIntakeRequest):
    """
    Executes Mistral Agentic AI reasoning over patient intake data
    and calibrates the adherence database and schedule.
    """
    try:
        intake_dict = payload.model_dump()
        calibration_result = intake_agent.calibrate_patient_routine(intake_dict)

        # Update in-memory profile store
        PATIENT_PROFILE["name"] = payload.name
        PATIENT_PROFILE["preferred_name"] = payload.preferred_name or payload.name
        PATIENT_PROFILE["age"] = payload.age
        PATIENT_PROFILE["gender"] = payload.gender or "Female"
        PATIENT_PROFILE["height_cm"] = payload.height_cm
        PATIENT_PROFILE["weight_kg"] = payload.weight_kg
        PATIENT_PROFILE["condition"] = payload.condition_severity
        PATIENT_PROFILE["diagnosis_date"] = payload.diagnosis_date
        PATIENT_PROFILE["primary_medication"] = {
            "name": payload.primary_medication or "Donepezil Hydrochloride",
            "brand": "Aricept" if "donepezil" in (payload.primary_medication or "").lower() else "Prescription",
            "dosage": payload.primary_dosage or "5 mg",
            "frequency": "Once daily in the evening",
            "instructions": f"Take at {payload.evening_time or '20:00'} with water. {calibration_result.get('food_hydration_instructions', '')}"
        }
        if payload.caregiver_name:
            PATIENT_PROFILE["caregiver"]["name"] = payload.caregiver_name
            PATIENT_PROFILE["caregiver"]["phone"] = payload.caregiver_phone or PATIENT_PROFILE["caregiver"]["phone"]
            PATIENT_PROFILE["caregiver"]["relation"] = payload.caregiver_relation or PATIENT_PROFILE["caregiver"]["relation"]

        # Update adherence store schedule & routine garden
        calibrated_schedule = calibration_result.get("calibrated_schedule", [])
        if calibrated_schedule:
            ADHERENCE_STATE["schedule"] = calibrated_schedule
        ADHERENCE_STATE["garden_name"] = calibration_result["routine_garden_setup"]["garden_name"]
        ADHERENCE_STATE["routine_message"] = calibration_result["routine_garden_setup"]["welcome_message"]
        ADHERENCE_STATE["growth_stage"] = 1

        return {
            "success": True,
            "calibration": calibration_result,
            "updated_profile": PATIENT_PROFILE,
            "updated_adherence": ADHERENCE_STATE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intake calibration error: {str(e)}")
