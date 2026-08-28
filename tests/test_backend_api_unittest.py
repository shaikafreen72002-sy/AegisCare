"""
Integration tests for FastAPI Backend endpoints.
"""

import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app

class TestBackendAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HEALTHY")

    def test_chat_missed_dose_contract(self):
        payload = {
            "message": "I forgot to take my Donepezil yesterday evening.",
            "patient_name": "Lakshmi",
            "medication": "donepezil"
        }
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "MISSED_DOSE")
        self.assertIn(data["risk_level"], ["LOW", "MEDIUM"])
        self.assertEqual(data["safety_status"], "SAFE")
        self.assertFalse(data["escalation_required"])
        self.assertGreater(len(data["sources"]), 0)
        self.assertEqual(data["sources"][0]["medication"], "donepezil")

    def test_chat_critical_escalation_triggers_notification(self):
        payload = {
            "message": "I fell down and have severe chest pain",
            "patient_name": "Lakshmi",
            "medication": "donepezil"
        }
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["escalation_required"])
        self.assertEqual(data["risk_level"], "CRITICAL")
        self.assertIsNotNone(data["escalation"])
        self.assertEqual(data["escalation"]["notification_status"], "SENT")
        self.assertTrue(data["escalation"]["receipt_id"].startswith("ALERT_TX_"))

    def test_adherence_flow(self):
        # Get adherence state
        res = self.client.get("/api/adherence")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("schedule", data)
        self.assertIn("growth_stage", data)

        # Mark evening dose as taken
        mark_res = self.client.post("/api/adherence/mark-taken", json={"dose_id": "dose_evening_03"})
        self.assertEqual(mark_res.status_code, 200)
        updated_data = mark_res.json()
        self.assertTrue(updated_data["success"])

    def test_monographs_endpoint(self):
        res = self.client.get("/api/monographs?medication=donepezil")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total"], 0)
        self.assertTrue(any(c["medication"] == "donepezil" for c in data["chunks"]))

if __name__ == "__main__":
    unittest.main()
