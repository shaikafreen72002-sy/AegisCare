"""
Unit & Integration Tests for Agentic AI Clinical Intake & Routine Calibration.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.intake_agent import IntakeCalibrationAgent

class TestIntakeCalibrationAgent(unittest.TestCase):
    def setUp(self):
        self.agent = IntakeCalibrationAgent()

    def test_bmi_calculation(self):
        bmi_res = self.agent.calculate_bmi(height_cm=160.0, weight_kg=55.0)
        self.assertAlmostEqual(bmi_res["bmi"], 21.5, delta=0.2)
        self.assertEqual(bmi_res["category"], "Normal weight")
        self.assertEqual(bmi_res["risk_flag"], "LOW")

    def test_agentic_calibration_pipeline(self):
        intake_payload = {
            "name": "Lakshmi Devi",
            "preferred_name": "Lakshmi Amma",
            "age": 74,
            "gender": "Female",
            "height_cm": 158.0,
            "weight_kg": 56.0,
            "condition_severity": "Mild Cognitive Impairment / Early Alzheimer's",
            "diagnosis_date": "2024-03",
            "medications": ["Donepezil Hydrochloride"],
            "evening_time": "20:00"
        }
        res = self.agent.calibrate_patient_routine(intake_payload)
        
        # Verify patient summary
        self.assertEqual(res["patient_summary"]["name"], "Lakshmi Devi")
        self.assertEqual(res["patient_summary"]["preferred_name"], "Lakshmi Amma")
        self.assertGreater(res["patient_summary"]["bmi"], 0)
        
        # Verify clinical rationale & safety guidelines
        self.assertTrue(len(res["clinical_rationale"]) > 10)
        self.assertGreater(len(res["safety_guidelines"]), 0)
        self.assertTrue(any("double" in g.lower() for g in res["safety_guidelines"]))
        
        # Verify routine garden setup
        self.assertIn("Lakshmi Amma", res["routine_garden_setup"]["garden_name"])
        self.assertEqual(res["routine_garden_setup"]["initial_stage"], 1)
        
        # Verify calibrated schedule
        self.assertGreater(len(res["calibrated_schedule"]), 0)
        self.assertTrue(any("donepezil" in s["medication_name"].lower() for s in res["calibrated_schedule"]))

if __name__ == "__main__":
    unittest.main()
