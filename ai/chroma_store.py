"""
ChromaDB Vector Database Store for DeMentor (AegisCare).
Stores all website data including:
1. Clinical Drug Monographs (Donepezil, Rivastigmine, Memantine, Galantamine)
2. Patient Profiles & Clinical Care Team Records
3. Medication Adherence Protocols & Multi-Tier Escalation Guidelines
4. Dementia Care Behavioral Guidelines & Milestone Motivation Quotes
"""

import os
import json
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings

CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "manifests", "document_manifest.json")


def get_chroma_client(persist_directory: Optional[str] = None):
    persist_dir = persist_directory or CHROMA_DIR
    os.makedirs(persist_dir, exist_ok=True)
    return chromadb.PersistentClient(path=persist_dir)


def initialize_and_seed_chromadb():
    client = get_chroma_client()
    print(f"Connecting to ChromaDB at: {CHROMA_DIR}")

    # 1. Clinical Monographs Collection
    mono_collection = client.get_or_create_collection(
        name="clinical_monographs",
        metadata={"description": "FDA & Health Canada official clinical drug monographs and BPSD guidelines"}
    )

    monograph_chunks = []
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                monograph_chunks = data.get("monographs", [])
        except Exception as e:
            print(f"Error loading manifest: {e}")

    if monograph_chunks:
        ids = [chunk["chunk_id"] for chunk in monograph_chunks]
        documents = [chunk["content"] for chunk in monograph_chunks]
        metadatas = [
            {
                "medication": str(chunk.get("medication", "general")),
                "brand_name": str(chunk.get("brand_name", "")),
                "document": str(chunk.get("document", "")),
                "section": str(chunk.get("section", "")),
                "page_number": int(chunk.get("page_number", 1)),
                "source_type": str(chunk.get("source_type", "product_monograph"))
            }
            for chunk in monograph_chunks
        ]
        # Upsert into collection
        mono_collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        print(f"Successfully stored {len(ids)} clinical monograph chunks into ChromaDB.")

    # 2. Patient Profiles Collection
    patient_collection = client.get_or_create_collection(
        name="patient_profiles",
        metadata={"description": "Patient intake records, physical stats, caregivers, and clinical care circles"}
    )

    patient_records = [
        {
            "id": "patient_afreen_01",
            "document": (
                "Patient: Afreen, Age: 68, Gender: Female, Height: 160 cm, Weight: 58 kg, Calculated BMI: 22.7. "
                "Diagnosed Condition: Mild Cognitive Impairment (Early Stage Alzheimer's Support). "
                "Prescribed Primary Medication: Donepezil Hydrochloride (Aricept) 10 mg orally once daily. "
                "Primary Caregiver: Priya (Daughter), Phone: +1 (555) 234-5678, Notification Channel: Telegram Bot (@BversityCareBot). "
                "Attending Physician: Dr. Aarav Mehta, MD, Apollo Geriatric Neurology Clinic, Phone: +1 (555) 890-1234. "
                "Emergency Safety Protocol: If acute syncope, severe dizziness, or pulse drops below 50 bpm occur, "
                "sit patient safely, immediately contact emergency medical services, and alert Dr. Aarav Mehta."
            ),
            "metadata": {
                "patient_id": "usr_afreen_01",
                "patient_name": "Afreen",
                "condition": "Mild Cognitive Impairment",
                "medication": "Donepezil Hydrochloride",
                "dosage": "10 mg",
                "caregiver_name": "Priya",
                "physician_name": "Dr. Aarav Mehta, MD"
            }
        },
        {
            "id": "patient_generic_mci_02",
            "document": (
                "General MCI Intake Archetype: Patient presenting with early-stage cognitive fluctuations and short-term "
                "memory slips. Treatment plan involves cholinesterase inhibitors with strict non-punitive gentle reminders, "
                "consistent daily routine anchors (Morning breakfast, Midday lunch, Evening dinner), and caregiver shared oversight."
            ),
            "metadata": {
                "patient_id": "archetype_mci",
                "patient_name": "General Patient",
                "condition": "Mild Cognitive Impairment",
                "medication": "Cholinesterase Inhibitor",
                "dosage": "Variable",
                "caregiver_name": "Primary Family Caregiver",
                "physician_name": "Geriatric Specialist"
            }
        }
    ]

    patient_collection.upsert(
        ids=[p["id"] for p in patient_records],
        documents=[p["document"] for p in patient_records],
        metadatas=[p["metadata"] for p in patient_records]
    )
    print(f"Successfully stored {len(patient_records)} patient profile records into ChromaDB.")

    # 3. Adherence & Escalation Protocols Collection
    adherence_collection = client.get_or_create_collection(
        name="adherence_protocols",
        metadata={"description": "30-day medication routines, dose slots, Telegram buttons, and multi-tier caregiver/physician escalation protocols"}
    )

    adherence_records = [
        {
            "id": "adherence_rule_double_dose_blocking",
            "document": (
                "Missed Dose Safety Protocol: Never double up your dose if a pill was forgotten. "
                "If taking Donepezil, Rivastigmine, or Memantine, take the next dose at the regular scheduled time. "
                "Never take two doses close together or at the same time to compensate for a missed dose."
            ),
            "metadata": {"category": "safety_protocol", "rule_type": "double_dose_prevention"}
        },
        {
            "id": "adherence_rule_day3_caregiver_escalation",
            "document": (
                "Day 3 Checkpoint Escalation Rule: If medication adherence is missed for 3 consecutive days, "
                "the platform automatically triggers an automated Telegram alert to Primary Caregiver Priya (@BversityCareBot). "
                "Message: 'Notification for Priya: Your patient has not recorded their medication for 3 days. "
                "Please gently check in to support their on-time adherence.'"
            ),
            "metadata": {"category": "escalation_protocol", "checkpoint": "day_3", "target": "caregiver"}
        },
        {
            "id": "adherence_rule_day5_physician_escalation",
            "document": (
                "Day 5 Checkpoint Clinical Escalation Rule: If medication adherence is missed through Day 5, "
                "clinical telemetry automatically escalates directly to Dr. Aarav Mehta, MD. "
                "An urgent clinical review audit record is created and sent to the clinic to prevent cognitive decline and hospitalization."
            ),
            "metadata": {"category": "escalation_protocol", "checkpoint": "day_5", "target": "physician"}
        },
        {
            "id": "adherence_rule_telegram_callback_actions",
            "document": (
                "Telegram CareBot 4-Action Callback System (@BversityCareBot): "
                "1. '✅ Taken': Immediately transitions medication card to Emerald Green, records timestamp, advances daily streak. "
                "2. '⏰ Snooze 15 min': Postpones reminder by 15 minutes, marks card as amber with follow-up timer. "
                "3. '❓ Not sure': Initiates cognitive validation flow, advises patient to inspect blister pack, strictly blocks double-dose. "
                "4. '❌ Missed': Marks dose as missed, initiates clinical monograph guidance, resets active streak to protect patient safely."
            ),
            "metadata": {"category": "telegram_integration", "feature": "interactive_callbacks"}
        }
    ]

    adherence_collection.upsert(
        ids=[a["id"] for a in adherence_records],
        documents=[a["document"] for a in adherence_records],
        metadatas=[a["metadata"] for a in adherence_records]
    )
    print(f"Successfully stored {len(adherence_records)} adherence and escalation rules into ChromaDB.")

    # 4. Behavioral & Memory Encouragement Guidelines Collection
    behavioral_collection = client.get_or_create_collection(
        name="behavioral_guidelines",
        metadata={"description": "Neurocognitive dementia care principles, empathy coaching validation, and streak milestone praise"}
    )

    behavioral_records = [
        {
            "id": "behavior_empathy_validation",
            "document": (
                "Dementia Empathy Coaching Protocol: Never argue, correct harshly, or make a patient with cognitive decline "
                "feel guilty or stressed about forgetting. Validate their emotions warmly, use simple short sentences, "
                "and offer calm grounding reassurance."
            ),
            "metadata": {"category": "empathy", "principle": "cognitive_validation"}
        },
        {
            "id": "behavior_milestones_rewards",
            "document": (
                "Streak Milestones Road Rewards: "
                "Day 1 Done: 'First Step Taken - Habit Initiator 🌱' (Spoken praise & confetti). "
                "Day 5 Done: '5-Day Consistency - Consistency Builder 🌿'. "
                "Day 10 Done: '10-Day Champion - Wellness Master 🌳'. "
                "Day 20 Done: '20-Day Golden Streak - Golden Adherent 🏆'. "
                "Day 30 Done: '30-Day Legend - Care Legend 👑'."
            ),
            "metadata": {"category": "milestones", "feature": "streak_rewards"}
        },
        {
            "id": "behavior_bpsd_management",
            "document": (
                "Non-Pharmacological BPSD Support: For evening confusion or sundowning agitation, recommend dim warm lighting, "
                "calming ambient nature sounds or instrumental music, soothing herbal chamomile tea, and structured familiar bedtime routines."
            ),
            "metadata": {"category": "bpsd", "guideline": "non_pharmacological"}
        }
    ]

    behavioral_collection.upsert(
        ids=[b["id"] for b in behavioral_records],
        documents=[b["document"] for b in behavioral_records],
        metadatas=[b["metadata"] for b in behavioral_records]
    )
    print(f"Successfully stored {len(behavioral_records)} behavioral and empathy guidelines into ChromaDB.")

    return {
        "status": "SUCCESS",
        "chroma_dir": CHROMA_DIR,
        "collections": [
            {"name": "clinical_monographs", "count": mono_collection.count()},
            {"name": "patient_profiles", "count": patient_collection.count()},
            {"name": "adherence_protocols", "count": adherence_collection.count()},
            {"name": "behavioral_guidelines", "count": behavioral_collection.count()},
        ]
    }


def query_chroma(collection_name: str, query_text: str, n_results: int = 3):
    client = get_chroma_client()
    try:
        collection = client.get_collection(name=collection_name)
        results = collection.query(query_texts=[query_text], n_results=n_results)
        return results
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    result = initialize_and_seed_chromadb()
    print("\n--- ChromaDB Seeding Summary ---")
    print(json.dumps(result, indent=2))

    print("\n--- Testing Semantic Search in ChromaDB ---")
    test_query = "What happens if I forget my Donepezil dose?"
    search_res = query_chroma("clinical_monographs", test_query, n_results=2)
    print(f"Query: '{test_query}'")
    for idx, doc in enumerate(search_res.get("documents", [[]])[0]):
        meta = search_res.get("metadatas", [[]])[0][idx]
        print(f"\nResult #{idx + 1} ({meta.get('document')} - Page {meta.get('page_number')}):")
        print(doc[:200] + "...")
