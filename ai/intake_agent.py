"""
Agentic AI Clinical Intake & Routine Calibration Agent.
Powered by Mistral AI (mistral-small-latest) and grounded strictly in official Product Monographs.
Performs autonomous multi-step reasoning over patient clinical intake data to formulate
personalized daily schedules, food rules, precaution warnings, and growth garden targets.
"""

import json
import os
import re
import urllib.request
from typing import Dict, Any, List, Optional
from ai.rag_engine import RAGEngine

# Ensure .env is loaded
def _load_env():
    for env_path in [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
    ]:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ.setdefault(k.strip(), v.strip())
            except Exception:
                pass

_load_env()

DEFAULT_MISTRAL_KEY = os.getenv("MISTRAL_API_KEY", "")

class IntakeCalibrationAgent:
    def __init__(self, manifest_path: Optional[str] = None):
        self.rag = RAGEngine(manifest_path=manifest_path)
        self.mistral_api_key = os.environ.get("MISTRAL_API_KEY", DEFAULT_MISTRAL_KEY)
        self.mistral_model = os.environ.get("MISTRAL_MODEL", "mistral-small-latest")

    def calculate_bmi(self, height_cm: float, weight_kg: float) -> Dict[str, Any]:
        """Calculates BMI and clinical categorization."""
        if height_cm <= 0 or weight_kg <= 0:
            return {"bmi": 22.5, "category": "Normal weight", "risk_flag": "LOW"}
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m * height_m), 1)
        if bmi < 18.5:
            cat = "Underweight (Higher frail/fall sensitivity)"
            risk = "MEDIUM"
        elif bmi < 25.0:
            cat = "Normal weight"
            risk = "LOW"
        elif bmi < 30.0:
            cat = "Overweight"
            risk = "LOW"
        else:
            cat = "Obese class (Cardiovascular monitoring)"
            risk = "MEDIUM"
        return {"bmi": bmi, "category": cat, "risk_flag": risk}

    def calibrate_patient_routine(self, intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Autonomous agentic reasoning pipeline over clinical intake assessment.
        """
        patient_name = intake_data.get("name", "Lakshmi")
        preferred_name = intake_data.get("preferred_name", patient_name)
        age = int(intake_data.get("age", 74))
        gender = intake_data.get("gender", "Female")
        height_cm = float(intake_data.get("height_cm", 158))
        weight_kg = float(intake_data.get("weight_kg", 56))
        severity = intake_data.get("condition_severity", "Mild Cognitive Impairment")
        diagnosis_date = intake_data.get("diagnosis_date", "2024-03")
        medications_list = intake_data.get("medications", ["Donepezil Hydrochloride"])
        primary_med = medications_list[0] if medications_list else "Donepezil Hydrochloride"
        norm_primary_med = "donepezil"
        for m in ["donepezil", "rivastigmine", "galantamine", "memantine"]:
            if m in primary_med.lower():
                norm_primary_med = m
                break

        # Step 1: Physical assessment & BMI
        bmi_info = self.calculate_bmi(height_cm, weight_kg)

        # Step 2: Context-Constrained RAG retrieval for prescribed drugs
        retrieved_chunks = self.rag.retrieve(
            query=f"{norm_primary_med} dosage food administration",
            medication_filter=norm_primary_med,
            top_k=3
        )

        # Step 3: Agentic reasoning with Mistral LLM
        agentic_plan = self._generate_mistral_care_plan(
            name=preferred_name,
            age=age,
            gender=gender,
            bmi_info=bmi_info,
            severity=severity,
            diagnosis_date=diagnosis_date,
            primary_med=primary_med,
            norm_med=norm_primary_med,
            retrieved_chunks=retrieved_chunks
        )

        # Step 4: Construct structured Schedule Items based on calibrated plan
        schedule_items = self._build_calibrated_schedule(
            norm_med=norm_primary_med,
            primary_med=primary_med,
            preferred_evening_time=intake_data.get("evening_time", "20:00")
        )

        return {
            "patient_summary": {
                "name": patient_name,
                "preferred_name": preferred_name,
                "age": age,
                "gender": gender,
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "bmi": bmi_info["bmi"],
                "bmi_category": bmi_info["category"],
                "condition_severity": severity,
                "diagnosis_date": diagnosis_date,
                "primary_medication": primary_med
            },
            "clinical_rationale": agentic_plan.get("rationale", ""),
            "safety_guidelines": agentic_plan.get("safety_guidelines", []),
            "food_hydration_instructions": agentic_plan.get("food_instructions", ""),
            "routine_garden_setup": {
                "garden_name": f"{preferred_name}'s Routine Wellness Garden",
                "initial_stage": 1,
                "welcome_message": agentic_plan.get("garden_message", f"🌱 Welcome {preferred_name}! Your personalized medication routine is ready to grow.")
            },
            "calibrated_schedule": schedule_items,
            "sources": [
                {
                    "document": c.get("document"),
                    "page": c.get("page", 1),
                    "section": c.get("section", "general")
                }
                for c in retrieved_chunks
            ]
        }

    def _generate_mistral_care_plan(
        self,
        name: str,
        age: int,
        gender: str,
        bmi_info: Dict[str, Any],
        severity: str,
        diagnosis_date: str,
        primary_med: str,
        norm_med: str,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calls Mistral LLM to generate calibrated clinical reasoning."""
        api_key = self.mistral_api_key or DEFAULT_MISTRAL_KEY
        context_parts = [f"- [{c.get('document')}, p.{c.get('page')}]: {c.get('content')}" for c in retrieved_chunks]
        context_str = "\n".join(context_parts)

        prompt = (
            f"You are an expert Clinical Intake Agent calibrating an evidence-grounded dementia care plan.\n"
            f"Patient: {name} (Age: {age}, Gender: {gender}, BMI: {bmi_info['bmi']} - {bmi_info['category']})\n"
            f"Diagnosis: {severity} (Diagnosed: {diagnosis_date})\n"
            f"Prescription: {primary_med}\n\n"
            f"Official Monograph Excerpts:\n{context_str}\n\n"
            f"Task: Generate a JSON response with keys:\n"
            f"1. \"rationale\": (2-3 sentences explaining personalized pacing, low cognitive load, and optimal timing for {name}).\n"
            f"2. \"safety_guidelines\": (Array of 3 clear, reassuring bullet points grounded in the monograph; explicitly include 'Never double-dose if a pill is forgotten').\n"
            f"3. \"food_instructions\": (Specific meal/snack guidance for {norm_med}).\n"
            f"4. \"garden_message\": (A warm 1-sentence supportive message for their Routine Garden).\n"
            f"Output ONLY valid JSON."
        )

        payload = {
            "model": self.mistral_model,
            "messages": [
                {"role": "system", "content": "You are a clinical adherence intake specialist. Return strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 500
        }

        try:
            req = urllib.request.Request(
                "https://api.mistral.ai/v1/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 200:
                    raw_data = json.loads(resp.read().decode("utf-8"))
                    content = raw_data["choices"][0]["message"]["content"].strip()
                    # Clean markdown codeblocks if present
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n?", "", content)
                        content = re.sub(r"\n?```$", "", content)
                    parsed = json.loads(content)
                    return parsed
        except Exception as e:
            print(f"[IntakeAgent] Mistral fallback to local synthesizer: {e}")

        # Deterministic Clinical Fallback
        food_rules = {
            "donepezil": "Can be taken with or without food. If mild nausea occurs, take with an evening snack or warm milk.",
            "rivastigmine": "Must always be taken with food during morning and evening meals to minimize stomach sensitivity.",
            "galantamine": "Take once daily with morning breakfast and plenty of water.",
            "memantine": "Can be taken with or without meals at a regular time with water."
        }

        return {
            "rationale": f"Personalized for {name} ({age} years old) living with {severity}. A calm, low-cognitive-load evening routine protects memory function and encourages gentle adherence without anxiety.",
            "safety_guidelines": [
                "Take your medicine at the same scheduled time every day.",
                "If a dose is ever missed, do NOT take an extra or double dose. Resume the next scheduled dose as normal.",
                "Report any severe dizziness, sudden slow pulse, or blackouts to Priya or Dr. Mehta immediately."
            ],
            "food_instructions": food_rules.get(norm_med, "Take with water and a light snack if stomach sensitivity occurs."),
            "garden_message": f"🌱 Welcome {name}! Your personalized Jasmine Routine Garden is planted and ready to bloom with each completed dose."
        }

    def _build_calibrated_schedule(
        self,
        norm_med: str,
        primary_med: str,
        preferred_evening_time: str = "20:00"
    ) -> List[Dict[str, Any]]:
        """Generates custom dose schedule items for the patient."""
        if norm_med == "rivastigmine":
            return [
                {
                    "id": "dose_morning_01",
                    "time_slot": "Morning (8:00 AM)",
                    "scheduled_time": "08:00",
                    "medication_name": f"{primary_med} (Morning Dose)",
                    "dosage": "1.5 mg - 3 mg",
                    "status": "DUE",
                    "taken_at": None,
                    "instructions": "Take with breakfast meal to protect your stomach.",
                    "color": "emerald"
                },
                {
                    "id": "dose_evening_02",
                    "time_slot": f"Evening ({preferred_evening_time})",
                    "scheduled_time": preferred_evening_time,
                    "medication_name": f"{primary_med} (Evening Dose)",
                    "dosage": "1.5 mg - 3 mg",
                    "status": "UPCOMING",
                    "taken_at": None,
                    "instructions": "Take with your evening dinner.",
                    "color": "indigo"
                }
            ]
        elif norm_med == "galantamine":
            return [
                {
                    "id": "dose_morning_01",
                    "time_slot": "Morning (8:00 AM)",
                    "scheduled_time": "08:00",
                    "medication_name": primary_med,
                    "dosage": "8 mg - 16 mg ER",
                    "status": "DUE",
                    "taken_at": None,
                    "instructions": "Take in the morning with breakfast and plenty of water.",
                    "color": "emerald"
                },
                {
                    "id": "dose_hydration_02",
                    "time_slot": "Midday Hydration (1:00 PM)",
                    "scheduled_time": "13:00",
                    "medication_name": "Hydration & Routine Care",
                    "dosage": "1 Glass Water",
                    "status": "UPCOMING",
                    "taken_at": None,
                    "instructions": "Gentle fluid hydration with lunch.",
                    "color": "sky"
                }
            ]
        else:
            # Donepezil & Memantine standard evening schedule
            return [
                {
                    "id": "dose_morning_wellness",
                    "time_slot": "Morning (8:00 AM)",
                    "scheduled_time": "08:00",
                    "medication_name": "Morning Wellness & Hydration",
                    "dosage": "Hydration / Tea",
                    "status": "DUE",
                    "taken_at": None,
                    "instructions": "Enjoy your morning tea or breakfast in calm sunlight.",
                    "color": "emerald"
                },
                {
                    "id": "dose_evening_primary",
                    "time_slot": f"Evening ({preferred_evening_time})",
                    "scheduled_time": preferred_evening_time,
                    "medication_name": primary_med,
                    "dosage": "5 mg",
                    "status": "UPCOMING",
                    "taken_at": None,
                    "instructions": "Take just prior to retiring with water or an evening snack.",
                    "color": "indigo"
                }
            ]
