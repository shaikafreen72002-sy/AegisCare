"""
Application Configuration and Constants.
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Patient Medication Adherence Coach API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["*"]
    
    # Notification & Webhook settings
    WHATSAPP_ENABLED: bool = True
    SMS_ENABLED: bool = True
    DEMO_PATIENT_NAME: str = "Lakshmi"
    DEMO_MEDICATION: str = "Donepezil"
    DEMO_DOSE: str = "5 mg"
    DEMO_TIME: str = "8:00 PM"

settings = Settings()
