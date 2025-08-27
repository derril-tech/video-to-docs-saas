from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json
from jinja2 import Template

load_dotenv()

app = FastAPI(title="Template Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TemplateRequest(BaseModel):
    template_content: str
    slot_values: Dict[str, Any]

class TemplateResponse(BaseModel):
    filled_content: str
    missing_slots: List[str]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "template-worker"}

@app.post("/fill", response_model=TemplateResponse)
async def fill_template(request: TemplateRequest):
    try:
        filled_content, missing_slots = fill_template_slots(request.template_content, request.slot_values)
        
        return TemplateResponse(
            filled_content=filled_content,
            missing_slots=missing_slots
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def fill_template_slots(template_content: str, slot_values: Dict[str, Any]) -> tuple[str, List[str]]:
    """Fill template slots with values"""
    try:
        template = Template(template_content)
        filled_content = template.render(**slot_values)
        
        # Find missing slots
        missing_slots = []
        for slot in extract_slots(template_content):
            if slot not in slot_values:
                missing_slots.append(slot)
        
        return filled_content, missing_slots
        
    except Exception as e:
        raise Exception(f"Template rendering failed: {str(e)}")

def extract_slots(template_content: str) -> List[str]:
    """Extract slot names from template"""
    import re
    slot_pattern = r'\{\{\s*(\w+)\s*\}\}'
    slots = re.findall(slot_pattern, template_content)
    return list(set(slots))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8006))
    uvicorn.run(app, host="0.0.0.0", port=port)
