from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv
import re
from transformers import pipeline

load_dotenv()

app = FastAPI(title="Punctuation Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PunctuationRequest(BaseModel):
    text: str
    language: Optional[str] = "en"

class PunctuationResponse(BaseModel):
    text: str
    confidence: float

# Load punctuation model
try:
    punct_model = pipeline("token-classification", model="oliverguhr/fullstop-punctuation-multilingual")
except Exception as e:
    print(f"Warning: Could not load punctuation model: {e}")
    punct_model = None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "punct-worker"}

@app.post("/punctuate", response_model=PunctuationResponse)
async def punctuate_text(request: PunctuationRequest):
    try:
        if punct_model is None:
            # Fallback to rule-based punctuation
            return PunctuationResponse(
                text=apply_rule_based_punctuation(request.text),
                confidence=0.7
            )
        
        # Use ML model for punctuation
        result = punct_model(request.text)
        
        # Process model output
        punctuated_text = process_model_output(request.text, result)
        
        return PunctuationResponse(
            text=punctuated_text,
            confidence=0.9
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_rule_based_punctuation(text: str) -> str:
    """Apply rule-based punctuation as fallback"""
    # Basic sentence ending detection
    sentences = re.split(r'(?<=[.!?])\s+', text)
    punctuated_sentences = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # Add period if no punctuation at end
        if not sentence[-1] in '.!?':
            sentence += '.'
        
        # Capitalize first letter
        if sentence and sentence[0].isalpha():
            sentence = sentence[0].upper() + sentence[1:]
        
        punctuated_sentences.append(sentence)
    
    return ' '.join(punctuated_sentences)

def process_model_output(original_text: str, model_output: List[dict]) -> str:
    """Process model output to add punctuation"""
    # This is a simplified implementation
    # In practice, you'd need to handle the specific model output format
    return original_text + "."

@app.post("/clean")
async def clean_text(request: PunctuationRequest):
    """Clean text by removing filler words and normalizing"""
    try:
        cleaned_text = clean_transcript(request.text)
        return {"text": cleaned_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def clean_transcript(text: str) -> str:
    """Clean transcript by removing filler words and normalizing"""
    # Remove common filler words
    filler_words = [
        'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically',
        'actually', 'literally', 'sort of', 'kind of'
    ]
    
    cleaned = text.lower()
    for filler in filler_words:
        cleaned = re.sub(r'\b' + re.escape(filler) + r'\b', '', cleaned)
    
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Capitalize first letter
    if cleaned and cleaned[0].isalpha():
        cleaned = cleaned[0].upper() + cleaned[1:]
    
    return cleaned

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
