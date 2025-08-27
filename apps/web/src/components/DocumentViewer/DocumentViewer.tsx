'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, Button, Stack, Tabs, Code, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconDownload, IconCopy, IconEye, IconCode, IconFileText, IconExternalLink } from '@tabler/icons-react';

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'table' | 'list';
  metadata?: Record<string, any>;
}

interface DocumentViewerProps {
  document?: {
    id: string;
    title: string;
    sections: DocumentSection[];
    metadata: {
      videoUrl?: string;
      duration?: string;
      createdAt?: string;
      format?: string;
    };
  };
  onDownload?: (format: string) => void;
  onCopy?: (content: string) => void;
}

export function DocumentViewer({ document, onDownload, onCopy }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Mock document if none provided
  const mockDocument = {
    id: 'doc-123',
    title: 'API Documentation from Video',
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        content: 'This API provides endpoints for managing user data and authentication.',
        type: 'text'
      },
      {
        id: 'auth',
        title: 'Authentication',
        content: `All API requests require authentication using Bearer tokens.

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://api.example.com/v1/users
\`\`\``,
        type: 'code'
      },
      {
        id: 'endpoints',
        title: 'API Endpoints',
        content: `| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /users   | List users  |
| POST   | /users   | Create user |
| PUT    | /users/{id} | Update user |
| DELETE | /users/{id} | Delete user |`,
        type: 'table'
      },
      {
        id: 'examples',
        title: 'Code Examples',
        content: `\`\`\`javascript
// JavaScript example
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});
\`\`\`

\`\`\`python
# Python example
import requests

response = requests.post(
    'https://api.example.com/v1/users',
    headers={'Authorization': f'Bearer {token}'},
    json={'name': 'John Doe', 'email': 'john@example.com'}
)
\`\`\``,
        type: 'code'
      }
    ],
    metadata: {
      videoUrl: 'https://example.com/video.mp4',
      duration: '15:30',
      createdAt: '2024-01-15T10:30:00Z',
      format: 'markdown'
    }
  };

  const currentDocument = document || mockDocument;

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.(content);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadDocument = (format: string) => {
    onDownload?.(format);
  };

  const renderSection = (section: DocumentSection) => {
    switch (section.type) {
      case 'code':
        return (
          <Paper key={section.id} p="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>{section.title}</Text>
              <ActionIcon
                variant="subtle"
                onClick={() => copyToClipboard(section.content)}
                title="Copy code"
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Group>
            <Code block>{section.content}</Code>
          </Paper>
        );
      
      case 'table':
        return (
          <Paper key={section.id} p="md" withBorder>
            <Text fw={500} mb="sm">{section.title}</Text>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {section.content.split('\n').map((row, index) => {
                    if (row.trim() === '') return null;
                    const cells = row.split('|').filter(cell => cell.trim() !== '');
                    return (
                      <tr key={index}>
                        {cells.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{
                              border: '1px solid var(--mantine-color-gray-3)',
                              padding: '8px 12px',
                              textAlign: 'left'
                            }}
                          >
                            <Text size="sm">{cell.trim()}</Text>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Paper>
        );
      
      default:
        return (
          <Paper key={section.id} p="md" withBorder>
            <Text fw={500} mb="sm">{section.title}</Text>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {section.content}
            </Text>
          </Paper>
        );
    }
  };

  const renderRawContent = () => {
    const rawContent = currentDocument.sections
      .map(section => `# ${section.title}\n\n${section.content}`)
      .join('\n\n---\n\n');
    
    return (
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500}>Raw Content</Text>
          <ActionIcon
            variant="subtle"
            onClick={() => copyToClipboard(rawContent)}
            title="Copy all content"
          >
            <IconCopy size={16} />
          </ActionIcon>
        </Group>
        <Code block style={{ maxHeight: '600px', overflow: 'auto' }}>
          {rawContent}
        </Code>
      </Paper>
    );
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={600} mb="xs">
              {currentDocument.title}
            </Text>
            <Group gap="sm">
              <Badge variant="light" color="blue">
                {currentDocument.metadata.format?.toUpperCase() || 'DOCUMENT'}
              </Badge>
              {currentDocument.metadata.duration && (
                <Badge variant="light" color="gray">
                  {currentDocument.metadata.duration}
                </Badge>
              )}
            </Group>
          </div>
          
          <Group gap="sm">
            <Button
              size="sm"
              leftSection={<IconDownload size={16} />}
              onClick={() => downloadDocument('pdf')}
            >
              Download PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={() => downloadDocument('markdown')}
            >
              Download MD
            </Button>
            {currentDocument.metadata.videoUrl && (
              <Tooltip label="View original video">
                <ActionIcon
                  variant="subtle"
                  onClick={() => window.open(currentDocument.metadata.videoUrl, '_blank')}
                >
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'preview')}>
          <Tabs.List>
            <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
              Preview
            </Tabs.Tab>
            <Tabs.Tab value="raw" leftSection={<IconCode size={16} />}>
              Raw Content
            </Tabs.Tab>
            <Tabs.Tab value="outline" leftSection={<IconFileText size={16} />}>
              Outline
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="preview" pt="md">
            <Stack gap="md">
              {currentDocument.sections.map(renderSection)}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="raw" pt="md">
            {renderRawContent()}
          </Tabs.Panel>

          <Tabs.Panel value="outline" pt="md">
            <Paper p="md" withBorder>
              <Text fw={500} mb="md">Document Outline</Text>
              <Stack gap="sm">
                {currentDocument.sections.map((section, index) => (
                  <Group
                    key={section.id}
                    justify="space-between"
                    p="sm"
                    style={{
                      border: '1px solid var(--mantine-color-gray-3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedSection === section.id 
                        ? 'var(--mantine-color-blue-0)' 
                        : 'transparent'
                    }}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <Group gap="sm">
                      <Badge size="sm" variant="light">
                        {index + 1}
                      </Badge>
                      <Text size="sm" fw={500}>
                        {section.title}
                      </Text>
                    </Group>
                    <Badge size="xs" variant="light" color="gray">
                      {section.type}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
}
