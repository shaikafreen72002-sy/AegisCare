"""
Monographs and Clinical Evidence Knowledge Base Explorer Endpoints.
"""

import sys
import os
from typing import Optional
from fastapi import APIRouter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from ai.rag_engine import RAGEngine

router = APIRouter(prefix="/monographs", tags=["monographs"])
rag_engine = RAGEngine()

@router.get("")
async def list_monographs(medication: Optional[str] = None, query: Optional[str] = None):
    """
    Returns clinical knowledge base chunks with optional filtering by medication or search terms.
    """
    all_chunks = rag_engine.get_all_chunks()
    
    if medication and medication.lower() != "all":
        all_chunks = [c for c in all_chunks if c.get("medication", "").lower() == medication.lower() or c.get("medication") == "general_bpsd"]
        
    if query:
        retrieved = rag_engine.retrieve(query=query, medication_filter=medication, top_k=10, min_score=0.05)
        return {
            "total": len(retrieved),
            "chunks": retrieved
        }

    return {
        "total": len(all_chunks),
        "chunks": all_chunks
    }
