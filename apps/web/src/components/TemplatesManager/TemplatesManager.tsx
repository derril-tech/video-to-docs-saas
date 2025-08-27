'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, Modal, TextInput, Textarea, Select, ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCopy, IconEye, IconDownload } from '@tabler/icons-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'built-in' | 'custom';
  type: 'document' | 'presentation' | 'report' | 'meeting-notes' | 'tutorial';
  content: string;
  slots: Array<{
    name: string;
    type: 'text' | 'date' | 'email' | 'number' | 'select';
    required: boolean;
    defaultValue?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesManagerProps {
  templates?: Template[];
  onTemplateSelect?: (template: Template) => void;
  onTemplateCreate?: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTemplateUpdate?: (id: string, template: Partial<Template>) => void;
  onTemplateDelete?: (id: string) => void;
}

export function TemplatesManager({
  templates = [],
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete
}: TemplatesManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'built-in' | 'custom'>('all');

  // Mock templates
  const mockTemplates: Template[] = [
    {
      id: 'api-docs',
      name: 'API Documentation',
      description: 'Generate comprehensive API documentation from video tutorials',
      category: 'built-in',
      type: 'document',
      content: `# API Documentation

## Overview
{api_name} provides a comprehensive set of endpoints for {purpose}.

## Authentication
All API requests require authentication using Bearer tokens.

## Endpoints

### {endpoint_name}
**Method:** {http_method}
**URL:** {base_url}/{endpoint_path}

**Parameters:**
- {param_name}: {param_type} - {param_description}

**Response:**
\`\`\`json
{response_example}
\`\`\`

## Examples

### {language_example}
\`\`\`{language}
{code_example}
\`\`\``,
      slots: [
        { name: 'api_name', type: 'text', required: true },
        { name: 'purpose', type: 'text', required: true },
        { name: 'endpoint_name', type: 'text', required: true },
        { name: 'http_method', type: 'select', required: true, defaultValue: 'GET' },
        { name: 'base_url', type: 'text', required: true },
        { name: 'endpoint_path', type: 'text', required: true },
        { name: 'param_name', type: 'text', required: false },
        { name: 'param_type', type: 'text', required: false },
        { name: 'param_description', type: 'text', required: false },
        { name: 'response_example', type: 'text', required: false },
        { name: 'language_example', type: 'text', required: false },
        { name: 'language', type: 'select', required: false, defaultValue: 'javascript' },
        { name: 'code_example', type: 'text', required: false }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Structured meeting notes template with action items',
      category: 'built-in',
      type: 'meeting-notes',
      content: `# Meeting Notes: {meeting_title}

**Date:** {meeting_date}
**Time:** {meeting_time}
**Location:** {meeting_location}
**Attendees:** {attendees}

## Agenda
{agenda_items}

## Discussion Points
{discussion_points}

## Decisions Made
{decisions}

## Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
| {action_item} | {owner} | {due_date} | {status} |

## Next Steps
{next_steps}

## Notes
{additional_notes}`,
      slots: [
        { name: 'meeting_title', type: 'text', required: true },
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'meeting_time', type: 'text', required: true },
        { name: 'meeting_location', type: 'text', required: false },
        { name: 'attendees', type: 'text', required: true },
        { name: 'agenda_items', type: 'text', required: true },
        { name: 'discussion_points', type: 'text', required: true },
        { name: 'decisions', type: 'text', required: false },
        { name: 'action_item', type: 'text', required: false },
        { name: 'owner', type: 'text', required: false },
        { name: 'due_date', type: 'date', required: false },
        { name: 'status', type: 'select', required: false, defaultValue: 'Pending' },
        { name: 'next_steps', type: 'text', required: false },
        { name: 'additional_notes', type: 'text', required: false }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'tutorial-guide',
      name: 'Tutorial Guide',
      description: 'Step-by-step tutorial documentation template',
      category: 'built-in',
      type: 'tutorial',
      content: `# {tutorial_title}

## Overview
{tutorial_overview}

## Prerequisites
{prerequisites}

## Step-by-Step Instructions

### Step 1: {step1_title}
{step1_description}

\`\`\`{code_language}
{step1_code}
\`\`\`

### Step 2: {step2_title}
{step2_description}

\`\`\`{code_language}
{step2_code}
\`\`\`

## Troubleshooting
{troubleshooting}

## Summary
{summary}

## Additional Resources
{additional_resources}`,
      slots: [
        { name: 'tutorial_title', type: 'text', required: true },
        { name: 'tutorial_overview', type: 'text', required: true },
        { name: 'prerequisites', type: 'text', required: false },
        { name: 'step1_title', type: 'text', required: true },
        { name: 'step1_description', type: 'text', required: true },
        { name: 'code_language', type: 'select', required: false, defaultValue: 'bash' },
        { name: 'step1_code', type: 'text', required: false },
        { name: 'step2_title', type: 'text', required: false },
        { name: 'step2_description', type: 'text', required: false },
        { name: 'step2_code', type: 'text', required: false },
        { name: 'troubleshooting', type: 'text', required: false },
        { name: 'summary', type: 'text', required: false },
        { name: 'additional_resources', type: 'text', required: false }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ];

  const allTemplates = [...mockTemplates, ...templates];
  const filteredTemplates = allTemplates.filter(template => 
    activeCategory === 'all' || template.category === activeCategory
  );

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleCreateTemplate = (templateData: any) => {
    onTemplateCreate?.(templateData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateTemplate = (id: string, templateData: any) => {
    onTemplateUpdate?.(id, templateData);
    setIsEditModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    onTemplateDelete?.(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'presentation': return '📊';
      case 'report': return '📋';
      case 'meeting-notes': return '📝';
      case 'tutorial': return '🎓';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'blue';
      case 'presentation': return 'purple';
      case 'report': return 'green';
      case 'meeting-notes': return 'orange';
      case 'tutorial': return 'cyan';
      default: return 'gray';
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Templates
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Template
          </Button>
        </Group>

        {/* Category Filter */}
        <Group gap="xs">
          <Button
            variant={activeCategory === 'all' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            All ({allTemplates.length})
          </Button>
          <Button
            variant={activeCategory === 'built-in' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('built-in')}
          >
            Built-in ({allTemplates.filter(t => t.category === 'built-in').length})
          </Button>
          <Button
            variant={activeCategory === 'custom' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('custom')}
          >
            Custom ({allTemplates.filter(t => t.category === 'custom').length})
          </Button>
        </Group>

        {/* Templates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Text size="lg">{getTypeIcon(template.type)}</Text>
                    <div>
                      <Text fw={500} size="sm">
                        {template.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {template.description}
                      </Text>
                    </div>
                  </Group>
                  <Badge size="xs" color={template.category === 'built-in' ? 'blue' : 'green'}>
                    {template.category}
                  </Badge>
                </Group>

                <Group gap="xs">
                  <Badge size="xs" color={getTypeColor(template.type)} variant="light">
                    {template.type}
                  </Badge>
                  <Badge size="xs" variant="light">
                    {template.slots.length} slots
                  </Badge>
                </Group>

                <Group gap="xs" justify="flex-end">
                  <Tooltip label="Use Template">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>
                  
                  <Tooltip label="Preview">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewModalOpen(true);
                      }}
                    >
                      <IconEye size={14} />
                    </ActionIcon>
                  </Tooltip>

                  {template.category === 'custom' && (
                    <>
                      <Tooltip label="Edit">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      
                      <Tooltip label="Delete">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}

                  <Tooltip label="Duplicate">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        const duplicate = {
                          ...template,
                          id: `copy-${Date.now()}`,
                          name: `${template.name} (Copy)`,
                          category: 'custom' as const
                        };
                        onTemplateCreate?.(duplicate);
                      }}
                    >
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            No templates found. Create your first template to get started.
          </Text>
        )}
      </Stack>

      {/* Create Template Modal */}
      <CreateTemplateModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
      />

      {/* Edit Template Modal */}
      {selectedTemplate && (
        <EditTemplateModal
          opened={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          template={selectedTemplate}
          onSubmit={(data) => handleUpdateTemplate(selectedTemplate.id, data)}
        />
      )}

      {/* Preview Template Modal */}
      {selectedTemplate && (
        <PreviewTemplateModal
          opened={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          template={selectedTemplate}
        />
      )}
    </Paper>
  );
}

// Modal Components
function CreateTemplateModal({ opened, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'document',
    content: '',
    slots: []
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Create Template" size="lg">
      <Stack gap="md">
        <TextInput
          label="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter template name"
        />
        
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this template is for"
        />
        
        <Select
          label="Type"
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value || 'document' })}
          data={[
            { value: 'document', label: 'Document' },
            { value: 'presentation', label: 'Presentation' },
            { value: 'report', label: 'Report' },
            { value: 'meeting-notes', label: 'Meeting Notes' },
            { value: 'tutorial', label: 'Tutorial' }
          ]}
        />
        
        <Textarea
          label="Template Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter template content with {slot_name} placeholders"
          minRows={6}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            Create Template
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function EditTemplateModal({ opened, onClose, template, onSubmit }: any) {
  const [formData, setFormData] = useState(template);

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Template" size="lg">
      <Stack gap="md">
        <TextInput
          label="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        
        <Select
          label="Type"
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value || 'document' })}
          data={[
            { value: 'document', label: 'Document' },
            { value: 'presentation', label: 'Presentation' },
            { value: 'report', label: 'Report' },
            { value: 'meeting-notes', label: 'Meeting Notes' },
            { value: 'tutorial', label: 'Tutorial' }
          ]}
        />
        
        <Textarea
          label="Template Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          minRows={6}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData)}>
            Update Template
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function PreviewTemplateModal({ opened, onClose, template }: any) {
  return (
    <Modal opened={opened} onClose={onClose} title={`Preview: ${template.name}`} size="xl">
      <Stack gap="md">
        <Group gap="sm">
          <Badge color={template.category === 'built-in' ? 'blue' : 'green'}>
            {template.category}
          </Badge>
          <Badge color="gray">
            {template.type}
          </Badge>
          <Badge color="blue">
            {template.slots.length} slots
          </Badge>
        </Group>
        
        <Text size="sm" c="dimmed">
          {template.description}
        </Text>
        
        <Paper p="md" withBorder>
          <Text fw={500} mb="sm">Template Content:</Text>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {template.content}
          </pre>
        </Paper>
        
        {template.slots.length > 0 && (
          <Paper p="md" withBorder>
            <Text fw={500} mb="sm">Available Slots:</Text>
            <Stack gap="xs">
              {template.slots.map((slot: any, index: number) => (
                <Group key={index} gap="sm">
                  <Badge size="xs" color={slot.required ? 'red' : 'gray'}>
                    {slot.required ? 'Required' : 'Optional'}
                  </Badge>
                  <Text size="sm" fw={500}>{slot.name}</Text>
                  <Text size="sm" c="dimmed">({slot.type})</Text>
                  {slot.defaultValue && (
                    <Text size="sm" c="dimmed">Default: {slot.defaultValue}</Text>
                  )}
                </Group>
              ))}
            </Stack>
          </Paper>
        )}
        
        <Group justify="flex-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
