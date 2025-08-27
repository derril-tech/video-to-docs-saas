from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json
import re
from better_profanity import profanity

load_dotenv()

app = FastAPI(title="Moderation Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModerationRequest(BaseModel):
    text: str
    check_profanity: bool = True
    check_pii: bool = True

class ModerationResponse(BaseModel):
    clean_text: str
    has_profanity: bool
    has_pii: bool
    profanity_count: int
    pii_count: int
    masked_words: List[str]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "moderation-worker"}

@app.post("/moderate", response_model=ModerationResponse)
async def moderate_text(request: ModerationRequest):
    try:
        clean_text, profanity_count, pii_count, masked_words = moderate_content(
            request.text, 
            request.check_profanity, 
            request.check_pii
        )
        
        return ModerationResponse(
            clean_text=clean_text,
            has_profanity=profanity_count > 0,
            has_pii=pii_count > 0,
            profanity_count=profanity_count,
            pii_count=pii_count,
            masked_words=masked_words
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def moderate_content(text: str, check_profanity: bool, check_pii: bool) -> tuple[str, int, int, List[str]]:
    """Moderate content for profanity and PII"""
    clean_text = text
    profanity_count = 0
    pii_count = 0
    masked_words = []
    
    if check_profanity:
        clean_text, profanity_count, profanity_words = mask_profanity(clean_text)
        masked_words.extend(profanity_words)
    
    if check_pii:
        clean_text, pii_count, pii_words = mask_pii(clean_text)
        masked_words.extend(pii_words)
    
    return clean_text, profanity_count, pii_count, masked_words

def mask_profanity(text: str) -> tuple[str, int, List[str]]:
    """Mask profanity in text"""
    profanity_words = []
    
    # Get profane words
    profane_words = profanity.censor(text)
    
    # Count profane words
    profanity_count = len(profanity.censor(text).split('*')) - 1
    
    # Extract profane words for reporting
    words = text.split()
    for word in words:
        if profanity.contains_profanity(word):
            profanity_words.append(word)
    
    return profane_words, profanity_count, profanity_words

def mask_pii(text: str) -> tuple[str, int, List[str]]:
    """Mask PII in text"""
    pii_words = []
    pii_count = 0
    
    # Email patterns
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    for email in emails:
        text = text.replace(email, '[EMAIL]')
        pii_words.append(email)
        pii_count += 1
    
    # Phone number patterns
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    phones = re.findall(phone_pattern, text)
    for phone in phones:
        text = text.replace(phone, '[PHONE]')
        pii_words.append(phone)
        pii_count += 1
    
    # Credit card patterns (simplified)
    cc_pattern = r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'
    ccs = re.findall(cc_pattern, text)
    for cc in ccs:
        text = text.replace(cc, '[CREDIT_CARD]')
        pii_words.append(cc)
        pii_count += 1
    
    # SSN patterns
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'
    ssns = re.findall(ssn_pattern, text)
    for ssn in ssns:
        text = text.replace(ssn, '[SSN]')
        pii_words.append(ssn)
        pii_count += 1
    
    return text, pii_count, pii_words

@app.post("/check")
async def check_content(request: ModerationRequest):
    """Check content without modifying it"""
    try:
        clean_text, profanity_count, pii_count, masked_words = moderate_content(
            request.text, 
            request.check_profanity, 
            request.check_pii
        )
        
        return {
            "original_text": request.text,
            "has_profanity": profanity_count > 0,
            "has_pii": pii_count > 0,
            "profanity_count": profanity_count,
            "pii_count": pii_count,
            "flagged_words": masked_words,
            "requires_moderation": profanity_count > 0 or pii_count > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8010))
    uvicorn.run(app, host="0.0.0.0", port=port)
