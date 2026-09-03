"""
ChromaDB API endpoints for DeMentor.
Provides collection statistics and vector similarity search across all stored website data.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ai.chroma_store import get_chroma_client, query_chroma, initialize_and_seed_chromadb

router = APIRouter(prefix="/chroma", tags=["ChromaDB"])


@router.get("/status")
def get_chroma_status():
    """Returns the status and counts of all ChromaDB collections."""
    try:
        client = get_chroma_client()
        collections = client.list_collections()
        stats = []
        for col in collections:
            stats.append({
                "name": col.name,
                "count": col.count(),
                "metadata": col.metadata
            })
        return {
            "status": "ONLINE",
            "database": "ChromaDB (Vector Store)",
            "total_collections": len(stats),
            "collections": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reseed")
def reseed_chroma():
    """Reseeds or updates all website data into ChromaDB collections."""
    try:
        result = initialize_and_seed_chromadb()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
def search_chroma(
    collection: str = Query(default="clinical_monographs", description="Target collection name"),
    query: str = Query(..., description="Semantic query text"),
    n_results: int = Query(default=3, ge=1, le=10, description="Number of results to return")
):
    """Semantic vector search across ChromaDB data."""
    try:
        results = query_chroma(collection_name=collection, query_text=query, n_results=n_results)
        return {
            "query": query,
            "collection": collection,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
