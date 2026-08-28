"""
Agent 2 — Adherence Escalation Agent.
Role: Patient Monitoring Manager & Adherence Decision Engine.
Responsibilities:
- Tracks medication reminder acknowledgments and timestamps.
- Maintains the 1–5 non-acknowledgment counter.
- Executes configurable escalation policy tree:
  Counter 1 -> Gentle reminder
  Counter 2 -> Stronger / clear reminder
  Counter 3 -> Flag adherence concern & Caregiver consideration
  Counter 4 -> Direct Caregiver WhatsApp / SMS alert
  Counter 5 -> Clinical / Physician escalation
- Returns structured adherence decision state.
"""

from typing import Dict, Any, Optional

class AdherenceEscalationAgent:
    def __init__(self):
        self.non_acknowledgment_counter = 0
        self.max_counter = 5
        self.adherence_history = []

    def record_acknowledgment(self, dose_id: str, taken: bool = True) -> Dict[str, Any]:
        """Resets the non-acknowledgment counter upon patient acknowledgment or intake."""
        prev_count = self.non_acknowledgment_counter
        if taken:
            self.non_acknowledgment_counter = 0
        return {
            "event": "DOSE_ACKNOWLEDGED" if taken else "DOSE_POSTPONED",
            "acknowledgement_count": self.non_acknowledgment_counter,
            "previous_count": prev_count,
            "adherence_status": "on_track",
            "escalation_level": "none",
            "action": "log_success",
            "reason": "Dose successfully marked as taken by patient."
        }

    def record_missed_dose_or_unanswered(self, dose_id: Optional[str] = None) -> Dict[str, Any]:
        """Increments non-acknowledgment counter and computes escalation tree decision."""
        self.non_acknowledgment_counter = min(self.max_counter, self.non_acknowledgment_counter + 1)
        count = self.non_acknowledgment_counter

        if count == 1:
            return {
                "acknowledgement_count": count,
                "adherence_status": "mild_delay",
                "escalation_level": "gentle",
                "action": "send_gentle_reminder",
                "reason": "1st reminder unanswered. Gentle follow-up prompt required.",
                "requires_caregiver_alert": False,
                "requires_doctor_alert": False
            }
        elif count == 2:
            return {
                "acknowledgement_count": count,
                "adherence_status": "delayed",
                "escalation_level": "reminder",
                "action": "send_clear_reminder",
                "reason": "2nd reminder unanswered. Clear single-action reminder required.",
                "requires_caregiver_alert": False,
                "requires_doctor_alert": False
            }
        elif count == 3:
            return {
                "acknowledgement_count": count,
                "adherence_status": "at_risk",
                "escalation_level": "caregiver_consideration",
                "action": "prepare_caregiver_notice",
                "reason": "3 consecutive missed prompts. Adherence risk detected.",
                "requires_caregiver_alert": False,
                "requires_doctor_alert": False
            }
        elif count == 4:
            return {
                "acknowledgement_count": count,
                "adherence_status": "high_risk",
                "escalation_level": "caregiver",
                "action": "contact_caregiver",
                "reason": "4 consecutive missed prompts. Dispatching verified WhatsApp alert to Priya.",
                "requires_caregiver_alert": True,
                "requires_doctor_alert": False
            }
        else: # count >= 5
            return {
                "acknowledgement_count": count,
                "adherence_status": "critical",
                "escalation_level": "doctor",
                "action": "contact_doctor_and_caregiver",
                "reason": "5 consecutive missed reminders. Escalating to Dr. Mehta and Caregiver Priya for clinical review.",
                "requires_caregiver_alert": True,
                "requires_doctor_alert": True
            }

    def get_current_status(self) -> Dict[str, Any]:
        """Returns the current state of the adherence escalation counter."""
        count = self.non_acknowledgment_counter
        status = "on_track" if count == 0 else "at_risk" if count < 4 else "critical"
        return {
            "acknowledgement_count": count,
            "adherence_status": status,
            "max_counter": self.max_counter
        }

    def reset_counter(self):
        self.non_acknowledgment_counter = 0
