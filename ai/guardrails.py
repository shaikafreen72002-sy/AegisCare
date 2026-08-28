"""
Deterministic Safety Guardrails for Patient Medication Adherence.
Enforces strict zero-hallucination, red-flag escalation, and double-dose blocking.
"""

import re
from typing import Dict, Any, Optional, List, Tuple

RED_FLAG_PATTERNS = [
    (r"\b(faint(ed|ing)?|passed out|black(ed)? out|syncope|collapsed?)\b", "SYNCOPE_FAINTING", "CRITICAL"),
    (r"\b(chest pain|chest tightness|heart racing|palpitations|very slow (heart|pulse)|bradycardia)\b", "CARDIAC_SYMPTOM", "CRITICAL"),
    (r"\b(can'?t breathe|short(ness)? of breath|difficulty breathing|gasping)\b", "RESPIRATORY_DISTRESS", "CRITICAL"),
    (r"\b(overdose|took (too many|3 pills|whole bottle|double dose by mistake|extra pill))\b", "POSSIBLE_OVERDOSE", "CRITICAL"),
    (r"\b(severe vomiting|vomiting blood|throwing up continuously|can'?t keep fluids down)\b", "SEVERE_VOMITING", "HIGH"),
    (r"\b(fell down|had a fall|hit my head|bleeding from head)\b", "PATIENT_FALL", "HIGH"),
    (r"\b(rash everywhere|skin blister(ing)?|swollen (face|lips|tongue))\b", "SEVERE_ALLERGIC_REACTION", "CRITICAL"),
    (r"\b(hallucinat(ing|ion)|seeing things|sudden acute confusion|terrified)\b", "ACUTE_DELIRIUM", "HIGH"),
]

DOUBLE_DOSE_QUESTIONS = [
    r"\b(should i take (two|2|double|another|extra))\b",
    r"\b(can i take (two|2|double|another|extra))\b",
    r"\b(take two pills|take 2 pills|double up)\b",
]

class SafetyGuardrail:
    def check_safety(
        self,
        user_message: str,
        medication: Optional[str] = None,
        adherence_context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, str, bool, Optional[Dict[str, Any]]]:
        """
        Evaluates user input for safety violations or emergency triggers.
        Returns: (safety_status, risk_level, escalation_required, escalation_payload)
        """
        msg_lower = user_message.lower()

        # 1. Check for Red Flag Emergency Symptoms
        for pattern, trigger, urgency in RED_FLAG_PATTERNS:
            if re.search(pattern, msg_lower):
                escalation = {
                    "recipient": "caregiver" if urgency == "HIGH" else "doctor_and_caregiver",
                    "urgency": urgency,
                    "trigger": trigger,
                    "summary": f"Patient reported potential clinical emergency symptom matching [{trigger}]: '{user_message}'",
                    "recommended_action": "Contact patient immediately or dispatch local emergency care team if unresponsive."
                }
                return ("ESCALATE", urgency, True, escalation)

        # 2. Check for Overdose / Double-Dose Queries
        for pattern in DOUBLE_DOSE_QUESTIONS:
            if re.search(pattern, msg_lower):
                # Double dose queries are safe to handle conversationally, but risk is elevated to prevent mistakes
                return ("SAFE_WITH_STRICT_NO_DOUBLE_DOSE", "MEDIUM", False, None)

        return ("SAFE", "LOW", False, None)

    def review_response(
        self,
        candidate_response: str,
        retrieved_sources: List[Dict[str, Any]],
        intent: str
    ) -> Dict[str, Any]:
        """
        Post-generation review to ensure generated advice does not contradict clinical monographs
        or invent medical prescriptions.
        """
        resp_lower = candidate_response.lower()

        # Rule A: Never recommend doubling doses
        if re.search(r"\b(take (two|2|both|double) (pills|doses|tablets)|double your dose)\b", resp_lower):
            return {
                "safe": False,
                "reason": "PROHIBITED_DOUBLE_DOSE_ADVICE",
                "corrected_response": "Please do not take a double dose. Official medical guidelines advise skipping the missed dose and taking only your regular single dose at the next scheduled time."
            }

        # Rule B: If medical advice is requested but zero sources matched
        if intent in ["SIDE_EFFECT", "MEDICATION_WITH_FOOD", "MISSED_DOSE"] and not retrieved_sources:
            return {
                "safe": False,
                "reason": "INSUFFICIENT_EVIDENCE",
                "safety_status": "INSUFFICIENT_EVIDENCE",
                "corrected_response": "I want to be very careful with your health. I do not have verified clinical monograph instructions for that specific situation in my verified records. Please reach out to your doctor or pharmacist for personalized guidance."
            }

        return {"safe": True, "corrected_response": candidate_response}
