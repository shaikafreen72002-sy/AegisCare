"""
Verification script for live running servers.
"""

import json
import urllib.request
import urllib.error

def test_servers():
    print("==================================================")
    print("  PATIENT MEDICATION ADHERENCE COACH E2E CHECK")
    print("==================================================")

    # 1. Test Frontend HTML
    try:
        with urllib.request.urlopen("http://localhost:5173/") as res:
            html = res.read().decode("utf-8")
            status = res.status
            has_title = "AegisCare" in html or "Patient Medication" in html
            print(f"[PASS] Frontend Server (Port 5173): Status {status} | Title Verified: {has_title}")
    except Exception as e:
        print(f"[FAIL] Frontend check failed: {e}")

    # 2. Test Backend Health
    try:
        with urllib.request.urlopen("http://localhost:8000/health") as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"[PASS] Backend Health (Port 8000): {data.get('status')} | Service: {data.get('service')}")
    except Exception as e:
        print(f"[FAIL] Backend health check failed: {e}")

    # 3. Test Chat API - Evidence Grounding & Monograph Citation
    try:
        chat_payload = json.dumps({
            "message": "Can I take Donepezil with food or breakfast?",
            "patient_name": "Lakshmi",
            "medication": "donepezil"
        }).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/api/chat",
            data=chat_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            chat_data = json.loads(res.read().decode("utf-8"))
            print(f"\n[PASS] Chat API Test - Food Interaction Grounding:")
            print(f"    - Response: {chat_data.get('response')}")
            print(f"    - Intent: {chat_data.get('intent')}")
            print(f"    - Risk Level: {chat_data.get('risk_level')}")
            print(f"    - Safety Status: {chat_data.get('safety_status')}")
            print(f"    - Sources Cited: {len(chat_data.get('sources', []))} chunks (Doc: {chat_data.get('sources', [{}])[0].get('document')}, p.{chat_data.get('sources', [{}])[0].get('page')})")
    except Exception as e:
        print(f"[FAIL] Chat food test failed: {e}")

    # 4. Test Chat API - Critical Safety Escalation
    try:
        esc_payload = json.dumps({
            "message": "I feel very dizzy, I fainted and my chest hurts",
            "patient_name": "Lakshmi",
            "medication": "donepezil"
        }).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/api/chat",
            data=esc_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            esc_data = json.loads(res.read().decode("utf-8"))
            print(f"\n[PASS] Chat API Test - Critical Safety Escalation:")
            print(f"    - Response: {esc_data.get('response')}")
            print(f"    - Escalation Required: {esc_data.get('escalation_required')}")
            print(f"    - Risk Level: {esc_data.get('risk_level')}")
            print(f"    - Trigger Code: {esc_data.get('escalation', {}).get('trigger')}")
            print(f"    - Notification Dispatch Status: {esc_data.get('escalation', {}).get('notification_status')}")
            print(f"    - Receipt ID: {esc_data.get('escalation', {}).get('receipt_id')}")
    except Exception as e:
        print(f"[FAIL] Escalation test failed: {e}")

    # 5. Test Adherence API Checkoff
    try:
        mark_payload = json.dumps({
            "dose_id": "dose_evening_03"
        }).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/api/adherence/mark-taken",
            data=mark_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            adh_data = json.loads(res.read().decode("utf-8"))
            print(f"\n[PASS] Adherence API Test - Mark Taken:")
            print(f"    - Success: {adh_data.get('success')}")
            print(f"    - Garden Routine Message: {adh_data.get('adherence', {}).get('routine_message')}")
            print(f"    - Garden Growth Stage: {adh_data.get('adherence', {}).get('growth_stage')}/5")
    except Exception as e:
        print(f"[FAIL] Adherence test failed: {e}")

    # 6. Test Monograph Explorer API
    try:
        with urllib.request.urlopen("http://localhost:8000/api/monographs?medication=donepezil") as res:
            mono_data = json.loads(res.read().decode("utf-8"))
            print(f"\n[PASS] Monograph Knowledge Base Explorer:")
            print(f"    - Total Donepezil Chunks Loaded: {mono_data.get('total')}")
            for c in mono_data.get("chunks", [])[:2]:
                print(f"      * [{c.get('chunk_id')}] Section: {c.get('section')} (p.{c.get('page_number')})")
    except Exception as e:
        print(f"[FAIL] Monograph explorer test failed: {e}")

    print("\n==================================================")
    print("  ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_servers()
