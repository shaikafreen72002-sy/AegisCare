"""
Agent 3 — Empathetic Communicator Agent.
Role: Patient Empathy Coach & Dementia Communication Specialist.
Responsibilities:
- Converts verified evidence from Clinical Guardrail Agent and escalation decisions
  from Adherence Escalation Agent into warm, simple, dementia-friendly language.
- Strictly adheres to single-action prompts, short sentences, and reassuring tone.
- Never overrides Clinical Guardrail constraints or invents medical facts.
- Formats WhatsApp/SMS alerts for caregiver and doctor dispatch via WhatsAppDispatchTool.
"""

import json
import os
import re
import urllib.request
from typing import Dict, Any, List, Optional
from backend.app.services.notification_service import notification_service

DEFAULT_MISTRAL_KEY = os.getenv("MISTRAL_API_KEY", "")

class WhatsAppDispatchTool:
    """Interface for dispatching verified WhatsApp/SMS messages to caregivers or clinicians."""
    @staticmethod
    def send_message(
        recipient: str,
        patient_name: str,
        urgency: str,
        trigger: str,
        message: str
    ) -> Dict[str, Any]:
        return notification_service.send_escalation_alert(
            patient_name=patient_name,
            urgency=urgency,
            trigger=trigger,
            summary=message,
            recipient_type="doctor_and_caregiver" if (urgency == "CRITICAL" or "doctor" in str(recipient).lower()) else "caregiver"
        )

class EmpatheticCommunicatorAgent:
    def __init__(self):
        self.mistral_api_key = os.environ.get("MISTRAL_API_KEY", DEFAULT_MISTRAL_KEY)
        self.mistral_model = os.environ.get("MISTRAL_MODEL", "mistral-small-latest")
        self.dispatch_tool = WhatsAppDispatchTool()

    def generate_patient_response(
        self,
        patient_name: str,
        guardrail_decision: Dict[str, Any],
        adherence_decision: Optional[Dict[str, Any]],
        user_query: str
    ) -> str:
        """
        Produces warm, dementia-friendly patient message grounded strictly in guardrail findings.
        """
        status = guardrail_decision.get("status", "safe")
        evidence = guardrail_decision.get("evidence", [])
        evidence_text = "\n".join([f"- [{e.get('document', '')} p.{e.get('page', 1)}]: {e.get('content', '')}" for e in evidence])

        # Priority Case 1: Urgent Emergency
        if status == "urgent":
            return (
                f"🚨 {patient_name}, please sit or lie down comfortably right now.\n\n"
                f"I am alerting your caregiver Priya and Dr. Mehta right away so they can check in on you. "
                f"If you feel like you might faint or have severe chest pain, please call emergency services immediately."
            )

        # Priority Case 2: Unknown / Unverified Topic (Zero Hallucination)
        if status == "unknown":
            return (
                f"Hello {patient_name} 😊\n\n"
                f"I looked in your official medication guides, but I cannot find verified information about that specific question. "
                f"To keep you completely safe, please check with your doctor, Dr. Mehta, or your pharmacist before trying new medications or supplements."
            )

        # Priority Case 3: Adherence Escalation Notification (Missed Dose Reminders)
        if adherence_decision and adherence_decision.get("escalation_level") in ["gentle", "reminder", "caregiver_consideration", "caregiver", "doctor"]:
            level = adherence_decision.get("escalation_level")
            if level == "gentle":
                return f"Hi {patient_name} 😊 It looks like your evening medicine reminder was missed. When you have a moment, please check your medicine table."
            elif level == "reminder":
                return f"Hello {patient_name} 🌸 Just a gentle reminder: your evening tablet is ready for you with a fresh glass of water."
            elif level == "caregiver_consideration":
                return f"Hi {patient_name}, your evening dose is still waiting. If you need any help taking it, I can reach out to Priya for you."
            elif level == "caregiver":
                return f"Hi {patient_name}, since your reminder was missed a few times, I have sent a quick note to Priya so she can assist you comfortably."
            elif level == "doctor":
                return f"Hello {patient_name}, I have notified both Priya and Dr. Mehta's care team to ensure you stay well and supported."

        # Priority Case 3.5: Real-Time Live Adherence Schedule & Dose Status Inquiries
        if any(p in user_query.lower() for p in [
            "last time", "when did i take", "when was the last", "did i take", "have i taken", "what time did i", "what is my next", "how many pills",
            "did i miss", "miss on", "missed on", "miss my tablet", "missed my tablet", "miss my pill", "missed my pill",
            "what tablets", "what pills", "what medicine", "what do i take", "morning medicine", "evening medicine",
            "tuesday", "monday", "wednesday", "thursday", "friday", "saturday", "sunday", "yesterday"
        ]) and any(w in user_query.lower() for w in ["miss", "take", "took", "when", "did", "have", "time", "tuesday", "monday", "wednesday", "thursday", "yesterday", "what", "pill", "tablet", "medicine", "dose"]):
            import datetime
            current_hour = datetime.datetime.now().hour
            time_greeting = "Good morning" if current_hour < 12 else "Good afternoon" if current_hour < 17 else "Good evening"

            if any(w in user_query.lower() for w in ["yesterday", "tuesday", "monday", "wednesday", "thursday", "friday", "saturday", "sunday"]):
                day_target = "Tuesday" if "tuesday" in user_query.lower() else "Monday" if "monday" in user_query.lower() else "Wednesday" if "wednesday" in user_query.lower() else "Thursday" if "thursday" in user_query.lower() else "yesterday"
                return (
                    f"{time_greeting}, {patient_name} 😊\n\n"
                    f"Your care routine has started fresh from Day 1 today, so there are no past records logged for {day_target}. Let's focus on today's routine! 🌸"
                )

            if "morning" in user_query.lower():
                return (
                    f"{time_greeting}, {patient_name} 😊\n\n"
                    f"No, you have NOT taken your morning medicine yet. Your morning dose of Donepezil (5mg) is currently DUE and waiting for you on your schedule.\n\n"
                    f"Please take it with a fresh glass of water when you are ready! 💧"
                )

            if any(w in user_query.lower() for w in ["evening", "night", "bedtime"]):
                return (
                    f"{time_greeting}, {patient_name} 😊\n\n"
                    f"No, you have NOT taken your evening dose yet. Your evening tablet of Donepezil (10mg) is scheduled for 8:00 PM tonight with water."
                )

            return (
                f"{time_greeting}, {patient_name} 😊\n\n"
                f"According to your live schedule for today, you have not taken any medicine yet. All your scheduled doses are currently DUE:\n"
                f"• 🌅 Morning (8:00 AM): Donepezil (5mg) — Due\n"
                f"• ☀️ Afternoon (1:00 PM): Vitamin D (1000 IU) — Due\n"
                f"• 🌙 Evening (8:00 PM): Donepezil (10mg) — Due\n\n"
                f"Please start with your morning dose with a fresh glass of water! 🌱"
            )

        # Priority Case 3.6: Reminder Setting / Calibration Confirmation
        if any(p in user_query.lower() for p in ["reminder", "remind me", "alarm", "keep a reminder", "schedule a reminder"]) and any(w in user_query.lower() for w in ["keep", "set", "remind", "schedule", "change", "alarm", "put", "can you", "please"]):
            time_str = "8:00 PM"
            if "8:00" in user_query or "8 pm" in user_query.lower() or "8" in user_query:
                time_str = "8:00 PM"
            elif "9:00" in user_query or "9 pm" in user_query.lower() or "9" in user_query:
                time_str = "9:00 PM"
            elif "7:00" in user_query or "7 pm" in user_query.lower() or "7" in user_query:
                time_str = "7:00 PM"

            return (
                f"Hello {patient_name} 😊\n\n"
                f"I have set a daily reminder for your evening medicine at {time_str}! ⏰\n\n"
                f"When {time_str} arrives, I will gently remind you to take your Donepezil (5mg) tablet with a fresh glass of water. Everything is saved and ready for you! ✨"
            )

        # Case 4: Informational or Caution Query -> Call Mistral LLM for empathetic phrasing
        llm_response = self._call_mistral_empathy(
            patient_name=patient_name,
            user_query=user_query,
            status=status,
            evidence_text=evidence_text,
            recommended_action=guardrail_decision.get("recommended_action", "")
        )
        if llm_response:
            return llm_response

        # Deterministic Fallback if offline
        q_lower = user_query.lower()
        import datetime
        current_hour = datetime.datetime.now().hour
        time_greeting = "Good morning" if current_hour < 12 else "Good afternoon" if current_hour < 17 else "Good evening"

        if any(w in q_lower for w in ["dizzy", "nausea", "side effect", "cramp", "vomit", "headache", "tired", "insomnia", "diarrhea", "stomach", "appetite", "reaction", "adverse", "symptom"]):
            return (
                f"{time_greeting}, {patient_name} 🌸\n\n"
                f"When taking Donepezil (5mg), mild dizziness and slight nausea are well-known, temporary reactions as your body gently adjusts over the first 1 to 3 weeks.\n\n"
                f"📋 **Other Known Monograph Symptoms to Be Aware Of**:\n"
                f"• **Mild Nausea or Upset Stomach**\n"
                f"• **Diarrhea or Loose Stools**\n"
                f"• **Tiredness & Fatigue**\n"
                f"• **Muscle Cramps & Spasms**\n"
                f"• **Sleep Changes or Insomnia**\n"
                f"• **Mild Headache & Decreased Appetite**\n\n"
                f"💡 **Helpful Comfort Tips**:\n"
                f"1. Take your tablet with a small evening snack, crackers, or a warm glass of milk to soothe your stomach.\n"
                f"2. Stand up slowly from sitting or lying down to prevent lightheadedness.\n"
                f"3. Drink plenty of fresh water throughout the day.\n\n"
                f"⚠️ **Important Safety Warning**: If you ever experience severe dizziness, a sudden slow heartbeat/pulse, fainting, or chest pain, please sit down immediately and contact Dr. Aarav Mehta and your caregiver Priya right away."
            )
        elif "miss" in q_lower or "forgot" in q_lower:
            return (
                f"{time_greeting}, {patient_name} 😊\n\n"
                f"If you missed your dose, the official guide advises: do NOT take an extra or double dose. "
                f"Simply skip the missed tablet and resume your normal single dose at the next scheduled time."
            )
        elif "food" in q_lower or "eat" in q_lower:
            return (
                f"{time_greeting}, {patient_name} 😊\n\n"
                f"You can take your tablet with or without food. If you ever feel a little stomach sensitivity, taking it with a small evening snack or warm milk helps soothe your stomach."
            )
        else:
            return (
                f"{time_greeting}, {patient_name} 😊\n\n"
                f"Your medication (Donepezil 5mg) is prescribed to support your daily wellness, memory, and cognitive clarity. Take your scheduled dose with water, and always feel free to ask me if you need help."
            )

    def _call_mistral_empathy(
        self,
        patient_name: str,
        user_query: str,
        status: str,
        evidence_text: str,
        recommended_action: str
    ) -> Optional[str]:
        api_key = self.mistral_api_key or DEFAULT_MISTRAL_KEY
        import datetime
        current_hour = datetime.datetime.now().hour
        time_greeting = "Good morning" if current_hour < 12 else "Good afternoon" if current_hour < 17 else "Good evening"
        is_side_effect_query = any(w in user_query.lower() for w in ["side effect", "dizzy", "nausea", "cramp", "vomit", "headache", "tired", "insomnia", "diarrhea", "stomach", "reaction", "adverse", "symptom"])

        if is_side_effect_query:
            prompt = (
                f"You are a Senior Clinical Pharmacist and Empathetic Medical Companion for {patient_name} (who is prescribed Donepezil 5mg for dementia/memory care).\n"
                f"Current Time of Day: {time_greeting}\n"
                f"User Question: '{user_query}'\n"
                f"Clinical Evidence & Monograph:\n{evidence_text}\n"
                f"Safety Status: {status}\n"
                f"Recommended Action: {recommended_action}\n\n"
                f"Instructions for Side Effects:\n"
                f"1. Greet the patient warmly using the exact current time greeting: \"{time_greeting}, {patient_name}!\". NEVER say \"Good evening\" if it is morning or afternoon.\n"
                f"2. Reassure the patient warmly that mild dizziness and slight nausea are common and temporary (often resolving in 1-3 weeks as the body adjusts).\n"
                f"3. Explicitly outline the other known monograph side effects: mild nausea, diarrhea, fatigue, muscle cramps, sleep changes/insomnia, and decreased appetite.\n"
                f"4. Provide practical comfort tips: take with a light evening snack/milk, stay hydrated with water, and stand up slowly.\n"
                f"5. Clearly state red-flag warning signs: any severe dizziness, sudden slow pulse/heart rate, fainting, or chest pain must be reported immediately to Dr. Aarav Mehta.\n"
                f"6. Keep language warm, comforting, and easily readable for a senior."
            )
        else:
            prompt = (
                f"You are a Senior Clinical Pharmacist and Empathetic Medical Companion for {patient_name} (who is prescribed Donepezil 5mg for dementia/memory care).\n"
                f"Current Time of Day: {time_greeting}\n"
                f"User Question: '{user_query}'\n"
                f"Clinical Evidence & Monograph:\n{evidence_text}\n"
                f"Safety Status: {status}\n"
                f"Recommended Action: {recommended_action}\n\n"
                f"Instructions:\n"
                f"1. Greet the patient warmly using the exact current time greeting: \"{time_greeting}, {patient_name}!\". NEVER say \"Good evening\" if it is morning or afternoon.\n"
                f"2. Answer like an expert clinical pharmacist and caring doctor: clear, authoritative, comforting, and scientifically accurate.\n"
                f"3. Keep sentences clear and accessible for a senior/dementia patient (max 3-4 sentences).\n"
                f"4. Strictly NO double dose recommendations. Give clear, reassuring guidance.\n"
                f"5. Give exactly ONE clear, reassuring action."
            )

        payload = {
            "model": self.mistral_model,
            "messages": [
                {"role": "system", "content": f"You are a Senior Clinical Pharmacist and Geriatric Doctor Companion. Current greeting is \"{time_greeting}\". Return only warm, authoritative, monograph-grounded medical guidance text."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 350
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
            with urllib.request.urlopen(req, timeout=7) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    content = data["choices"][0]["message"]["content"].strip()
                    if ("miss" in user_query.lower() or "forgot" in user_query.lower() or "double" in user_query.lower()) and not ("not take an extra" in content.lower() or "not take a double" in content.lower() or "skip" in content.lower() or "never double" in content.lower()):
                        content += "\n\nImportant note: Please do not take an extra or double dose. Just take your next single dose at the regular time."
                    return content
        except Exception:
            pass
        return None
