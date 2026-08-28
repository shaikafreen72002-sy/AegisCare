"""
Documents Discovery & Knowledge Base Admin API.
Endpoints for viewing indexed documents, topics, metadata, and triggering ingestion.
"""

import sys
import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from ai.knowledge_agent import DocumentKnowledgeAgent

router = APIRouter(prefix="/documents", tags=["documents"])
knowledge_agent = DocumentKnowledgeAgent()

class DocumentUploadRequest(BaseModel):
    filename: str
    medication_name: str
    content: str

@router.get("")
async def list_documents():
    """Returns full catalog of verified clinical documents and RAG eligibility."""
    inventory = knowledge_agent.get_inventory()
    return {
        "total_documents": len(inventory),
        "documents": inventory
    }

@router.get("/{document_id}")
async def get_document(document_id: str):
    """Returns details and chunks for a specific document."""
    doc = knowledge_agent.get_document_details(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/index")
async def reindex_documents():
    """Rebuilds the RAG knowledge index from document manifests."""
    knowledge_agent._build_inventory()
    return {
        "success": True,
        "indexed_count": len(knowledge_agent.get_inventory()),
        "message": "Knowledge Base successfully synchronized and verified."
    }

@router.post("/upload")
async def upload_document(payload: DocumentUploadRequest):
    """Simulates uploading and indexing a new clinical guideline."""
    res = knowledge_agent.simulate_document_ingestion(
        filename=payload.filename,
        content_text=payload.content,
        medication_name=payload.medication_name
    )
    return res
