'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, Button, Stack, TextInput, Select } from '@mantine/core';
import { IconPlus, IconGripVertical, IconTrash } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Section {
  id: string;
  title: string;
  type: 'heading' | 'text' | 'list' | 'table';
  level: number;
  content?: string;
  order: number;
}

interface StructurePanelProps {
  sections?: Section[];
  onSectionsChange?: (sections: Section[]) => void;
  onSectionSelect?: (section: Section) => void;
}

export function StructurePanel({ 
  sections = [], 
  onSectionsChange,
  onSectionSelect 
}: StructurePanelProps) {
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      type: 'heading',
      level: 1,
      order: localSections.length,
    };
    
    const updatedSections = [...localSections, newSection];
    setLocalSections(updatedSections);
    onSectionsChange?.(updatedSections);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    const updatedSections = localSections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    setLocalSections(updatedSections);
    onSectionsChange?.(updatedSections);
  };

  const removeSection = (id: string) => {
    const updatedSections = localSections.filter(section => section.id !== id);
    setLocalSections(updatedSections);
    onSectionsChange?.(updatedSections);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setLocalSections(updatedItems);
    onSectionsChange?.(updatedItems);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return 'H';
      case 'text':
        return 'T';
      case 'list':
        return 'L';
      case 'table':
        return 'G';
      default:
        return '•';
    }
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          Document Structure
        </Text>
        <Button
          size="sm"
          leftSection={<IconPlus size={14} />}
          onClick={addSection}
        >
          Add Section
        </Button>
      </Group>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <Stack
              {...provided.droppableProps}
              ref={provided.innerRef}
              gap="xs"
            >
              {localSections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      p="sm"
                      withBorder
                      style={{
                        borderLeft: `4px solid var(--mantine-color-blue-6)`,
                        marginLeft: `${(section.level - 1) * 16}px`,
                      }}
                    >
                      <Group gap="xs" align="center">
                        <div {...provided.dragHandleProps}>
                          <IconGripVertical size={16} style={{ cursor: 'grab' }} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <TextInput
                            size="xs"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            placeholder="Section title"
                          />
                        </div>
                        
                        <Select
                          size="xs"
                          w={80}
                          value={section.type}
                          onChange={(value) => updateSection(section.id, { type: value as any })}
                          data={[
                            { value: 'heading', label: 'H' },
                            { value: 'text', label: 'T' },
                            { value: 'list', label: 'L' },
                            { value: 'table', label: 'G' },
                          ]}
                        />
                        
                        <Select
                          size="xs"
                          w={60}
                          value={section.level.toString()}
                          onChange={(value) => updateSection(section.id, { level: parseInt(value || '1') })}
                          data={[
                            { value: '1', label: 'H1' },
                            { value: '2', label: 'H2' },
                            { value: '3', label: 'H3' },
                          ]}
                        />
                        
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => removeSection(section.id)}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </Group>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      
      {localSections.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No sections yet. Add your first section to get started.
        </Text>
      )}
    </Paper>
  );
}
