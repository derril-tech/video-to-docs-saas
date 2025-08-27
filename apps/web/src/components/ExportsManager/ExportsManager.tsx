'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, Modal, Select, Checkbox, TextInput, ActionIcon, Tooltip, Progress, Alert } from '@mantine/core';
import { IconDownload, IconCloudUpload, IconCheck, IconX, IconRefresh, IconSettings, IconExternalLink } from '@tabler/icons-react';

interface ExportJob {
  id: string;
  documentId: string;
  documentName: string;
  format: 'pdf' | 'docx' | 'markdown' | 'html' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'notion' | 'google-docs' | 'confluence' | 'jira' | 'trello' | 'slack';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  workspace?: string;
}

interface ExportsManagerProps {
  exports?: ExportJob[];
  integrations?: Integration[];
  onExportCreate?: (format: string, options: any) => void;
  onExportDownload?: (jobId: string) => void;
  onIntegrationConnect?: (type: string) => void;
  onIntegrationSync?: (integrationId: string, documentId: string) => void;
}

export function ExportsManager({
  exports = [],
  integrations = [],
  onExportCreate,
  onExportDownload,
  onIntegrationConnect,
  onIntegrationSync
}: ExportsManagerProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'exports' | 'integrations'>('exports');

  // Mock data
  const mockExports: ExportJob[] = [
    {
      id: 'exp-1',
      documentId: 'doc-1',
      documentName: 'API Documentation',
      format: 'pdf',
      status: 'completed',
      progress: 100,
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:02:30Z',
      downloadUrl: '/api/exports/exp-1/download'
    },
    {
      id: 'exp-2',
      documentId: 'doc-1',
      documentName: 'API Documentation',
      format: 'markdown',
      status: 'processing',
      progress: 65,
      createdAt: '2024-01-15T10:05:00Z'
    },
    {
      id: 'exp-3',
      documentId: 'doc-2',
      documentName: 'Meeting Notes - Q1 Planning',
      format: 'docx',
      status: 'failed',
      progress: 0,
      createdAt: '2024-01-15T09:30:00Z',
      error: 'Template processing failed'
    }
  ];

  const mockIntegrations: Integration[] = [
    {
      id: 'int-1',
      name: 'Notion',
      type: 'notion',
      status: 'connected',
      lastSync: '2024-01-15T09:45:00Z',
      workspace: 'My Workspace'
    },
    {
      id: 'int-2',
      name: 'Google Docs',
      type: 'google-docs',
      status: 'connected',
      lastSync: '2024-01-15T08:30:00Z',
      workspace: 'user@gmail.com'
    },
    {
      id: 'int-3',
      name: 'Confluence',
      type: 'confluence',
      status: 'disconnected'
    },
    {
      id: 'int-4',
      name: 'Slack',
      type: 'slack',
      status: 'error',
      lastSync: '2024-01-15T07:15:00Z',
      error: 'Authentication expired'
    }
  ];

  const allExports = [...mockExports, ...exports];
  const allIntegrations = [...mockIntegrations, ...integrations];

  const handleExportCreate = (format: string, options: any) => {
    onExportCreate?.(format, options);
    setIsExportModalOpen(false);
  };

  const handleIntegrationConnect = (type: string) => {
    onIntegrationConnect?.(type);
    setIsIntegrationModalOpen(false);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'markdown': return '📋';
      case 'html': return '🌐';
      case 'json': return '📊';
      default: return '📄';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'red';
      case 'docx': return 'blue';
      case 'markdown': return 'gray';
      case 'html': return 'orange';
      case 'json': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'notion': return '📝';
      case 'google-docs': return '📄';
      case 'confluence': return '📚';
      case 'jira': return '🎯';
      case 'trello': return '📋';
      case 'slack': return '💬';
      default: return '🔗';
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'notion': return 'black';
      case 'google-docs': return 'blue';
      case 'confluence': return 'blue';
      case 'jira': return 'blue';
      case 'trello': return 'blue';
      case 'slack': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Exports & Integrations
          </Text>
          <Group gap="sm">
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={() => setIsExportModalOpen(true)}
            >
              Export Document
            </Button>
            <Button
              leftSection={<IconCloudUpload size={16} />}
              variant="outline"
              onClick={() => setIsIntegrationModalOpen(true)}
            >
              Connect Integration
            </Button>
          </Group>
        </Group>

        {/* Tabs */}
        <Group gap="xs">
          <Button
            variant={activeTab === 'exports' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('exports')}
          >
            Exports ({allExports.length})
          </Button>
          <Button
            variant={activeTab === 'integrations' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('integrations')}
          >
            Integrations ({allIntegrations.length})
          </Button>
        </Group>

        {/* Exports Tab */}
        {activeTab === 'exports' && (
          <Stack gap="md">
            {allExports.map((exportJob) => (
              <Card key={exportJob.id} p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Text size="lg">{getFormatIcon(exportJob.format)}</Text>
                      <div>
                        <Text fw={500} size="sm">
                          {exportJob.documentName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(exportJob.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color={getFormatColor(exportJob.format)} variant="light">
                        {exportJob.format.toUpperCase()}
                      </Badge>
                      <Badge color={getStatusColor(exportJob.status)} variant="light">
                        {exportJob.status}
                      </Badge>
                    </Group>
                  </Group>

                  {exportJob.status === 'processing' && (
                    <Progress value={exportJob.progress} size="sm" />
                  )}

                  {exportJob.error && (
                    <Alert icon={<IconX size={16} />} color="red" variant="light">
                      <Text size="sm">{exportJob.error}</Text>
                    </Alert>
                  )}

                  <Group gap="xs" justify="flex-end">
                    {exportJob.status === 'completed' && exportJob.downloadUrl && (
                      <Button
                        size="sm"
                        leftSection={<IconDownload size={14} />}
                        onClick={() => onExportDownload?.(exportJob.id)}
                      >
                        Download
                      </Button>
                    )}
                    
                    {exportJob.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftSection={<IconRefresh size={14} />}
                        onClick={() => onExportCreate?.(exportJob.format, {})}
                      >
                        Retry
                      </Button>
                    )}

                    <Tooltip label="Sync to integrations">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          setSelectedDocument({ id: exportJob.documentId, name: exportJob.documentName });
                          setActiveTab('integrations');
                        }}
                      >
                        <IconCloudUpload size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Card>
            ))}

            {allExports.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No exports yet. Export a document to get started.
              </Text>
            )}
          </Stack>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <Stack gap="md">
            {allIntegrations.map((integration) => (
              <Card key={integration.id} p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Text size="lg">{getIntegrationIcon(integration.type)}</Text>
                      <div>
                        <Text fw={500} size="sm">
                          {integration.name}
                        </Text>
                        {integration.workspace && (
                          <Text size="xs" c="dimmed">
                            {integration.workspace}
                          </Text>
                        )}
                        {integration.lastSync && (
                          <Text size="xs" c="dimmed">
                            Last sync: {new Date(integration.lastSync).toLocaleString()}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge 
                        color={integration.status === 'connected' ? 'green' : integration.status === 'error' ? 'red' : 'gray'} 
                        variant="light"
                      >
                        {integration.status}
                      </Badge>
                      <Badge color={getIntegrationColor(integration.type)} variant="light">
                        {integration.type}
                      </Badge>
                    </Group>
                  </Group>

                  <Group gap="xs" justify="flex-end">
                    {integration.status === 'connected' && selectedDocument && (
                      <Button
                        size="sm"
                        leftSection={<IconCloudUpload size={14} />}
                        onClick={() => onIntegrationSync?.(integration.id, selectedDocument.id)}
                      >
                        Sync "{selectedDocument.name}"
                      </Button>
                    )}
                    
                    {integration.status === 'disconnected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIntegrationConnect(integration.type)}
                      >
                        Connect
                      </Button>
                    )}
                    
                    {integration.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        color="red"
                        onClick={() => handleIntegrationConnect(integration.type)}
                      >
                        Reconnect
                      </Button>
                    )}

                    <Tooltip label="Settings">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {/* Open settings */}}
                      >
                        <IconSettings size={14} />
                      </ActionIcon>
                    </Tooltip>

                    {integration.status === 'connected' && (
                      <Tooltip label="Open in {integration.name}">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => {/* Open external */}}
                        >
                          <IconExternalLink size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}

            {allIntegrations.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No integrations connected. Connect your first integration to sync documents.
              </Text>
            )}
          </Stack>
        )}
      </Stack>

      {/* Export Modal */}
      <ExportModal
        opened={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handleExportCreate}
      />

      {/* Integration Modal */}
      <IntegrationModal
        opened={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        onSubmit={handleIntegrationConnect}
      />
    </Paper>
  );
}

// Modal Components
function ExportModal({ opened, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    format: 'pdf',
    includeMetadata: true,
    includeTimestamps: true,
    watermark: false,
    password: ''
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'docx', label: 'Microsoft Word' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' }
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Export Document" size="md">
      <Stack gap="md">
        <Select
          label="Export Format"
          value={formData.format}
          onChange={(value) => setFormData({ ...formData, format: value || 'pdf' })}
          data={formatOptions}
        />
        
        <Checkbox
          label="Include metadata (author, date, etc.)"
          checked={formData.includeMetadata}
          onChange={(e) => setFormData({ ...formData, includeMetadata: e.target.checked })}
        />
        
        <Checkbox
          label="Include timestamps"
          checked={formData.includeTimestamps}
          onChange={(e) => setFormData({ ...formData, includeTimestamps: e.target.checked })}
        />
        
        <Checkbox
          label="Add watermark"
          checked={formData.watermark}
          onChange={(e) => setFormData({ ...formData, watermark: e.target.checked })}
        />
        
        {formData.format === 'pdf' && (
          <TextInput
            label="Password Protection (optional)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leave empty for no password"
            type="password"
          />
        )}
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData.format, formData)}>
            Export
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function IntegrationModal({ opened, onClose, onSubmit }: any) {
  const [selectedType, setSelectedType] = useState<string>('');

  const integrationTypes = [
    { value: 'notion', label: 'Notion', description: 'Sync to Notion pages and databases' },
    { value: 'google-docs', label: 'Google Docs', description: 'Create Google Docs documents' },
    { value: 'confluence', label: 'Confluence', description: 'Sync to Confluence spaces' },
    { value: 'jira', label: 'Jira', description: 'Create Jira issues and comments' },
    { value: 'trello', label: 'Trello', description: 'Create Trello cards and lists' },
    { value: 'slack', label: 'Slack', description: 'Send to Slack channels' }
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Connect Integration" size="md">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Choose an integration to connect and sync your documents:
        </Text>
        
        {integrationTypes.map((integration) => (
          <Card
            key={integration.value}
            p="sm"
            withBorder
            style={{
              cursor: 'pointer',
              borderColor: selectedType === integration.value ? 'var(--mantine-color-blue-6)' : undefined
            }}
            onClick={() => setSelectedType(integration.value)}
          >
            <Group gap="sm">
              <Text size="lg">{getIntegrationIcon(integration.value)}</Text>
              <div style={{ flex: 1 }}>
                <Text fw={500} size="sm">
                  {integration.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {integration.description}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            disabled={!selectedType}
            onClick={() => onSubmit(selectedType)}
          >
            Connect {selectedType && integrationTypes.find(i => i.value === selectedType)?.label}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function getIntegrationIcon(type: string) {
  switch (type) {
    case 'notion': return '📝';
    case 'google-docs': return '📄';
    case 'confluence': return '📚';
    case 'jira': return '🎯';
    case 'trello': return '📋';
    case 'slack': return '💬';
    default: return '🔗';
  }
}
