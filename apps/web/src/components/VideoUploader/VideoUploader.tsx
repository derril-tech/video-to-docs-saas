'use client';

import React, { useState, useCallback } from 'react';
import { Paper, Text, Group, Button, Progress, Stack, Alert, FileInput } from '@mantine/core';
import { IconUpload, IconVideo, IconCheck, IconX } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';

interface VideoUploaderProps {
  onVideoSelect?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export function VideoUploader({
  onVideoSelect,
  onUploadProgress,
  maxSize = 100, // 100MB default
  acceptedFormats = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv']
}: VideoUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      setErrorMessage(error.message);
      setUploadStatus('error');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setErrorMessage(`File size exceeds ${maxSize}MB limit`);
        setUploadStatus('error');
        return;
      }

      setUploadStatus('uploading');
      setErrorMessage('');
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadStatus('success');
          onVideoSelect?.(file);
        }
        setUploadProgress(progress);
        onUploadProgress?.(progress);
      }, 200);
    }
  }, [maxSize, onVideoSelect, onUploadProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    maxFiles: 1,
    multiple: false
  });

  const resetUpload = () => {
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Upload Video
          </Text>
          <Text size="sm" c="dimmed">
            Max {maxSize}MB
          </Text>
        </Group>

        {uploadStatus === 'idle' && (
          <Paper
            {...getRootProps()}
            p="xl"
            withBorder
            style={{
              border: '2px dashed var(--mantine-color-gray-4)',
              backgroundColor: isDragActive ? 'var(--mantine-color-blue-0)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input {...getInputProps()} />
            <Stack align="center" gap="md">
              <IconVideo size={48} color="var(--mantine-color-blue-6)" />
              <Text size="lg" fw={500}>
                {isDragActive ? 'Drop video here' : 'Drag & drop video or click to browse'}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Supports MP4, AVI, MOV, WMV, FLV
              </Text>
              <Button
                leftSection={<IconUpload size={16} />}
                variant="outline"
              >
                Choose Video
              </Button>
            </Stack>
          </Paper>
        )}

        {uploadStatus === 'uploading' && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Uploading video...
                </Text>
                <Text size="sm" c="dimmed">
                  {Math.round(uploadProgress)}%
                </Text>
              </Group>
              <Progress value={uploadProgress} size="sm" />
            </Stack>
          </Paper>
        )}

        {uploadStatus === 'success' && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Upload Complete"
            color="green"
            variant="light"
          >
            <Text size="sm">
              Video uploaded successfully! You can now proceed with processing.
            </Text>
            <Button
              size="sm"
              variant="subtle"
              onClick={resetUpload}
              mt="sm"
            >
              Upload Another
            </Button>
          </Alert>
        )}

        {uploadStatus === 'error' && (
          <Alert
            icon={<IconX size={16} />}
            title="Upload Failed"
            color="red"
            variant="light"
          >
            <Text size="sm">
              {errorMessage}
            </Text>
            <Button
              size="sm"
              variant="subtle"
              onClick={resetUpload}
              mt="sm"
            >
              Try Again
            </Button>
          </Alert>
        )}

        <FileInput
          label="Or select file manually"
          placeholder="Choose video file"
          accept={acceptedFormats.join(',')}
          onChange={(file) => {
            if (file) {
              onDrop([file], []);
            }
          }}
          disabled={uploadStatus === 'uploading'}
        />
      </Stack>
    </Paper>
  );
}
