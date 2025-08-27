from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
from dotenv import load_dotenv
import asyncio
import aiofiles
import tempfile
import whisperx
import torch

load_dotenv()

app = FastAPI(title="ASR Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptionRequest(BaseModel):
    audio_url: str
    language: Optional[str] = "en"
    model_size: Optional[str] = "base"

class TranscriptionResponse(BaseModel):
    text: str
    segments: List[dict]
    language: str
    duration: float

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "asr-worker"}

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    try:
        # Download audio file
        audio_path = await download_audio(request.audio_url)
        
        # Load model
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisperx.load_model(request.model_size, device)
        
        # Transcribe
        result = model.transcribe(audio_path)
        
        # Align timestamps
        model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio_path, device)
        
        # Clean up
        os.remove(audio_path)
        
        return TranscriptionResponse(
            text=result["text"],
            segments=result["segments"],
            language=result["language"],
            duration=metadata["duration"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe-file")
async def transcribe_file(
    file: UploadFile = File(...),
    language: Optional[str] = "en",
    model_size: Optional[str] = "base"
):
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            audio_path = tmp_file.name
        
        # Load model
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisperx.load_model(model_size, device)
        
        # Transcribe
        result = model.transcribe(audio_path)
        
        # Align timestamps
        model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio_path, device)
        
        # Clean up
        os.remove(audio_path)
        
        return {
            "text": result["text"],
            "segments": result["segments"],
            "language": result["language"],
            "duration": metadata["duration"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def download_audio(url: str) -> str:
    """Download audio file from URL to temporary file"""
    import httpx
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(response.content)
            return tmp_file.name

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
