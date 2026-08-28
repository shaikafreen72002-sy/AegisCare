"""
Adherence Tracking and Schedule Management Endpoints.
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/adherence", tags=["adherence"])

# In-memory adherence store initialized with realistic patient state
ADHERENCE_STATE = {
    "today": date.today().isoformat(),
    "growth_stage": 4, # 1: Seed, 2: Sprout, 3: Budding, 4: Blooming Jasmine, 5: Flourishing Garden
    "garden_name": "Lakshmi's Jasmine Garden",
    "routine_message": "🌱 Your medication routine is growing beautifully. 4 doses completed comfortably this week.",
    "schedule": [
        {
            "id": "dose_morning_01",
            "time_slot": "Morning (8:00 AM)",
            "scheduled_time": "08:00",
            "medication_name": "Donepezil",
            "dosage": "5 mg",
            "status": "TAKEN", # TAKEN, DUE, UPCOMING, MISSED
            "taken_at": "08:15 AM",
            "instructions": "Take with a glass of water. Can be taken with breakfast or tea.",
            "color": "emerald"
        },
        {
            "id": "dose_afternoon_02",
            "time_slot": "Afternoon (1:00 PM)",
            "scheduled_time": "13:00",
            "medication_name": "Vitamin D & Hydration",
            "dosage": "1000 IU",
            "status": "TAKEN",
            "taken_at": "01:10 PM",
            "instructions": "Gentle midday routine with lunch.",
            "color": "sky"
        },
        {
            "id": "dose_evening_03",
            "time_slot": "Evening (8:00 PM)",
            "scheduled_time": "20:00",
            "medication_name": "Donepezil (Evening Maintenance)",
            "dosage": "5 mg",
            "status": "DUE",
            "taken_at": None,
            "instructions": "Take just prior to retiring with water or an evening snack.",
            "color": "indigo"
        }
    ],
    "history": [
        {"date": "2026-08-27", "status": "COMPLETED", "doses_taken": 3, "total_doses": 3},
        {"date": "2026-08-26", "status": "COMPLETED", "doses_taken": 3, "total_doses": 3},
        {"date": "2026-08-25", "status": "COMPLETED", "doses_taken": 3, "total_doses": 3},
        {"date": "2026-08-24", "status": "MISSED_ASSISTED", "doses_taken": 2, "total_doses": 3}
    ]
}

class DoseItem(BaseModel):
    id: str
    time_slot: str
    scheduled_time: str
    medication_name: str
    dosage: str
    status: str
    taken_at: Optional[str] = None
    instructions: str
    color: Optional[str] = "indigo"

class MarkTakenRequest(BaseModel):
    dose_id: str
    notes: Optional[str] = None

class MissedDoseHelpRequest(BaseModel):
    dose_id: str
    reason: Optional[str] = None

@router.get("")
async def get_adherence():
    """Returns today's medication routine and garden growth status."""
    return ADHERENCE_STATE

@router.post("/mark-taken")
async def mark_taken(payload: MarkTakenRequest):
    """Marks a specific dose as taken with timestamp and updates garden growth."""
    now_time = datetime.now().strftime("%I:%M %p")
    updated = False
    for dose in ADHERENCE_STATE["schedule"]:
        if dose["id"] == payload.dose_id:
            dose["status"] = "TAKEN"
            dose["taken_at"] = now_time
            updated = True
            break
    
    if updated and ADHERENCE_STATE["growth_stage"] < 5:
        ADHERENCE_STATE["growth_stage"] = min(5, ADHERENCE_STATE["growth_stage"] + 1)
        ADHERENCE_STATE["routine_message"] = "🌸 Beautiful progress! Your adherence garden bloomed a new flower."

    return {
        "success": True,
        "message": f"Dose marked as taken at {now_time}",
        "adherence": ADHERENCE_STATE
    }

@router.post("/missed-dose-help")
async def missed_dose_help(payload: MissedDoseHelpRequest):
    """Provides gentle, non-judgmental guidance when a dose is missed."""
    return {
        "gentle_prompt": "Your medicine was not recorded. Would you like some help?",
        "options": [
            {"id": "take_now", "label": "I took it just now", "action": "MARK_TAKEN"},
            {"id": "talk_assistant", "label": "Talk with Companion", "action": "OPEN_CHAT"},
            {"id": "remind_later", "label": "Remind me in 30 minutes", "action": "SNOOZE"}
        ],
        "monograph_rule": "Skip the missed dose if it is close to your next dose. Never take a double dose."
    }
