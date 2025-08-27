'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, Avatar, ActionIcon, Tooltip, Modal, TextInput, Textarea, Select, Alert } from '@mantine/core';
import { IconUsers, IconLock, IconLockOpen, IconEdit, IconEye, IconMessage, IconUserPlus, IconUserMinus, IconShare, IconSettings } from '@tabler/icons-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  currentSection?: string;
}

interface Lock {
  id: string;
  userId: string;
  userName: string;
  sectionId: string;
  sectionName: string;
  timestamp: string;
  expiresAt: string;
}

interface CoEditProps {
  users?: User[];
  locks?: Lock[];
  currentUser?: User;
  onUserInvite?: (email: string, role: string) => void;
  onUserRemove?: (userId: string) => void;
  onUserRoleChange?: (userId: string, role: string) => void;
  onLockAcquire?: (sectionId: string) => void;
  onLockRelease?: (sectionId: string) => void;
  onCursorUpdate?: (cursor: any) => void;
  onSectionChange?: (sectionId: string) => void;
}

export function CoEdit({
  users = [],
  locks = [],
  currentUser,
  onUserInvite,
  onUserRemove,
  onUserRoleChange,
  onLockAcquire,
  onLockRelease,
  onCursorUpdate,
  onSectionChange
}: CoEditProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'locks' | 'activity'>('users');

  // Mock data
  const mockUsers: User[] = [
    {
      id: 'user-1',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
      email: 'john@example.com',
      role: 'owner',
      status: 'online',
      lastSeen: '2024-01-15T10:30:00Z',
      cursor: { x: 150, y: 200 },
      currentSection: 'intro'
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
      email: 'jane@example.com',
      role: 'editor',
      status: 'online',
      lastSeen: '2024-01-15T10:29:00Z',
      cursor: { x: 300, y: 150 },
      currentSection: 'authentication'
    },
    {
      id: 'user-3',
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      email: 'mike@example.com',
      role: 'viewer',
      status: 'away',
      lastSeen: '2024-01-15T10:25:00Z',
      currentSection: 'overview'
    }
  ];

  const mockLocks: Lock[] = [
    {
      id: 'lock-1',
      userId: 'user-2',
      userName: 'Jane Smith',
      sectionId: 'authentication',
      sectionName: 'Authentication',
      timestamp: '2024-01-15T10:28:00Z',
      expiresAt: '2024-01-15T10:38:00Z'
    }
  ];

  const allUsers = [...mockUsers, ...users];
  const allLocks = [...mockLocks, ...locks];

  const handleUserInvite = (email: string, role: string) => {
    onUserInvite?.(email, role);
    setIsInviteModalOpen(false);
  };

  const handleUserRemove = (userId: string) => {
    onUserRemove?.(userId);
  };

  const handleUserRoleChange = (userId: string, role: string) => {
    onUserRoleChange?.(userId, role);
  };

  const handleLockAcquire = (sectionId: string) => {
    onLockAcquire?.(sectionId);
  };

  const handleLockRelease = (sectionId: string) => {
    onLockRelease?.(sectionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'away': return 'yellow';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'red';
      case 'editor': return 'blue';
      case 'viewer': return 'gray';
      default: return 'gray';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const userTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - userTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const isLocked = (sectionId: string) => {
    return allLocks.some(lock => lock.sectionId === sectionId);
  };

  const getLockOwner = (sectionId: string) => {
    return allLocks.find(lock => lock.sectionId === sectionId);
  };

  const canEdit = (user: User) => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    if (currentUser.role === 'editor' && user.role !== 'owner') return true;
    return false;
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <IconUsers size={20} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={500}>
              Collaborative Editing
            </Text>
            <Badge color="green" variant="light">
              {allUsers.filter(u => u.status === 'online').length} online
            </Badge>
          </Group>
          <Group gap="sm">
            <Button
              size="sm"
              leftSection={<IconUserPlus size={16} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite User
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftSection={<IconSettings size={16} />}
              onClick={() => setIsSettingsModalOpen(true)}
            >
              Settings
            </Button>
          </Group>
        </Group>

        {/* Tabs */}
        <Group gap="xs">
          <Button
            variant={activeTab === 'users' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            Users ({allUsers.length})
          </Button>
          <Button
            variant={activeTab === 'locks' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('locks')}
          >
            Locks ({allLocks.length})
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </Button>
        </Group>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Stack gap="md">
            {allUsers.map((user) => (
              <Card key={user.id} p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Avatar src={user.avatar} size="md">
                        {user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Group gap="xs" align="center">
                          <Text fw={500} size="sm">
                            {user.name}
                          </Text>
                          <Badge size="xs" color={getStatusColor(user.status)} variant="light">
                            {user.status}
                          </Badge>
                          <Badge size="xs" color={getRoleColor(user.role)} variant="light">
                            {user.role}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {user.email}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Last seen: {getTimeAgo(user.lastSeen)}
                        </Text>
                      </div>
                    </Group>
                    
                    <Group gap="xs">
                      {user.currentSection && (
                        <Tooltip label={`Currently editing: ${user.currentSection}`}>
                          <Badge size="xs" variant="light">
                            {user.currentSection}
                          </Badge>
                        </Tooltip>
                      )}
                      
                      {user.status === 'online' && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--mantine-color-green-6)',
                          animation: 'pulse 2s infinite'
                        }} />
                      )}
                    </Group>
                  </Group>

                  {user.cursor && (
                    <Paper p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                      <Text size="xs" c="dimmed">
                        Cursor at position ({user.cursor.x}, {user.cursor.y})
                        {user.cursor.selection && (
                          <span> • Selection: {user.cursor.selection.start}-{user.cursor.selection.end}</span>
                        )}
                      </Text>
                    </Paper>
                  )}

                  {currentUser && canEdit(user) && (
                    <Group gap="xs" justify="flex-end">
                      <Select
                        size="xs"
                        value={user.role}
                        onChange={(value) => handleUserRoleChange(user.id, value || user.role)}
                        data={[
                          { value: 'viewer', label: 'Viewer' },
                          { value: 'editor', label: 'Editor' },
                          { value: 'owner', label: 'Owner' }
                        ]}
                        w={100}
                      />
                      
                      {user.id !== currentUser.id && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() => handleUserRemove(user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </Group>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Locks Tab */}
        {activeTab === 'locks' && (
          <Stack gap="md">
            {allLocks.length > 0 ? (
              allLocks.map((lock) => (
                <Card key={lock.id} p="md" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <IconLock size={20} color="var(--mantine-color-orange-6)" />
                        <div>
                          <Text fw={500} size="sm">
                            {lock.sectionName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Locked by {lock.userName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Since {getTimeAgo(lock.timestamp)}
                          </Text>
                        </div>
                      </Group>
                      
                      <Group gap="xs">
                        <Badge size="xs" color="orange" variant="light">
                          Locked
                        </Badge>
                        {currentUser && lock.userId === currentUser.id && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleLockRelease(lock.sectionId)}
                          >
                            Release Lock
                          </Button>
                        )}
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              ))
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No active locks. All sections are available for editing.
              </Text>
            )}
          </Stack>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Stack gap="md">
            <Alert icon={<IconMessage size={16} />} color="blue" variant="light">
              <Text size="sm">
                Recent collaborative activity will appear here. Track changes, comments, and edits from all users.
              </Text>
            </Alert>
            
            <Card p="md" withBorder>
              <Stack gap="sm">
                <Text size="sm" fw={500}>Recent Activity</Text>
                <Text size="xs" c="dimmed">
                  • Jane Smith started editing Authentication section (2 minutes ago)
                </Text>
                <Text size="xs" c="dimmed">
                  • John Doe added a comment to Introduction section (5 minutes ago)
                </Text>
                <Text size="xs" c="dimmed">
                  • Mike Johnson joined the session (10 minutes ago)
                </Text>
              </Stack>
            </Card>
          </Stack>
        )}
      </Stack>

      {/* Invite User Modal */}
      <InviteUserModal
        opened={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleUserInvite}
      />

      {/* Settings Modal */}
      <SettingsModal
        opened={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </Paper>
  );
}

// Modal Components
function InviteUserModal({ opened, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer'
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Invite User" size="md">
      <Stack gap="md">
        <TextInput
          label="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@example.com"
          type="email"
        />
        
        <Select
          label="Role"
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value || 'viewer' })}
          data={[
            { value: 'viewer', label: 'Viewer - Can view and comment' },
            { value: 'editor', label: 'Editor - Can view, comment, and edit' },
            { value: 'owner', label: 'Owner - Full access' }
          ]}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData.email, formData.role)}>
            Send Invitation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function SettingsModal({ opened, onClose }: any) {
  return (
    <Modal opened={opened} onClose={onClose} title="Collaboration Settings" size="md">
      <Stack gap="md">
        <Text size="sm" fw={500}>Lock Settings</Text>
        
        <Select
          label="Auto-lock Duration"
          defaultValue="10"
          data={[
            { value: '5', label: '5 minutes' },
            { value: '10', label: '10 minutes' },
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' }
          ]}
        />
        
        <Select
          label="Conflict Resolution"
          defaultValue="prompt"
          data={[
            { value: 'prompt', label: 'Prompt user' },
            { value: 'auto', label: 'Auto-resolve' },
            { value: 'manual', label: 'Manual merge' }
          ]}
        />
        
        <Text size="sm" fw={500}>Presence Settings</Text>
        
        <Select
          label="Show Cursor Position"
          defaultValue="true"
          data={[
            { value: 'true', label: 'Show for all users' },
            { value: 'editors', label: 'Show for editors only' },
            { value: 'false', label: 'Hide cursors' }
          ]}
        />
        
        <Select
          label="Show Current Section"
          defaultValue="true"
          data={[
            { value: 'true', label: 'Show for all users' },
            { value: 'editors', label: 'Show for editors only' },
            { value: 'false', label: 'Hide section info' }
          ]}
        />
        
        <Group justify="flex-end">
          <Button onClick={onClose}>
            Save Settings
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
