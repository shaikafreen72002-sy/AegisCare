"""
Agent 4 — Document Discovery & Knowledge Agent.
Role: Document Librarian & Clinical Knowledge Ingestion Specialist.
Analyzes uploaded documents and product monographs, generates comprehensive inventory metadata,
extracts clinical topics and medication mappings, and manages RAG index eligibility.
"""

import json
import os
from typing import List, Dict, Any, Optional
from ai.rag_engine import RAGEngine, MANIFEST_PATH

class DocumentKnowledgeAgent:
    def __init__(self, manifest_path: Optional[str] = None):
        self.manifest_path = manifest_path or MANIFEST_PATH
        self.rag = RAGEngine(manifest_path=self.manifest_path)
        self.documents_inventory: List[Dict[str, Any]] = []
        self._build_inventory()

    def _build_inventory(self):
        """Analyzes all monograph chunks in the manifest and builds a rich document inventory."""
        chunks = self.rag.get_all_chunks()
        doc_map: Dict[str, Dict[str, Any]] = {}

        for c in chunks:
            doc_name = c.get("document", "Clinical Monograph")
            med = c.get("medication", "general")
            brand = c.get("brand_name", "")
            section = c.get("section", "general")
            page = c.get("page_number", 1)
            content = c.get("content", "")

            if doc_name not in doc_map:
                filename = f"{med.lower()}_product_monograph.pdf" if med != "general_bpsd" else "bpsd_clinical_guidelines.pdf"
                doc_map[doc_name] = {
                    "document_id": f"doc_{med.lower()}",
                    "filename": filename,
                    "title": doc_name,
                    "file_type": "PDF / Monograph",
                    "source": "Official Health Product Monograph",
                    "medications": [f"{med.capitalize()} ({brand})" if brand else med.capitalize()],
                    "topics": set(["Dementia", "Medication Adherence"]),
                    "symptoms_discussed": set(),
                    "dementia_relevance": "High — Core Pharmacotherapy for Alzheimer's & Dementia",
                    "adherence_rules": "Strict No-Double-Dose protocol; routine timing guidelines",
                    "caregiver_guidance": "Caregiver monitoring for cognitive changes and adverse event reporting",
                    "emergency_safety": "Syncope, severe bradycardia, and suspected overdose escalation protocols",
                    "rag_eligible": True,
                    "pages_covered": set(),
                    "sections_covered": set(),
                    "chunks_count": 0,
                    "sample_excerpt": content[:160] + "..."
                }

            doc_entry = doc_map[doc_name]
            doc_entry["chunks_count"] += 1
            doc_entry["pages_covered"].add(page)
            doc_entry["sections_covered"].add(section.replace("_", " ").title())

            # Topic and symptom extraction
            c_low = content.lower()
            if "food" in c_low or "meal" in c_low or "snack" in c_low:
                doc_entry["topics"].add("Meal Administration & Absorption")
            if "miss" in c_low or "skip" in c_low or "double" in c_low:
                doc_entry["topics"].add("Missed Dose Protocols")
            if "adverse" in c_low or "nausea" in c_low or "dizzy" in c_low:
                doc_entry["topics"].add("Side Effects & Safety")
                doc_entry["symptoms_discussed"].update(["Nausea", "Diarrhea", "Insomnia", "Dizziness", "Fatigue", "Muscle Cramps"])
            if "bradycardia" in c_low or "faint" in c_low or "syncope" in c_low:
                doc_entry["symptoms_discussed"].update(["Bradycardia (Slow Heart Rate)", "Syncope (Fainting)"])

        # Format sets into sorted lists
        self.documents_inventory = []
        for d in doc_map.values():
            d["topics"] = sorted(list(d["topics"]))
            d["symptoms_discussed"] = sorted(list(d["symptoms_discussed"]))
            d["pages_covered"] = sorted(list(d["pages_covered"]))
            d["sections_covered"] = sorted(list(d["sections_covered"]))
            self.documents_inventory.append(d)

    def get_inventory(self) -> List[Dict[str, Any]]:
        """Returns verified document inventory."""
        return self.documents_inventory

    def get_document_details(self, document_id: str) -> Optional[Dict[str, Any]]:
        for doc in self.documents_inventory:
            if doc["document_id"] == document_id:
                return doc
        return None

    def retrieve_chunks_for_query(self, query: str, medication_filter: Optional[str] = None, top_k: int = 3) -> List[Dict[str, Any]]:
        """Queries RAG retriever with preservation of source metadata."""
        return self.rag.retrieve(query=query, medication_filter=medication_filter, top_k=top_k)

    def simulate_document_ingestion(self, filename: str, content_text: str, medication_name: str) -> Dict[str, Any]:
        """Simulates ingestion and indexing of a new document."""
        new_doc_id = f"doc_{medication_name.lower()}_{len(self.documents_inventory) + 1}"
        new_doc = {
            "document_id": new_doc_id,
            "filename": filename,
            "title": f"{medication_name.capitalize()} Prescribing Information",
            "file_type": "PDF",
            "source": "Clinical Upload",
            "medications": [medication_name.capitalize()],
            "topics": ["Medication Adherence", "Clinical Guidelines"],
            "symptoms_discussed": ["General monitoring"],
            "dementia_relevance": "Direct Support",
            "adherence_rules": "Standard daily administration",
            "caregiver_guidance": "Routine assistance",
            "emergency_safety": "Emergency escalation",
            "rag_eligible": True,
            "pages_covered": [1, 2],
            "sections_covered": ["General Administration"],
            "chunks_count": 1,
            "sample_excerpt": content_text[:160] + "..."
        }
        self.documents_inventory.append(new_doc)
        return {
            "success": True,
            "message": f"Successfully parsed and indexed '{filename}'.",
            "document": new_doc
        }
