'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Progress, Stack, Alert, Button, Badge } from '@mantine/core';
import { IconCheck, IconX, IconClock, IconLoader } from '@tabler/icons-react';

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface ProcessingStatusProps {
  jobId?: string;
  steps?: ProcessingStep[];
  onStatusChange?: (status: 'processing' | 'completed' | 'failed') => void;
  onRetry?: () => void;
}

export function ProcessingStatus({
  jobId,
  steps = [],
  onStatusChange,
  onRetry
}: ProcessingStatusProps) {
  const [currentSteps, setCurrentSteps] = useState<ProcessingStep[]>(steps);
  const [overallStatus, setOverallStatus] = useState<'processing' | 'completed' | 'failed'>('processing');

  // Default steps if none provided
  const defaultSteps: ProcessingStep[] = [
    { id: 'upload', name: 'Uploading video', status: 'completed', progress: 100 },
    { id: 'extract', name: 'Extracting audio', status: 'processing', progress: 45 },
    { id: 'transcribe', name: 'Transcribing audio', status: 'pending', progress: 0 },
    { id: 'analyze', name: 'Analyzing content', status: 'pending', progress: 0 },
    { id: 'generate', name: 'Generating documentation', status: 'pending', progress: 0 },
  ];

  const [localSteps, setLocalSteps] = useState<ProcessingStep[]>(
    steps.length > 0 ? steps : defaultSteps
  );

  useEffect(() => {
    // Simulate processing progress
    const interval = setInterval(() => {
      setLocalSteps(prevSteps => {
        const updatedSteps = prevSteps.map(step => {
          if (step.status === 'processing') {
            const newProgress = Math.min(step.progress + Math.random() * 5, 100);
            let newStatus = step.status;
            
            if (newProgress >= 100) {
              newStatus = 'completed';
              // Start next step
              const nextStepIndex = prevSteps.findIndex(s => s.id === step.id) + 1;
              if (nextStepIndex < prevSteps.length) {
                const nextStep = prevSteps[nextStepIndex];
                if (nextStep.status === 'pending') {
                  setTimeout(() => {
                    setLocalSteps(current => 
                      current.map(s => 
                        s.id === nextStep.id 
                          ? { ...s, status: 'processing', progress: 0 }
                          : s
                      )
                    );
                  }, 500);
                }
              }
            }
            
            return { ...step, progress: newProgress, status: newStatus };
          }
          return step;
        });

        // Check overall status
        const allCompleted = updatedSteps.every(step => step.status === 'completed');
        const anyFailed = updatedSteps.some(step => step.status === 'failed');
        
        if (allCompleted) {
          setOverallStatus('completed');
          onStatusChange?.('completed');
          clearInterval(interval);
        } else if (anyFailed) {
          setOverallStatus('failed');
          onStatusChange?.('failed');
          clearInterval(interval);
        }

        return updatedSteps;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onStatusChange]);

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <IconCheck size={16} color="green" />;
      case 'processing':
        return <IconLoader size={16} className="animate-spin" />;
      case 'failed':
        return <IconX size={16} color="red" />;
      default:
        return <IconClock size={16} color="gray" />;
    }
  };

  const getStepColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'completed':
        return <IconCheck size={20} color="green" />;
      case 'failed':
        return <IconX size={20} color="red" />;
      default:
        return <IconLoader size={20} className="animate-spin" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'blue';
    }
  };

  const overallProgress = localSteps.length > 0 
    ? localSteps.reduce((sum, step) => sum + step.progress, 0) / localSteps.length
    : 0;

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            {getOverallStatusIcon()}
            <Text size="lg" fw={500}>
              Processing Video
            </Text>
            <Badge color={getOverallStatusColor()} variant="light">
              {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </Badge>
          </Group>
          {jobId && (
            <Text size="sm" c="dimmed">
              Job ID: {jobId}
            </Text>
          )}
        </Group>

        <Progress 
          value={overallProgress} 
          size="lg" 
          color={getOverallStatusColor()}
          label={`${Math.round(overallProgress)}%`}
        />

        <Stack gap="sm">
          {localSteps.map((step) => (
            <Paper key={step.id} p="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  {getStepIcon(step.status)}
                  <Text size="sm" fw={500}>
                    {step.name}
                  </Text>
                  <Badge 
                    size="xs" 
                    color={getStepColor(step.status)} 
                    variant="light"
                  >
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {Math.round(step.progress)}%
                </Text>
              </Group>
              
              <Progress 
                value={step.progress} 
                size="sm" 
                color={getStepColor(step.status)}
              />
              
              {step.error && (
                <Text size="xs" c="red" mt="xs">
                  Error: {step.error}
                </Text>
              )}
            </Paper>
          ))}
        </Stack>

        {overallStatus === 'completed' && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Processing Complete"
            color="green"
            variant="light"
          >
            <Text size="sm">
              Your video has been successfully processed. You can now view and download the generated documentation.
            </Text>
          </Alert>
        )}

        {overallStatus === 'failed' && (
          <Alert
            icon={<IconX size={16} />}
            title="Processing Failed"
            color="red"
            variant="light"
          >
            <Text size="sm" mb="sm">
              There was an error during processing. Please try again or contact support if the issue persists.
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
            >
              Retry Processing
            </Button>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
