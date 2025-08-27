'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Group, Text, Paper } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';

interface RecorderProps {
  onAudioData?: (audioBlob: Blob) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  isRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
}

export function Recorder({ 
  onAudioData, 
  onTranscriptUpdate, 
  isRecording = false, 
  onRecordingChange 
}: RecorderProps) {
  const [isRecordingLocal, setIsRecordingLocal] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const recording = isRecording || isRecordingLocal;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        if (onAudioData) {
          onAudioData(audioBlob);
        }
        
        // Simulate transcript update
        setTimeout(() => {
          const mockTranscript = "This is a simulated transcript from the audio recording...";
          setTranscript(mockTranscript);
          if (onTranscriptUpdate) {
            onTranscriptUpdate(mockTranscript);
          }
        }, 1000);
      };
      
      mediaRecorder.start();
      setIsRecordingLocal(true);
      if (onRecordingChange) {
        onRecordingChange(true);
      }
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecordingLocal(false);
    if (onRecordingChange) {
      onRecordingChange(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          Voice Recorder
        </Text>
        <Group>
          {!recording ? (
            <Button
              leftSection={<IconMicrophone size={16} />}
              onClick={startRecording}
              color="blue"
            >
              Start Recording
            </Button>
          ) : (
            <Button
              leftSection={<IconMicrophoneOff size={16} />}
              onClick={stopRecording}
              color="red"
            >
              Stop Recording
            </Button>
          )}
        </Group>
      </Group>
      
      {recording && (
        <Paper p="sm" bg="red.0" withBorder>
          <Text size="sm" c="red" ta="center">
            Recording in progress...
          </Text>
        </Paper>
      )}
      
      {audioURL && (
        <Group mt="md">
          <audio controls src={audioURL} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioURL(null)}
          >
            Clear
          </Button>
        </Group>
      )}
      
      {transcript && (
        <Paper p="sm" mt="md" withBorder>
          <Text size="sm" fw={500} mb="xs">
            Transcript:
          </Text>
          <Text size="sm" c="dimmed">
            {transcript}
          </Text>
        </Paper>
      )}
    </Paper>
  );
}
