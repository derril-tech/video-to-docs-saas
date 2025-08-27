from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import json
import subprocess

load_dotenv()

app = FastAPI(title="Probe Worker", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProbeRequest(BaseModel):
    file_path: str

class ProbeResponse(BaseModel):
    duration: float
    sample_rate: int
    channels: int
    format: str
    bit_rate: Optional[int] = None
    valid: bool

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "probe-worker"}

@app.post("/probe", response_model=ProbeResponse)
async def probe_audio(request: ProbeRequest):
    try:
        probe_info = probe_audio_file(request.file_path)
        
        return ProbeResponse(
            duration=probe_info["duration"],
            sample_rate=probe_info["sample_rate"],
            channels=probe_info["channels"],
            format=probe_info["format"],
            bit_rate=probe_info.get("bit_rate"),
            valid=probe_info["valid"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def probe_audio_file(file_path: str) -> Dict[str, Any]:
    """Probe audio file using ffprobe"""
    try:
        # Use ffprobe to get audio information
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return {
                "duration": 0.0,
                "sample_rate": 0,
                "channels": 0,
                "format": "unknown",
                "valid": False
            }
        
        probe_data = json.loads(result.stdout)
        
        # Extract audio stream info
        audio_stream = None
        for stream in probe_data.get("streams", []):
            if stream.get("codec_type") == "audio":
                audio_stream = stream
                break
        
        if not audio_stream:
            return {
                "duration": 0.0,
                "sample_rate": 0,
                "channels": 0,
                "format": "unknown",
                "valid": False
            }
        
        format_info = probe_data.get("format", {})
        
        return {
            "duration": float(format_info.get("duration", 0)),
            "sample_rate": int(audio_stream.get("sample_rate", 0)),
            "channels": int(audio_stream.get("channels", 0)),
            "format": audio_stream.get("codec_name", "unknown"),
            "bit_rate": int(format_info.get("bit_rate", 0)) if format_info.get("bit_rate") else None,
            "valid": True
        }
        
    except Exception as e:
        return {
            "duration": 0.0,
            "sample_rate": 0,
            "channels": 0,
            "format": "unknown",
            "valid": False
        }

@app.post("/validate")
async def validate_audio(request: ProbeRequest):
    """Validate audio file for processing"""
    try:
        probe_info = probe_audio_file(request.file_path)
        
        # Validation rules
        max_duration = 3600  # 1 hour
        min_duration = 1  # 1 second
        supported_formats = ["wav", "mp3", "m4a", "flac", "ogg"]
        
        validation_result = {
            "valid": probe_info["valid"],
            "errors": [],
            "warnings": []
        }
        
        if not probe_info["valid"]:
            validation_result["errors"].append("Invalid audio file")
        
        if probe_info["duration"] > max_duration:
            validation_result["errors"].append(f"Audio too long: {probe_info['duration']}s > {max_duration}s")
        
        if probe_info["duration"] < min_duration:
            validation_result["errors"].append(f"Audio too short: {probe_info['duration']}s < {min_duration}s")
        
        if probe_info["format"] not in supported_formats:
            validation_result["warnings"].append(f"Unsupported format: {probe_info['format']}")
        
        if probe_info["sample_rate"] < 8000:
            validation_result["warnings"].append(f"Low sample rate: {probe_info['sample_rate']}Hz")
        
        validation_result["valid"] = len(validation_result["errors"]) == 0
        
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8009))
    uvicorn.run(app, host="0.0.0.0", port=port)
