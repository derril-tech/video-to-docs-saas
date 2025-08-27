from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import re
import dateparser
from datetime import datetime

load_dotenv()

app = FastAPI(title="NER Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NERRequest(BaseModel):
    text: str
    entity_types: Optional[List[str]] = None

class Entity(BaseModel):
    type: str
    value: str
    start_position: int
    end_position: int
    confidence: float
    metadata: Optional[Dict[str, Any]] = {}

class NERResponse(BaseModel):
    entities: List[Entity]
    confidence: float

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ner-worker"}

@app.post("/extract", response_model=NERResponse)
async def extract_entities(request: NERRequest):
    try:
        entities = extract_entities_from_text(request.text, request.entity_types)
        
        return NERResponse(
            entities=entities,
            confidence=0.85
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_entities_from_text(text: str, entity_types: Optional[List[str]] = None) -> List[Entity]:
    """Extract named entities from text"""
    entities = []
    
    if entity_types is None:
        entity_types = ["person", "organization", "date", "amount", "url", "email"]
    
    # Extract people (simple pattern matching)
    if "person" in entity_types:
        person_patterns = [
            r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # First Last
            r'\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b',  # First M. Last
        ]
        for pattern in person_patterns:
            for match in re.finditer(pattern, text):
                entities.append(Entity(
                    type="person",
                    value=match.group(),
                    start_position=match.start(),
                    end_position=match.end(),
                    confidence=0.8,
                    metadata={"pattern": pattern}
                ))
    
    # Extract organizations
    if "organization" in entity_types:
        org_patterns = [
            r'\b[A-Z][a-z]+ (?:Inc|Corp|LLC|Ltd|Company|Co)\b',
            r'\b[A-Z][a-z]+ [A-Z][a-z]+ (?:Technologies|Systems|Solutions)\b',
        ]
        for pattern in org_patterns:
            for match in re.finditer(pattern, text):
                entities.append(Entity(
                    type="organization",
                    value=match.group(),
                    start_position=match.start(),
                    end_position=match.end(),
                    confidence=0.7,
                    metadata={"pattern": pattern}
                ))
    
    # Extract dates
    if "date" in entity_types:
        date_patterns = [
            r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # MM/DD/YYYY
            r'\b\d{4}-\d{2}-\d{2}\b',  # YYYY-MM-DD
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b',
            r'\b(?:next|last|this)\s+(?:week|month|year|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b',
        ]
        for pattern in date_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                try:
                    parsed_date = dateparser.parse(match.group())
                    if parsed_date:
                        entities.append(Entity(
                            type="date",
                            value=match.group(),
                            start_position=match.start(),
                            end_position=match.end(),
                            confidence=0.9,
                            metadata={"parsed_date": parsed_date.isoformat()}
                        ))
                except:
                    pass
    
    # Extract amounts/money
    if "amount" in entity_types:
        amount_patterns = [
            r'\$\d+(?:,\d{3})*(?:\.\d{2})?\b',  # $1,234.56
            r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars|USD)\b',  # 1,234.56 dollars
            r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:percent|%)\b',  # 15.5%
        ]
        for pattern in amount_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append(Entity(
                    type="amount",
                    value=match.group(),
                    start_position=match.start(),
                    end_position=match.end(),
                    confidence=0.9,
                    metadata={"pattern": pattern}
                ))
    
    # Extract URLs
    if "url" in entity_types:
        url_pattern = r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?'
        for match in re.finditer(url_pattern, text):
            entities.append(Entity(
                type="url",
                value=match.group(),
                start_position=match.start(),
                end_position=match.end(),
                confidence=0.95,
                metadata={"pattern": "url"}
            ))
    
    # Extract emails
    if "email" in entity_types:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        for match in re.finditer(email_pattern, text):
            entities.append(Entity(
                type="email",
                value=match.group(),
                start_position=match.start(),
                end_position=match.end(),
                confidence=0.95,
                metadata={"pattern": "email"}
            ))
    
    return entities

@app.post("/validate")
async def validate_entities(request: NERRequest):
    """Validate extracted entities"""
    try:
        entities = extract_entities_from_text(request.text, request.entity_types)
        validated_entities = []
        
        for entity in entities:
            # Add validation logic here
            is_valid = validate_entity(entity)
            entity.metadata["valid"] = is_valid
            validated_entities.append(entity)
        
        return {
            "entities": validated_entities,
            "validation_summary": {
                "total": len(validated_entities),
                "valid": len([e for e in validated_entities if e.metadata.get("valid", False)]),
                "invalid": len([e for e in validated_entities if not e.metadata.get("valid", False)])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def validate_entity(entity: Entity) -> bool:
    """Validate a single entity"""
    if entity.type == "email":
        # Basic email validation
        return re.match(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$', entity.value) is not None
    
    elif entity.type == "url":
        # Basic URL validation
        return entity.value.startswith(('http://', 'https://'))
    
    elif entity.type == "date":
        # Date validation
        try:
            parsed = dateparser.parse(entity.value)
            return parsed is not None
        except:
            return False
    
    elif entity.type == "amount":
        # Amount validation
        return re.match(r'^[\$]?\d+(?:,\d{3})*(?:\.\d{2})?$', entity.value.replace(' ', '')) is not None
    
    # Default to valid for other types
    return True

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
