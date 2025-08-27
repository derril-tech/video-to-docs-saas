'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, TextInput, Select, Button, Stack, Badge } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface Slot {
  id: string;
  name: string;
  type: 'text' | 'date' | 'email' | 'number' | 'select';
  value: string;
  required: boolean;
  validation?: string;
  options?: string[];
}

interface SlotEditorProps {
  slots?: Slot[];
  onSlotsChange?: (slots: Slot[]) => void;
}

export function SlotEditor({ slots = [], onSlotsChange }: SlotEditorProps) {
  const [localSlots, setLocalSlots] = useState<Slot[]>(slots);

  const addSlot = () => {
    const newSlot: Slot = {
      id: `slot-${Date.now()}`,
      name: 'New Slot',
      type: 'text',
      value: '',
      required: false,
    };
    
    const updatedSlots = [...localSlots, newSlot];
    setLocalSlots(updatedSlots);
    onSlotsChange?.(updatedSlots);
  };

  const updateSlot = (id: string, updates: Partial<Slot>) => {
    const updatedSlots = localSlots.map(slot =>
      slot.id === id ? { ...slot, ...updates } : slot
    );
    setLocalSlots(updatedSlots);
    onSlotsChange?.(updatedSlots);
  };

  const removeSlot = (id: string) => {
    const updatedSlots = localSlots.filter(slot => slot.id !== id);
    setLocalSlots(updatedSlots);
    onSlotsChange?.(updatedSlots);
  };

  const validateSlot = (slot: Slot): boolean => {
    if (slot.required && !slot.value) return false;
    
    switch (slot.type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(slot.value);
      case 'number':
        return !isNaN(Number(slot.value));
      case 'date':
        return !isNaN(Date.parse(slot.value));
      default:
        return true;
    }
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          Smart Fields
        </Text>
        <Button
          size="sm"
          leftSection={<IconPlus size={14} />}
          onClick={addSlot}
        >
          Add Field
        </Button>
      </Group>
      
      <Stack gap="md">
        {localSlots.map((slot) => {
          const isValid = validateSlot(slot);
          
          return (
            <Paper key={slot.id} p="sm" withBorder>
              <Group gap="sm" align="flex-start">
                <TextInput
                  size="sm"
                  label="Field Name"
                  value={slot.name}
                  onChange={(e) => updateSlot(slot.id, { name: e.target.value })}
                  placeholder="e.g., Owner, Due Date"
                  style={{ flex: 1 }}
                />
                
                <Select
                  size="sm"
                  label="Type"
                  value={slot.type}
                  onChange={(value) => updateSlot(slot.id, { type: value as any })}
                  data={[
                    { value: 'text', label: 'Text' },
                    { value: 'date', label: 'Date' },
                    { value: 'email', label: 'Email' },
                    { value: 'number', label: 'Number' },
                    { value: 'select', label: 'Select' },
                  ]}
                  w={120}
                />
                
                <div style={{ flex: 1 }}>
                  {slot.type === 'select' ? (
                    <TextInput
                      size="sm"
                      label="Value"
                      value={slot.value}
                      onChange={(e) => updateSlot(slot.id, { value: e.target.value })}
                      placeholder="Enter value"
                    />
                  ) : (
                    <TextInput
                      size="sm"
                      label="Value"
                      value={slot.value}
                      onChange={(e) => updateSlot(slot.id, { value: e.target.value })}
                      placeholder="Enter value"
                      type={slot.type === 'date' ? 'date' : slot.type === 'number' ? 'number' : 'text'}
                    />
                  )}
                </div>
                
                <Group gap="xs" align="flex-end">
                  <Badge
                    size="sm"
                    color={isValid ? 'green' : 'red'}
                    variant="light"
                  >
                    {isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => removeSlot(slot.id)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </Group>
              </Group>
            </Paper>
          );
        })}
      </Stack>
      
      {localSlots.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No smart fields yet. Add fields to capture structured data.
        </Text>
      )}
    </Paper>
  );
}
