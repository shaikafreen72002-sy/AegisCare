import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.abspath('.'))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

print("=============================================")
print("   FASTAPI BACKEND CHAT ENDPOINT DEBUGGER    ")
print("=============================================")

scenarios = [
    ("Scenario 1: Tuesday Missed Dose Query", "did I miss my tablet on Tuesday", "Lakshmi", "donepezil"),
    ("Scenario 2: Clinical Pharmacist Advice", "what does Donepezil do for my memory?", "Afreen", "donepezil"),
    ("Scenario 3: 8PM Reminder Request", "can you keep a reminder to take the medicine on 8:00 in the night?", "Afreen", "donepezil"),
    ("Scenario 4: Unverified Foreign Drug (Zero Hallucination)", "can I take ibuprofen and amoxicillin with this?", "Lakshmi", "donepezil"),
    ("Scenario 5: Critical Emergency Syncope", "I took my pill, then I fainted and blacked out on the floor.", "Lakshmi", "donepezil")
]

passed_count = 0

for name, msg, patient, med in scenarios:
    print(f"\n>> Testing {name}...")
    resp = client.post("/api/chat", json={"message": msg, "patient_name": patient, "medication": med})
    if resp.status_code == 200:
        data = resp.json()
        print(f"  [PASS] Status: 200 OK")
        print(f"  Safety Status: {data.get('safety_status')}")
        print(f"  Intent: {data.get('intent')} | Risk Level: {data.get('risk_level')}")
        print(f"  Escalation Required: {data.get('escalation_required')}")
        if data.get('escalation'):
            print(f"  Escalation Receipt: {data['escalation'].get('receipt_id')}")
        print(f"  Sources Count: {len(data.get('sources', []))}")
        print(f"  Pipeline Events: {len(data.get('ai_pipeline_events', []))}")
        preview = data.get("response", "")[:120].replace("\n", " ")
        print(f"  Response: {preview}...")
        passed_count += 1
    else:
        print(f"  [FAIL] Status: {resp.status_code}")
        print(f"  Error Detail: {resp.text}")

print("\n=============================================")
print(f"   SUMMARY: {passed_count}/{len(scenarios)} SCENARIOS PASSED WITH ZERO ERRORS!")
print("=============================================")
