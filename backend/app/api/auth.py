"""
Authentication API Endpoints.
Supports Email / Phone Number + Password login with demo profiles and session tokens.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory users for quick demo and custom login
DEMO_USERS = {
    "lakshmi@example.com": {
        "user_id": "usr_lakshmi_01",
        "email": "lakshmi@example.com",
        "phone": "+1 (555) 234-5678",
        "name": "Lakshmi Devi",
        "preferred_name": "Lakshmi Amma",
        "role": "PATIENT",
        "intake_completed": True
    },
    "+15552345678": {
        "user_id": "usr_lakshmi_01",
        "email": "lakshmi@example.com",
        "phone": "+1 (555) 234-5678",
        "name": "Lakshmi Devi",
        "preferred_name": "Lakshmi Amma",
        "role": "PATIENT",
        "intake_completed": True
    },
    "priya@example.com": {
        "user_id": "usr_priya_02",
        "email": "priya@example.com",
        "phone": "+1 (555) 345-6789",
        "name": "Priya",
        "preferred_name": "Priya",
        "role": "CAREGIVER",
        "intake_completed": True
    }
}

class LoginRequest(BaseModel):
    identifier: str = Field(..., example="lakshmi@example.com or +1 (555) 234-5678")
    password: str = Field(..., example="password123")
    role: Optional[str] = Field(default="PATIENT")

class UserResponse(BaseModel):
    user_id: str
    identifier: str
    name: str
    preferred_name: str
    role: str
    intake_completed: bool
    token: str

@router.post("/login", response_model=UserResponse)
async def login_endpoint(payload: LoginRequest):
    ident = payload.identifier.strip().lower().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Check demo users or dynamically allow authenticated session
    matched_user = None
    for k, u in DEMO_USERS.items():
        clean_k = k.lower().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if clean_k in ident or ident in clean_k:
            matched_user = u
            break

    if not matched_user:
        # Default fresh profile requiring clinical intake
        name_guess = ident.split("@")[0].capitalize() if "@" in ident else "Patient"
        matched_user = {
            "user_id": f"usr_{abs(hash(ident)) % 100000}",
            "email": payload.identifier if "@" in payload.identifier else "",
            "phone": payload.identifier if "@" not in payload.identifier else "",
            "name": name_guess,
            "preferred_name": name_guess,
            "role": payload.role or "PATIENT",
            "intake_completed": False
        }

    return UserResponse(
        user_id=matched_user["user_id"],
        identifier=payload.identifier,
        name=matched_user["name"],
        preferred_name=matched_user["preferred_name"],
        role=matched_user["role"],
        intake_completed=matched_user["intake_completed"],
        token=f"aegis_jwt_token_{matched_user['user_id']}"
    )

@router.get("/me")
async def get_current_user():
    return {
        "user_id": "usr_lakshmi_01",
        "name": "Lakshmi Devi",
        "preferred_name": "Lakshmi Amma",
        "role": "PATIENT",
        "intake_completed": True
    }
