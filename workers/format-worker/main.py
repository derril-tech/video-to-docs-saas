from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="Format Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FormatRequest(BaseModel):
    content: Dict[str, Any]
    format_type: str

class FormatResponse(BaseModel):
    formatted_content: Dict[str, Any]
    success: bool

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "format-worker"}

@app.post("/format", response_model=FormatResponse)
async def format_content(request: FormatRequest):
    try:
        formatted_content = apply_formatting(request.content, request.format_type)
        
        return FormatResponse(
            formatted_content=formatted_content,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_formatting(content: Dict[str, Any], format_type: str) -> Dict[str, Any]:
    """Apply formatting to content"""
    if format_type == "document":
        return format_document(content)
    elif format_type == "table":
        return format_table(content)
    elif format_type == "list":
        return format_list(content)
    else:
        return content

def format_document(content: Dict[str, Any]) -> Dict[str, Any]:
    """Format document structure"""
    formatted = {
        "sections": [],
        "metadata": content.get("metadata", {})
    }
    
    # Process sections
    for section in content.get("sections", []):
        formatted_section = {
            "id": section.get("id", f"section_{len(formatted['sections'])}"),
            "type": section.get("type", "text"),
            "content": section.get("content", ""),
            "level": section.get("level", 1),
            "order": len(formatted["sections"])
        }
        formatted["sections"].append(formatted_section)
    
    return formatted

def format_table(content: Dict[str, Any]) -> Dict[str, Any]:
    """Format table structure"""
    return {
        "headers": content.get("headers", []),
        "rows": content.get("rows", []),
        "metadata": content.get("metadata", {})
    }

def format_list(content: Dict[str, Any]) -> Dict[str, Any]:
    """Format list structure"""
    return {
        "items": content.get("items", []),
        "type": content.get("type", "bullet"),
        "metadata": content.get("metadata", {})
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
