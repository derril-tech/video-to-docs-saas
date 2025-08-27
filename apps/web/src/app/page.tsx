'use client';

import React, { useState } from 'react';
import { Container, Title, Text, Stack, Group, Button, Alert, Paper } from '@mantine/core';
import { IconAlertCircle, IconRocket } from '@tabler/icons-react';
import { VideoUploader } from '@/components/VideoUploader/VideoUploader';
import { ProcessingStatus } from '@/components/ProcessingStatus/ProcessingStatus';
import { DocumentViewer } from '@/components/DocumentViewer/DocumentViewer';
import { SlotEditor } from '@/components/SlotEditor/SlotEditor';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export default function HomePage() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [slots, setSlots] = useState<any[]>([]);

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
    setProcessingState('uploading');
  };

  const handleUploadProgress = (progress: number) => {
    if (progress >= 100) {
      setProcessingState('processing');
    }
  };

  const handleProcessingComplete = () => {
    setProcessingState('completed');
  };

  const handleProcessingError = () => {
    setProcessingState('failed');
  };

  const handleRetry = () => {
    setProcessingState('idle');
    setSelectedVideo(null);
  };

  const handleDownload = (format: string) => {
    console.log(`Downloading document in ${format} format`);
    // In a real app, this would trigger a download
  };

  const handleCopy = (content: string) => {
    console.log('Content copied to clipboard');
    // In a real app, this would show a toast notification
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" withBorder style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Stack gap="md" align="center" ta="center">
            <IconRocket size={48} color="white" />
            <Title order={1} c="white" size="3rem">
              Video to Docs
            </Title>
            <Text size="lg" c="white" opacity={0.9}>
              Transform your videos into comprehensive documentation instantly
            </Text>
            <Text size="sm" c="white" opacity={0.7}>
              Upload any video and get structured documentation with smart field extraction
            </Text>
          </Stack>
        </Paper>

        {/* Main Content */}
        <Stack gap="xl">
          {/* Video Upload Section */}
          {processingState === 'idle' && (
            <VideoUploader
              onVideoSelect={handleVideoSelect}
              onUploadProgress={handleUploadProgress}
              maxSize={100}
            />
          )}

          {/* Processing Status */}
          {(processingState === 'uploading' || processingState === 'processing') && (
            <ProcessingStatus
              jobId="job-12345"
              onStatusChange={(status) => {
                if (status === 'completed') {
                  handleProcessingComplete();
                } else if (status === 'failed') {
                  handleProcessingError();
                }
              }}
              onRetry={handleRetry}
            />
          )}

          {/* Document Viewer */}
          {processingState === 'completed' && (
            <DocumentViewer
              onDownload={handleDownload}
              onCopy={handleCopy}
            />
          )}

          {/* Error State */}
          {processingState === 'failed' && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Processing Failed"
              color="red"
              variant="light"
            >
              <Text size="sm" mb="md">
                There was an error processing your video. Please try again or contact support.
              </Text>
              <Group>
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => setProcessingState('idle')}>
                  Upload New Video
                </Button>
              </Group>
            </Alert>
          )}

          {/* Smart Fields Editor */}
          {processingState === 'idle' && (
            <SlotEditor
              slots={slots}
              onSlotsChange={setSlots}
            />
          )}

          {/* Features Section */}
          <Paper p="xl" withBorder>
            <Title order={2} mb="lg" ta="center">
              How It Works
            </Title>
            <Stack gap="md">
              <Group gap="lg">
                <Paper p="md" withBorder style={{ flex: 1 }}>
                  <Text fw={500} mb="sm">1. Upload Video</Text>
                  <Text size="sm" c="dimmed">
                    Upload any video format (MP4, AVI, MOV, WMV, FLV) up to 100MB
                  </Text>
                </Paper>
                <Paper p="md" withBorder style={{ flex: 1 }}>
                  <Text fw={500} mb="sm">2. AI Processing</Text>
                  <Text size="sm" c="dimmed">
                    Our AI extracts audio, transcribes content, and analyzes the video
                  </Text>
                </Paper>
                <Paper p="md" withBorder style={{ flex: 1 }}>
                  <Text fw={500} mb="sm">3. Generate Docs</Text>
                  <Text size="sm" c="dimmed">
                    Get structured documentation with smart field extraction
                  </Text>
                </Paper>
              </Group>
            </Stack>
          </Paper>

          {/* Features Grid */}
          <Paper p="xl" withBorder>
            <Title order={2} mb="lg" ta="center">
              Features
            </Title>
            <Group gap="lg">
              <Paper p="md" withBorder style={{ flex: 1 }}>
                <Text fw={500} mb="sm">🎯 Smart Field Extraction</Text>
                <Text size="sm" c="dimmed">
                  Automatically identify and extract key information like dates, names, and values
                </Text>
              </Paper>
              <Paper p="md" withBorder style={{ flex: 1 }}>
                <Text fw={500} mb="sm">📝 Multiple Formats</Text>
                <Text size="sm" c="dimmed">
                  Export to PDF, Markdown, or view online with rich formatting
                </Text>
              </Paper>
              <Paper p="md" withBorder style={{ flex: 1 }}>
                <Text fw={500} mb="sm">⚡ Real-time Processing</Text>
                <Text size="sm" c="dimmed">
                  Watch progress in real-time with detailed step-by-step updates
                </Text>
              </Paper>
              <Paper p="md" withBorder style={{ flex: 1 }}>
                <Text fw={500} mb="sm">🔒 Secure & Private</Text>
                <Text size="sm" c="dimmed">
                  Your videos are processed securely and deleted after processing
                </Text>
              </Paper>
            </Group>
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
