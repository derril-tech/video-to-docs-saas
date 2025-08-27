'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Badge } from '@mantine/core';

interface TranscriptToken {
  text: string;
  confidence: number;
  start: number;
  end: number;
}

interface LiveTranscriptProps {
  tokens?: TranscriptToken[];
  isLive?: boolean;
  onTokenClick?: (token: TranscriptToken) => void;
}

export function LiveTranscript({ 
  tokens = [], 
  isLive = false,
  onTokenClick 
}: LiveTranscriptProps) {
  const [displayTokens, setDisplayTokens] = useState<TranscriptToken[]>([]);

  useEffect(() => {
    if (tokens.length > 0) {
      setDisplayTokens(prev => [...prev, ...tokens]);
    }
  }, [tokens]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          Live Transcript
        </Text>
        {isLive && (
          <Badge color="red" variant="light">
            LIVE
          </Badge>
        )}
      </Group>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {displayTokens.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Start recording to see live transcript...
          </Text>
        ) : (
          <div>
            {displayTokens.map((token, index) => (
              <span
                key={index}
                onClick={() => onTokenClick?.(token)}
                style={{
                  cursor: onTokenClick ? 'pointer' : 'default',
                  backgroundColor: getConfidenceColor(token.confidence) === 'red' ? '#fef2f2' : 'transparent',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  margin: '1px',
                  display: 'inline-block',
                }}
                title={`Confidence: ${(token.confidence * 100).toFixed(1)}% | Time: ${formatTime(token.start)}`}
              >
                {token.text}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {displayTokens.length > 0 && (
        <Group mt="md" gap="xs">
          <Text size="xs" c="dimmed">
            Confidence:
          </Text>
          <Badge size="xs" color="green">High</Badge>
          <Badge size="xs" color="yellow">Medium</Badge>
          <Badge size="xs" color="red">Low</Badge>
        </Group>
      )}
    </Paper>
  );
}
