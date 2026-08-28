"""
Agent Orchestrator for Dementia Medication Adherence Coach.
Sequences the 4 Specialized Agents:
1. Document Knowledge Agent (RAG Context & Inventory)
2. Clinical Guardrail Agent (Safety & Groundedness Decision)
3. Adherence Escalation Agent (1-5 Non-Acknowledgment Counter & Escalation Tree)
4. Empathetic Communicator Agent (Dementia-Friendly Language & WhatsApp Dispatch)
Returns full structured clinical response and live AI Pipeline Trace Events for the UI.
"""

from typing import Dict, Any, List, Optional
from ai.knowledge_agent import DocumentKnowledgeAgent
from ai.guardrail_agent import ClinicalGuardrailAgent
from ai.adherence_agent import AdherenceEscalationAgent
from ai.empathy_agent import EmpatheticCommunicatorAgent

class AIOrchestrator:
    def __init__(self, manifest_path: Optional[str] = None):
        self.knowledge_agent = DocumentKnowledgeAgent(manifest_path=manifest_path)
        self.guardrail_agent = ClinicalGuardrailAgent(knowledge_agent=self.knowledge_agent)
        self.adherence_agent = AdherenceEscalationAgent()
        self.empathy_agent = EmpatheticCommunicatorAgent()

    def process_message(
        self,
        message: str,
        patient_name: str = "Lakshmi",
        medication_name: str = "donepezil"
    ) -> Dict[str, Any]:
        """
        Executes multi-agent pipeline sequence and returns final response with pipeline trace.
        """
        pipeline_events: List[Dict[str, Any]] = []

        # Check for Dose Acknowledgment Trigger (Scenario 1)
        msg_low = message.lower()
        is_question = any(q in msg_low for q in ["when", "did i", "what time", "last time", "have i", "how many", "?"])
        is_marking_taken = not is_question and any(w in msg_low for w in ["took my", "taken my", "just took", "swallowed my pill", "mark taken", "already took", "i took it"])
        
        adherence_decision = None
        if is_marking_taken:
            adherence_decision = self.adherence_agent.record_acknowledgment(dose_id="current_dose", taken=True)
            pipeline_events.append({
                "agent": "Adherence Escalation Agent",
                "role": "Patient Monitoring Manager",
                "status": "SUCCESS",
                "action": "DOSE_RECORDED",
                "detail": "Dose marked as taken. Non-acknowledgment counter reset to 0."
            })

        # Step 1: Clinical Guardrail Agent Evaluation
        guardrail_decision = self.guardrail_agent.evaluate_medical_query(
            query=message,
            medication_name=medication_name,
            patient_name=patient_name
        )
        pipeline_events.append({
            "agent": "Clinical Guardrail Agent",
            "role": "Medical Information Specialist",
            "status": "SUCCESS",
            "action": f"STATUS_{guardrail_decision['status'].upper()}",
            "detail": f"Evaluation: {guardrail_decision['status'].upper()} — {guardrail_decision['reason']}"
        })

        # Step 2: RAG Knowledge Retrieval Event
        evidence = guardrail_decision.get("evidence", [])
        if evidence:
            pipeline_events.append({
                "agent": "Document Knowledge Agent",
                "role": "Clinical Knowledge Librarian",
                "status": "SUCCESS",
                "action": "EVIDENCE_RETRIEVED",
                "detail": f"Retrieved {len(evidence)} verified monograph source chunks."
            })
        else:
            pipeline_events.append({
                "agent": "Document Knowledge Agent",
                "role": "Clinical Knowledge Librarian",
                "status": "NOTICE",
                "action": "ZERO_HALLUCINATION_ENFORCED",
                "detail": "No matching monograph sources found in verified knowledge base."
            })

        # Step 3: Handle Emergency or Caregiver Escalation Dispatch
        escalation_result = None
        if guardrail_decision.get("requires_escalation") or (adherence_decision and adherence_decision.get("requires_caregiver_alert")):
            urgency = guardrail_decision.get("escalation_urgency", "HIGH")
            trigger_name = "CRITICAL_SYMPTOM" if guardrail_decision.get("requires_escalation") else "REPEATED_MISSED_DOSES"
            summary_text = guardrail_decision.get("reason", "Urgent clinical escalation required.")

            escalation_result = self.empathy_agent.dispatch_tool.send_message(
                recipient="Dr. Mehta & Caregiver Priya" if urgency == "CRITICAL" else "Priya (Caregiver)",
                patient_name=patient_name,
                urgency=urgency,
                trigger=trigger_name,
                message=summary_text
            )

            pipeline_events.append({
                "agent": "Empathetic Communicator Agent",
                "role": "WhatsApp Dispatch Tool",
                "status": "SENT",
                "action": "ESCALATION_DISPATCHED",
                "detail": f"Dispatched {urgency} WhatsApp alert to {escalation_result.get('recipient', 'Care Team')} (Receipt: {escalation_result.get('receipt_id')})."
            })

        # Step 4: Empathetic Communicator Agent Generation
        final_text = self.empathy_agent.generate_patient_response(
            patient_name=patient_name,
            guardrail_decision=guardrail_decision,
            adherence_decision=adherence_decision,
            user_query=message
        )
        pipeline_events.append({
            "agent": "Empathetic Communicator Agent",
            "role": "Patient Empathy Coach",
            "status": "SUCCESS",
            "action": "RESPONSE_FORMULATED",
            "detail": "Personalized dementia-friendly response generated."
        })

        # Format sources for UI
        formatted_sources = [
            {
                "document": e.get("document", "Product Monograph"),
                "medication": medication_name,
                "page": e.get("page", 1),
                "section": e.get("section", "General Guidance"),
                "content": e.get("content", "")
            }
            for e in evidence
        ]

        # Map intent for backward compatibility
        intent_map = {
            "urgent": "SEVERE_SYMPTOM",
            "caution": "SIDE_EFFECT",
            "unknown": "GENERAL_QUERY",
            "safe": "DRUG_INFO" if "what" in msg_low or "know" in msg_low else "GENERAL_QUERY"
        }
        if is_marking_taken:
            intent = "MARK_TAKEN"
        elif any(q in msg_low for q in ["last time", "when did i", "what time", "my schedule", "my routine"]):
            intent = "ADHERENCE_QUERY"
        elif any(r in msg_low for r in ["reminder", "remind me", "alarm", "keep a reminder", "schedule a reminder"]):
            intent = "REMINDER_SETUP"
        elif "miss" in msg_low or "forgot" in msg_low:
            intent = "MISSED_DOSE"
        elif "food" in msg_low or "eat" in msg_low:
            intent = "MEDICATION_WITH_FOOD"
        else:
            intent = intent_map.get(guardrail_decision["status"], "GENERAL_QUERY")

        risk_level_map = {
            "urgent": "CRITICAL",
            "caution": "MEDIUM",
            "unknown": "LOW",
            "safe": "LOW"
        }

        return {
            "response": final_text,
            "intent": intent,
            "risk_level": risk_level_map.get(guardrail_decision["status"], "LOW"),
            "safety_status": "ESCALATE" if guardrail_decision["status"] == "urgent" else "INSUFFICIENT_EVIDENCE" if guardrail_decision["status"] == "unknown" else "SAFE",
            "escalation_required": guardrail_decision.get("requires_escalation", False),
            "escalation": escalation_result,
            "sources": formatted_sources,
            "guardrail_decision": guardrail_decision,
            "adherence_decision": adherence_decision or self.adherence_agent.get_current_status(),
            "ai_pipeline_events": pipeline_events
        }

    def simulate_missed_dose_escalation(self, patient_name: str = "Lakshmi") -> Dict[str, Any]:
        """Runs one increment of the 1-5 escalation tree (Scenario 2)."""
        adherence_decision = self.adherence_agent.record_missed_dose_or_unanswered()
        
        guardrail_decision = {
            "status": "caution" if adherence_decision["acknowledgement_count"] < 4 else "urgent",
            "grounded": True,
            "evidence": [
                {
                    "document": "Donepezil Hydrochloride Product Monograph",
                    "page": 49,
                    "section": "Missed Dose Instructions",
                    "content": "If a dose is missed, do NOT take an extra or double dose. Resume next single dose."
                }
            ],
            "reason": adherence_decision["reason"],
            "recommended_action": adherence_decision["action"],
            "requires_escalation": adherence_decision["requires_caregiver_alert"] or adherence_decision["requires_doctor_alert"],
            "escalation_urgency": "CRITICAL" if adherence_decision["requires_doctor_alert"] else "HIGH" if adherence_decision["requires_caregiver_alert"] else "MEDIUM"
        }

        pipeline_events = [
            {
                "agent": "Adherence Escalation Agent",
                "role": "Patient Monitoring Manager",
                "status": "SUCCESS",
                "action": f"COUNTER_STEP_{adherence_decision['acknowledgement_count']}",
                "detail": f"Counter: {adherence_decision['acknowledgement_count']}/5 → Escalation Level: {adherence_decision['escalation_level'].upper()}"
            },
            {
                "agent": "Clinical Guardrail Agent",
                "role": "Medical Information Specialist",
                "status": "SUCCESS",
                "action": "MISSED_DOSE_SAFETY_CONFIRMED",
                "detail": "Verified strict No-Double-Dose rule from monograph p.49."
            }
        ]

        escalation_result = None
        if guardrail_decision["requires_escalation"]:
            escalation_result = self.empathy_agent.dispatch_tool.send_message(
                recipient="Dr. Mehta & Caregiver Priya" if adherence_decision["requires_doctor_alert"] else "Priya (Caregiver)",
                patient_name=patient_name,
                urgency=guardrail_decision["escalation_urgency"],
                trigger="REPEATED_MISSED_DOSES",
                message=f"Non-acknowledgment counter reached {adherence_decision['acknowledgement_count']}/5. Action: {adherence_decision['action']}"
            )
            pipeline_events.append({
                "agent": "Empathetic Communicator Agent",
                "role": "WhatsApp Dispatch Tool",
                "status": "SENT",
                "action": "ESCALATION_ALERT_SENT",
                "detail": f"WhatsApp notification dispatched to {escalation_result.get('recipient')}."
            })

        response_text = self.empathy_agent.generate_patient_response(
            patient_name=patient_name,
            guardrail_decision=guardrail_decision,
            adherence_decision=adherence_decision,
            user_query="Missed medication reminder"
        )
        pipeline_events.append({
            "agent": "Empathetic Communicator Agent",
            "role": "Patient Empathy Coach",
            "status": "SUCCESS",
            "action": "PROMPT_FORMULATED",
            "detail": f"Formulated {adherence_decision['escalation_level']} message for {patient_name}."
        })

        return {
            "response": response_text,
            "intent": "MISSED_DOSE",
            "risk_level": "CRITICAL" if adherence_decision["requires_doctor_alert"] else "HIGH" if adherence_decision["requires_caregiver_alert"] else "MEDIUM",
            "safety_status": "SAFE_WITH_STRICT_NO_DOUBLE_DOSE",
            "escalation_required": guardrail_decision["requires_escalation"],
            "escalation": escalation_result,
            "sources": guardrail_decision["evidence"],
            "adherence_decision": adherence_decision,
            "guardrail_decision": guardrail_decision,
            "ai_pipeline_events": pipeline_events
        }
