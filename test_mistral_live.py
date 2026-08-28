import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from ai.orchestrator import AIOrchestrator

orch = AIOrchestrator()
print("[1] Testing Donepezil drug info query with Mistral LLM...")
res = orch.process_message("can i know about the drug donepezil", patient_name="Lakshmi Amma", medication_name="donepezil")
print("Intent:", res["intent"])
print("Risk Level:", res["risk_level"])
print("Sources Count:", len(res["sources"]))
print("Response:\n", res["response"].encode('ascii', errors='replace').decode('ascii'))

print("\n[2] Testing Missed dose query with Mistral LLM...")
res2 = orch.process_message("I forgot to take my pill yesterday night, should I take 2 pills now?", patient_name="Lakshmi Amma", medication_name="donepezil")
print("Intent:", res2["intent"])
print("Sources Count:", len(res2["sources"]))
print("Response:\n", res2["response"].encode('ascii', errors='replace').decode('ascii'))
