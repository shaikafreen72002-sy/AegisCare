"""
Unit and Integration Tests for the 4-Agent Agentic AI Architecture.
1. Clinical Guardrail Agent
2. Adherence Escalation Agent
3. Empathetic Communicator Agent
4. Document Discovery & Knowledge Agent
5. Agent Orchestrator & Pipeline Trace
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.knowledge_agent import DocumentKnowledgeAgent
from ai.guardrail_agent import ClinicalGuardrailAgent
from ai.adherence_agent import AdherenceEscalationAgent
from ai.empathy_agent import EmpatheticCommunicatorAgent
from ai.orchestrator import AIOrchestrator

class TestMultiAgentArchitecture(unittest.TestCase):
    def setUp(self):
        self.knowledge_agent = DocumentKnowledgeAgent()
        self.guardrail_agent = ClinicalGuardrailAgent(knowledge_agent=self.knowledge_agent)
        self.adherence_agent = AdherenceEscalationAgent()
        self.empathy_agent = EmpatheticCommunicatorAgent()
        self.orchestrator = AIOrchestrator()

    # Agent 4: Knowledge Agent Tests
    def test_document_inventory_discovery(self):
        inventory = self.knowledge_agent.get_inventory()
        self.assertGreater(len(inventory), 0)
        donepezil_doc = next((d for d in inventory if "donepezil" in d["filename"]), None)
        self.assertIsNotNone(donepezil_doc)
        self.assertTrue(donepezil_doc["rag_eligible"])
        self.assertIn("Dementia", donepezil_doc["topics"])
        self.assertIn("Missed Dose Protocols", donepezil_doc["topics"])

    # Agent 1: Clinical Guardrail Agent Tests
    def test_guardrail_emergency_urgent_classification(self):
        res = self.guardrail_agent.evaluate_medical_query(
            "I took my pill and I fainted and blacked out",
            medication_name="donepezil"
        )
        self.assertEqual(res["status"], "urgent")
        self.assertTrue(res["requires_escalation"])
        self.assertEqual(res["escalation_urgency"], "CRITICAL")

    def test_guardrail_zero_hallucination_unknown_topic(self):
        res = self.guardrail_agent.evaluate_medical_query(
            "Can I take ibuprofen and antibiotic amoxicillin with this?",
            medication_name="donepezil"
        )
        self.assertEqual(res["status"], "unknown")
        self.assertFalse(res["grounded"])
        self.assertEqual(len(res["evidence"]), 0)

    # Agent 2: Adherence Escalation Agent Tests
    def test_adherence_counter_progression_1_to_5(self):
        self.adherence_agent.reset_counter()
        
        # Step 1
        s1 = self.adherence_agent.record_missed_dose_or_unanswered()
        self.assertEqual(s1["acknowledgement_count"], 1)
        self.assertEqual(s1["escalation_level"], "gentle")

        # Step 2
        s2 = self.adherence_agent.record_missed_dose_or_unanswered()
        self.assertEqual(s2["acknowledgement_count"], 2)
        self.assertEqual(s2["escalation_level"], "reminder")

        # Step 3
        s3 = self.adherence_agent.record_missed_dose_or_unanswered()
        self.assertEqual(s3["acknowledgement_count"], 3)
        self.assertEqual(s3["escalation_level"], "caregiver_consideration")

        # Step 4
        s4 = self.adherence_agent.record_missed_dose_or_unanswered()
        self.assertEqual(s4["acknowledgement_count"], 4)
        self.assertEqual(s4["escalation_level"], "caregiver")
        self.assertTrue(s4["requires_caregiver_alert"])

        # Step 5
        s5 = self.adherence_agent.record_missed_dose_or_unanswered()
        self.assertEqual(s5["acknowledgement_count"], 5)
        self.assertEqual(s5["escalation_level"], "doctor")
        self.assertTrue(s5["requires_doctor_alert"])

        # Reset on taken
        ack = self.adherence_agent.record_acknowledgment(dose_id="dose_1", taken=True)
        self.assertEqual(ack["acknowledgement_count"], 0)

    # Agent 3: Empathetic Communicator Agent Tests
    def test_empathy_agent_dementia_friendly_tone(self):
        guardrail_res = {
            "status": "safe",
            "evidence": [{"document": "Donepezil Monograph", "page": 13, "content": "Can be taken with or without food."}],
            "recommended_action": "Inform patient they can take with a snack if nausea occurs."
        }
        resp = self.empathy_agent.generate_patient_response(
            patient_name="Lakshmi",
            guardrail_decision=guardrail_res,
            adherence_decision=None,
            user_query="Can I take it with milk?"
        )
        self.assertGreater(len(resp), 15)
        resp_low = resp.lower()
        self.assertTrue("milk" in resp_low or "snack" in resp_low or "food" in resp_low or "lakshmi" in resp_low)

    # Agent Orchestrator Pipeline Trace Tests
    def test_orchestrator_pipeline_trace_generation(self):
        res = self.orchestrator.process_message(
            message="What happens if I miss my dose?",
            patient_name="Lakshmi",
            medication_name="donepezil"
        )
        self.assertIn("response", res)
        self.assertIn("ai_pipeline_events", res)
        self.assertGreater(len(res["ai_pipeline_events"]), 2)
        
        # Verify agents in trace
        agents_in_trace = [e["agent"] for e in res["ai_pipeline_events"]]
        self.assertIn("Clinical Guardrail Agent", agents_in_trace)
        self.assertIn("Document Knowledge Agent", agents_in_trace)
        self.assertIn("Empathetic Communicator Agent", agents_in_trace)

if __name__ == "__main__":
    unittest.main()
