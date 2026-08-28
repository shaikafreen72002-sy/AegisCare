"""
Evidence-Grounded RAG Retrieval Engine for Patient Medication Adherence.
Grounded strictly in official Product Monographs and BPSD Clinical Guidelines.
"""

import json
import os
import re
import math
from typing import List, Dict, Any, Optional

MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "manifests", "document_manifest.json")

class RAGEngine:
    def __init__(self, manifest_path: Optional[str] = None):
        self.manifest_path = manifest_path or MANIFEST_PATH
        self.chunks: List[Dict[str, Any]] = []
        self._load_manifest()

    def _load_manifest(self):
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.chunks = data.get("monographs", [])
            except Exception as e:
                print(f"Error loading manifest from {self.manifest_path}: {e}")
                self.chunks = []
        if not self.chunks:
            self.chunks = self._get_default_chunks()

    def _get_default_chunks(self) -> List[Dict[str, Any]]:
        return [
            {
                "chunk_id": "don_01_indication",
                "medication": "donepezil",
                "brand_name": "Aricept",
                "source_type": "product_monograph",
                "document": "Donepezil Hydrochloride Product Monograph",
                "section": "indications_and_clinical_use",
                "page_number": 3,
                "content": "Donepezil hydrochloride is indicated for the symptomatic treatment of mild, moderate, and severe dementia of the Alzheimer's type. It is a reversible, non-competitive inhibitor of acetylcholinesterase, thereby increasing acetylcholine concentrations in cerebral synapses to support cognitive and functional performance."
            },
            {
                "chunk_id": "don_02_dosing",
                "medication": "donepezil",
                "brand_name": "Aricept",
                "source_type": "product_monograph",
                "document": "Donepezil Hydrochloride Product Monograph",
                "section": "dosage_and_administration",
                "page_number": 12,
                "content": "Donepezil is taken orally once daily in the evening, just prior to retiring. Initial dosage is 5 mg once daily. After 4 to 6 weeks of clinical assessment at 5 mg/day, the dose may be increased to 10 mg once daily if clinically indicated. Maximum recommended daily dose is 10 mg/day."
            },
            {
                "chunk_id": "don_03_food",
                "medication": "donepezil",
                "brand_name": "Aricept",
                "source_type": "product_monograph",
                "document": "Donepezil Hydrochloride Product Monograph",
                "section": "administration_with_food",
                "page_number": 13,
                "content": "Donepezil can be taken with or without food. Food does not significantly alter the rate or extent of absorption. If mild nausea occurs, taking the dose with an evening snack or milk may help soothe stomach sensitivity."
            },
            {
                "chunk_id": "don_04_missed_dose",
                "medication": "donepezil",
                "brand_name": "Aricept",
                "source_type": "product_monograph",
                "document": "Donepezil Hydrochloride Product Monograph",
                "section": "missed_dose",
                "page_number": 49,
                "content": "If a dose of Donepezil is missed, do NOT take an extra dose or double the next dose. Skip the missed dose and resume your regular dosing schedule the next evening at the normal time. If missed for 7 consecutive days or more, consult your physician before restarting."
            },
            {
                "chunk_id": "don_05_adverse_effects",
                "medication": "donepezil",
                "brand_name": "Aricept",
                "source_type": "product_monograph",
                "document": "Donepezil Hydrochloride Product Monograph",
                "section": "adverse_reactions",
                "page_number": 18,
                "content": "Common adverse reactions are mild and transient: nausea, diarrhea, insomnia, fatigue, muscle cramps. Bradycardia (slow heart rate) or syncope (fainting) require immediate emergency contact."
            },
            {
                "chunk_id": "riv_01_indication_dosing",
                "medication": "rivastigmine",
                "brand_name": "Exelon",
                "source_type": "product_monograph",
                "document": "Rivastigmine Tartrate Product Monograph",
                "section": "dosage_and_administration",
                "page_number": 5,
                "content": "Rivastigmine is a pseudo-irreversible inhibitor of acetylcholinesterase and butyrylcholinesterase indicated for mild to moderate dementia of the Alzheimer's type and Parkinson's disease dementia. Oral capsules are administered twice daily with meals (morning breakfast and evening dinner)."
            },
            {
                "chunk_id": "riv_02_food",
                "medication": "rivastigmine",
                "brand_name": "Exelon",
                "source_type": "product_monograph",
                "document": "Rivastigmine Tartrate Product Monograph",
                "section": "administration_with_food",
                "page_number": 8,
                "content": "Rivastigmine oral capsules MUST be taken with food (during breakfast and evening meal) to significantly reduce potential gastrointestinal adverse effects such as nausea, vomiting, and abdominal discomfort."
            },
            {
                "chunk_id": "riv_03_missed_dose",
                "medication": "rivastigmine",
                "brand_name": "Exelon",
                "source_type": "product_monograph",
                "document": "Rivastigmine Tartrate Product Monograph",
                "section": "missed_dose",
                "page_number": 32,
                "content": "If you miss a dose of oral Rivastigmine, take the next dose at the usual scheduled time with your next meal. Never take a double dose to compensate. If interrupted for more than 3 consecutive days, contact your prescribing physician."
            },
            {
                "chunk_id": "gal_01_indication_dosing",
                "medication": "galantamine",
                "brand_name": "Razadyne / Reminyl",
                "source_type": "product_monograph",
                "document": "Galantamine Hydrobromide Extended-Release Product Monograph",
                "section": "dosage_and_administration",
                "page_number": 4,
                "content": "Galantamine is a selective, competitive cholinesterase inhibitor and allosteric nicotinic receptor modulator indicated for mild to moderate dementia of the Alzheimer's type. Extended-Release (ER) capsules are taken once daily in the morning, preferably with breakfast."
            },
            {
                "chunk_id": "gal_02_food_fluids",
                "medication": "galantamine",
                "brand_name": "Razadyne / Reminyl",
                "source_type": "product_monograph",
                "document": "Galantamine Hydrobromide Extended-Release Product Monograph",
                "section": "administration_with_food",
                "page_number": 7,
                "content": "Galantamine should be administered with food, preferably with the morning meal. Taking it with breakfast substantially mitigates gastrointestinal side effects. Patients must swallow capsules whole with plenty of water."
            },
            {
                "chunk_id": "mem_01_indication_dosing",
                "medication": "memantine",
                "brand_name": "Namenda / Ebixa",
                "source_type": "product_monograph",
                "document": "Memantine Hydrochloride Product Monograph",
                "section": "dosage_and_administration",
                "page_number": 6,
                "content": "Memantine hydrochloride is a voltage-dependent, moderate-affinity uncompetitive NMDA receptor antagonist indicated for moderate to severe Alzheimer's disease. Target maintenance dose is 20 mg daily. Can be administered with or without food."
            }
        ]

    def _tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with', 'i', 'my', 'me', 'you', 'your'
        }
        tokens = [t for t in cleaned.split() if len(t) > 2 and t not in stopwords]
        return tokens

    def retrieve(
        self,
        query: str,
        medication_filter: Optional[str] = None,
        top_k: int = 3,
        min_score: float = 0.02
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant monograph chunks constrained strictly by medication filter & semantic terms.
        """
        query_lower = query.lower()
        query_tokens = set(self._tokenize(query))

        # Check if query explicitly mentions another supported drug
        for drug in ["donepezil", "aricept", "rivastigmine", "exelon", "galantamine", "razadyne", "reminyl", "memantine", "namenda", "ebixa"]:
            if drug in query_lower:
                if drug in ["aricept", "donepezil"]:
                    medication_filter = "donepezil"
                elif drug in ["exelon", "rivastigmine"]:
                    medication_filter = "rivastigmine"
                elif drug in ["razadyne", "reminyl", "galantamine"]:
                    medication_filter = "galantamine"
                elif drug in ["namenda", "ebixa", "memantine"]:
                    medication_filter = "memantine"
                break

        normalized_med = (medication_filter or "donepezil").strip().lower()
        results = []

        is_missed_query = any(w in query_lower for w in ["miss", "forgot", "skip", "late", "double", "two pills", "yesterday"])
        is_food_query = any(w in query_lower for w in ["food", "eat", "meal", "breakfast", "dinner", "empty stomach", "milk", "tea", "snack"])
        is_side_effect_query = any(w in query_lower for w in ["side effect", "sick", "nausea", "dizzy", "headache", "unwell", "reaction", "vomit", "cramp"])
        is_info_query = any(w in query_lower for w in ["know", "about", "what is", "tell me", "explain", "how does", "work", "use", "indicated", "action", "purpose", "why"]) and not is_missed_query and not is_food_query and not is_side_effect_query

        for chunk in self.chunks:
            chunk_med = chunk.get("medication", "").lower()

            if normalized_med and normalized_med != "all" and normalized_med != "other":
                if chunk_med != normalized_med and chunk_med != "general_bpsd":
                    continue

            chunk_text = f"{chunk.get('section', '')} {chunk.get('content', '')} {chunk.get('brand_name', '')} {chunk_med}".lower()
            chunk_tokens = self._tokenize(chunk_text)
            if not chunk_tokens:
                continue

            match_count = 0.0
            for q in query_tokens:
                if q in chunk_tokens:
                    match_count += 1.0
                elif any(q in t or t in q for t in chunk_tokens):
                    match_count += 0.5

            section = chunk.get("section", "").lower()

            # Targetted intent boosts
            if is_missed_query and "missed" in section:
                match_count += 10.0
            elif is_food_query and "food" in section:
                match_count += 10.0
            elif is_side_effect_query and "adverse" in section:
                match_count += 10.0
            elif is_info_query and ("indication" in section or "dosage" in section):
                match_count += 8.0

            denom = (math.sqrt(len(query_tokens) + 1) * math.sqrt(len(chunk_tokens) + 1))
            score = match_count / denom

            if score >= min_score or match_count >= 1.0:
                results.append({
                    "chunk_id": chunk.get("chunk_id"),
                    "document": chunk.get("document", f"{chunk_med.capitalize()} Monograph"),
                    "medication": chunk_med,
                    "brand_name": chunk.get("brand_name"),
                    "section": chunk.get("section"),
                    "page": chunk.get("page_number", 1),
                    "content": chunk.get("content"),
                    "score": round(score, 4)
                })

        # Sort by highest score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def get_all_chunks(self) -> List[Dict[str, Any]]:
        return self.chunks
