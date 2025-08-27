from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import re
import json

load_dotenv()

app = FastAPI(title="Command Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = {}

class CommandResponse(BaseModel):
    commands: List[Dict[str, Any]]
    confidence: float

class VoiceCommand:
    def __init__(self, command_type: str, parameters: Dict[str, Any], confidence: float):
        self.type = command_type
        self.parameters = parameters
        self.confidence = confidence

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cmd-worker"}

@app.post("/parse", response_model=CommandResponse)
async def parse_commands(request: CommandRequest):
    try:
        commands = parse_voice_commands(request.text)
        
        return CommandResponse(
            commands=[{
                "type": cmd.type,
                "parameters": cmd.parameters,
                "confidence": cmd.confidence
            } for cmd in commands],
            confidence=0.8
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def parse_voice_commands(text: str) -> List[VoiceCommand]:
    """Parse voice commands from text"""
    commands = []
    text_lower = text.lower()
    
    # Structure commands
    if "new heading" in text_lower or "new section" in text_lower:
        # Extract heading text
        heading_match = re.search(r'(?:new heading|new section)(?:\s+called)?\s+(.+)', text_lower)
        if heading_match:
            heading_text = heading_match.group(1).strip()
            commands.append(VoiceCommand(
                "create_heading",
                {"text": heading_text, "level": 1},
                0.9
            ))
    
    if "start list" in text_lower:
        commands.append(VoiceCommand(
            "start_list",
            {"type": "bullet"},
            0.9
        ))
    
    if "next item" in text_lower:
        commands.append(VoiceCommand(
            "add_list_item",
            {"text": ""},
            0.9
        ))
    
    if "insert table" in text_lower:
        # Extract table dimensions
        table_match = re.search(r'insert table (\d+)\s+by\s+(\d+)', text_lower)
        if table_match:
            rows = int(table_match.group(1))
            cols = int(table_match.group(2))
            commands.append(VoiceCommand(
                "create_table",
                {"rows": rows, "columns": cols},
                0.9
            ))
    
    # Formatting commands
    if "bold that" in text_lower:
        commands.append(VoiceCommand(
            "format_text",
            {"format": "bold"},
            0.9
        ))
    
    if "make this a quote" in text_lower:
        commands.append(VoiceCommand(
            "format_text",
            {"format": "quote"},
            0.9
        ))
    
    # Smart field commands
    if "set due date" in text_lower:
        date_match = re.search(r'set due date (.+)', text_lower)
        if date_match:
            date_text = date_match.group(1).strip()
            commands.append(VoiceCommand(
                "set_smart_field",
                {"field": "due_date", "value": date_text},
                0.8
            ))
    
    if "owner is" in text_lower:
        owner_match = re.search(r'owner is (.+)', text_lower)
        if owner_match:
            owner_name = owner_match.group(1).strip()
            commands.append(VoiceCommand(
                "set_smart_field",
                {"field": "owner", "value": owner_name},
                0.8
            ))
    
    # Template commands
    if "use" in text_lower and "template" in text_lower:
        template_match = re.search(r'use (.+?) template', text_lower)
        if template_match:
            template_name = template_match.group(1).strip()
            commands.append(VoiceCommand(
                "apply_template",
                {"template": template_name},
                0.8
            ))
    
    return commands

@app.post("/structure")
async def structure_document(request: CommandRequest):
    """Apply structure commands to document"""
    try:
        commands = parse_voice_commands(request.text)
        structured_content = apply_structure_commands(commands, request.context)
        
        return {
            "content": structured_content,
            "commands_applied": len(commands)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_structure_commands(commands: List[VoiceCommand], context: Dict[str, Any]) -> Dict[str, Any]:
    """Apply structure commands to create document structure"""
    content = {
        "sections": [],
        "tables": [],
        "lists": [],
        "smart_fields": {}
    }
    
    for cmd in commands:
        if cmd.type == "create_heading":
            content["sections"].append({
                "type": "heading",
                "level": cmd.parameters["level"],
                "text": cmd.parameters["text"],
                "id": f"heading_{len(content['sections'])}"
            })
        
        elif cmd.type == "create_table":
            content["tables"].append({
                "rows": cmd.parameters["rows"],
                "columns": cmd.parameters["columns"],
                "headers": [f"Column {i+1}" for i in range(cmd.parameters["columns"])],
                "data": []
            })
        
        elif cmd.type == "set_smart_field":
            content["smart_fields"][cmd.parameters["field"]] = cmd.parameters["value"]
    
    return content

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
