from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Sync Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SyncRequest(BaseModel):
    content: Dict[str, Any]
    integration_type: str  # notion, google_docs, jira, etc.
    config: Dict[str, Any]

class SyncResponse(BaseModel):
    success: bool
    external_id: Optional[str] = None
    url: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sync-worker"}

@app.post("/sync", response_model=SyncResponse)
async def sync_document(request: SyncRequest):
    try:
        result = sync_to_integration(request.content, request.integration_type, request.config)
        
        return SyncResponse(
            success=result["success"],
            external_id=result.get("external_id"),
            url=result.get("url")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def sync_to_integration(content: Dict[str, Any], integration_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Sync document to external integration"""
    if integration_type == "notion":
        return sync_to_notion(content, config)
    elif integration_type == "google_docs":
        return sync_to_google_docs(content, config)
    elif integration_type == "jira":
        return sync_to_jira(content, config)
    else:
        raise ValueError(f"Unsupported integration: {integration_type}")

def sync_to_notion(content: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Sync to Notion"""
    # Placeholder implementation
    return {
        "success": True,
        "external_id": "notion_page_123",
        "url": "https://notion.so/page/123"
    }

def sync_to_google_docs(content: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Sync to Google Docs"""
    # Placeholder implementation
    return {
        "success": True,
        "external_id": "google_doc_456",
        "url": "https://docs.google.com/document/d/456"
    }

def sync_to_jira(content: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Sync to Jira"""
    # Placeholder implementation
    return {
        "success": True,
        "external_id": "JIRA-789",
        "url": "https://company.atlassian.net/browse/JIRA-789"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8008))
    uvicorn.run(app, host="0.0.0.0", port=port)
