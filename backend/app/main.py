"""
FastAPI Application Entry Point.
Patient Medication Adherence Coach — Evidence-Grounded, Accessible AI Companion.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.chat import router as chat_router
from backend.app.api.adherence import router as adherence_router
from backend.app.api.profile import router as profile_router
from backend.app.api.escalation import router as escalation_router
from backend.app.api.monographs import router as monographs_router
from backend.app.api.auth import router as auth_router
from backend.app.api.intake import router as intake_router
from backend.app.api.documents import router as documents_router
from backend.app.api.agent import router as agent_router
from backend.app.api.chroma import router as chroma_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Accessible, dementia-friendly medication adherence coaching companion grounded in clinical monographs."
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(intake_router, prefix=settings.API_PREFIX)
app.include_router(agent_router, prefix=settings.API_PREFIX)
app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(adherence_router, prefix=settings.API_PREFIX)
app.include_router(profile_router, prefix=settings.API_PREFIX)
app.include_router(escalation_router, prefix=settings.API_PREFIX)
app.include_router(monographs_router, prefix=settings.API_PREFIX)
app.include_router(chroma_router, prefix=settings.API_PREFIX)

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "monographs_loaded": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
