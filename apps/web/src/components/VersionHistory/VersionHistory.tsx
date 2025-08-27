'use client';

import React, { useState } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, ActionIcon, Tooltip, Modal, TextInput, Textarea, Select, Menu, Timeline } from '@mantine/core';
import { IconGitBranch, IconGitCommit, IconGitMerge, IconGitPullRequest, IconEye, IconEdit, IconTrash, IconDownload, IconCopy, IconPlus, IconHistory } from '@tabler/icons-react';

interface Version {
  id: string;
  name: string;
  description: string;
  type: 'commit' | 'branch' | 'merge' | 'tag';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  hash: string;
  parentHash?: string;
  branch: string;
  changes: {
    added: number;
    modified: number;
    deleted: number;
  };
  tags: string[];
  isCurrent: boolean;
  isPublished: boolean;
}

interface Branch {
  id: string;
  name: string;
  description: string;
  isMain: boolean;
  isActive: boolean;
  lastCommit: string;
  aheadCount: number;
  behindCount: number;
}

interface VersionHistoryProps {
  versions?: Version[];
  branches?: Branch[];
  onVersionSelect?: (version: Version) => void;
  onVersionCreate?: (name: string, description: string, type: string) => void;
  onVersionDelete?: (versionId: string) => void;
  onBranchCreate?: (name: string, description: string) => void;
  onBranchSwitch?: (branchId: string) => void;
  onVersionMerge?: (sourceBranch: string, targetBranch: string) => void;
}

export function VersionHistory({
  versions = [],
  branches = [],
  onVersionSelect,
  onVersionCreate,
  onVersionDelete,
  onBranchCreate,
  onBranchSwitch,
  onVersionMerge
}: VersionHistoryProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'branches'>('history');
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data
  const mockVersions: Version[] = [
    {
      id: 'v1.0.0',
      name: 'Initial Release',
      description: 'First stable version with core features',
      type: 'tag',
      author: {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      timestamp: '2024-01-15T10:00:00Z',
      hash: 'abc123',
      branch: 'main',
      changes: { added: 150, modified: 0, deleted: 0 },
      tags: ['stable', 'release'],
      isCurrent: false,
      isPublished: true
    },
    {
      id: 'v1.1.0',
      name: 'Add Authentication Features',
      description: 'Implemented OAuth 2.0 and JWT authentication',
      type: 'commit',
      author: {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      timestamp: '2024-01-15T09:30:00Z',
      hash: 'def456',
      parentHash: 'abc123',
      branch: 'main',
      changes: { added: 45, modified: 12, deleted: 3 },
      tags: ['feature', 'auth'],
      isCurrent: true,
      isPublished: true
    },
    {
      id: 'v1.0.1',
      name: 'Bug Fixes',
      description: 'Fixed export issues and improved error handling',
      type: 'commit',
      author: {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      timestamp: '2024-01-14T16:45:00Z',
      hash: 'ghi789',
      parentHash: 'abc123',
      branch: 'main',
      changes: { added: 8, modified: 25, deleted: 5 },
      tags: ['bugfix', 'export'],
      isCurrent: false,
      isPublished: true
    },
    {
      id: 'feature/advanced-search',
      name: 'Advanced Search Implementation',
      description: 'Added semantic search and advanced filtering',
      type: 'branch',
      author: {
        id: 'user-3',
        name: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=3'
      },
      timestamp: '2024-01-13T14:20:00Z',
      hash: 'jkl012',
      parentHash: 'def456',
      branch: 'feature/advanced-search',
      changes: { added: 67, modified: 23, deleted: 8 },
      tags: ['feature', 'search'],
      isCurrent: false,
      isPublished: false
    }
  ];

  const mockBranches: Branch[] = [
    {
      id: 'main',
      name: 'main',
      description: 'Main development branch',
      isMain: true,
      isActive: true,
      lastCommit: 'def456',
      aheadCount: 0,
      behindCount: 0
    },
    {
      id: 'feature/advanced-search',
      name: 'feature/advanced-search',
      description: 'Advanced search functionality',
      isMain: false,
      isActive: false,
      lastCommit: 'jkl012',
      aheadCount: 3,
      behindCount: 1
    },
    {
      id: 'feature/export-improvements',
      name: 'feature/export-improvements',
      description: 'Enhanced export capabilities',
      isMain: false,
      isActive: false,
      lastCommit: 'mno345',
      aheadCount: 2,
      behindCount: 2
    }
  ];

  const allVersions = [...mockVersions, ...versions];
  const allBranches = [...mockBranches, ...branches];

  const handleVersionCreate = (name: string, description: string, type: string) => {
    onVersionCreate?.(name, description, type);
    setIsCreateModalOpen(false);
  };

  const handleBranchCreate = (name: string, description: string) => {
    onBranchCreate?.(name, description);
    setIsBranchModalOpen(false);
  };

  const handleBranchSwitch = (branchId: string) => {
    onBranchSwitch?.(branchId);
  };

  const handleVersionMerge = (sourceBranch: string, targetBranch: string) => {
    onVersionMerge?.(sourceBranch, targetBranch);
    setIsMergeModalOpen(false);
  };

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'commit': return <IconGitCommit size={16} />;
      case 'branch': return <IconGitBranch size={16} />;
      case 'merge': return <IconGitMerge size={16} />;
      case 'tag': return <IconGitPullRequest size={16} />;
      default: return <IconGitCommit size={16} />;
    }
  };

  const getVersionColor = (type: string) => {
    switch (type) {
      case 'commit': return 'blue';
      case 'branch': return 'green';
      case 'merge': return 'purple';
      case 'tag': return 'orange';
      default: return 'gray';
    }
  };

  const formatHash = (hash: string) => hash.substring(0, 7);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const versionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - versionTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredVersions = allVersions.filter(version => 
    filterType === 'all' || version.type === filterType
  );

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Version History
          </Text>
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Version
            </Button>
            <Button
              leftSection={<IconGitBranch size={16} />}
              variant="outline"
              onClick={() => setIsBranchModalOpen(true)}
            >
              New Branch
            </Button>
          </Group>
        </Group>

        {/* Tabs */}
        <Group gap="xs">
          <Button
            variant={activeTab === 'history' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            History
          </Button>
          <Button
            variant={activeTab === 'branches' ? 'filled' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('branches')}
          >
            Branches ({allBranches.length})
          </Button>
        </Group>

        {/* Version History Tab */}
        {activeTab === 'history' && (
          <Stack gap="md">
            <Group gap="sm">
              <Select
                value={filterType}
                onChange={(value) => setFilterType(value || 'all')}
                data={[
                  { value: 'all', label: 'All Types' },
                  { value: 'commit', label: 'Commits' },
                  { value: 'branch', label: 'Branches' },
                  { value: 'merge', label: 'Merges' },
                  { value: 'tag', label: 'Tags' }
                ]}
                w={150}
              />
            </Group>

            <Timeline active={filteredVersions.findIndex(v => v.isCurrent)} bulletSize={24} lineWidth={2}>
              {filteredVersions.map((version, index) => (
                <Timeline.Item
                  key={version.id}
                  bullet={getVersionIcon(version.type)}
                  title={
                    <Group gap="sm">
                      <Text fw={500} size="sm">
                        {version.name}
                      </Text>
                      {version.isCurrent && (
                        <Badge size="xs" color="green">
                          Current
                        </Badge>
                      )}
                      {version.isPublished && (
                        <Badge size="xs" color="blue">
                          Published
                        </Badge>
                      )}
                    </Group>
                  }
                >
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">
                      {version.description}
                    </Text>
                    
                    <Group gap="sm" align="center">
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {version.author.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {getTimeAgo(version.timestamp)}
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <Badge size="xs" color={getVersionColor(version.type)} variant="light">
                          {version.type}
                        </Badge>
                        <Badge size="xs" variant="light">
                          {formatHash(version.hash)}
                        </Badge>
                        <Badge size="xs" variant="light">
                          {version.branch}
                        </Badge>
                      </Group>
                    </Group>

                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        +{version.changes.added} -{version.changes.deleted} ~{version.changes.modified}
                      </Text>
                      
                      {version.tags.map((tag) => (
                        <Badge key={tag} size="xs" variant="light">
                          {tag}
                        </Badge>
                      ))}
                    </Group>

                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          setSelectedVersion(version);
                          onVersionSelect?.(version);
                        }}
                      >
                        <IconEye size={14} />
                      </ActionIcon>
                      
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => onVersionDelete?.(version.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                      
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => navigator.clipboard.writeText(version.hash)}
                      >
                        <IconCopy size={14} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Timeline.Item>
              ))}
            </Timeline>
          </Stack>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <Stack gap="md">
            {allBranches.map((branch) => (
              <Card key={branch.id} p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconGitBranch size={20} color="var(--mantine-color-green-6)" />
                      <div>
                        <Text fw={500} size="sm">
                          {branch.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {branch.description}
                        </Text>
                      </div>
                    </Group>
                    
                    <Group gap="xs">
                      {branch.isMain && (
                        <Badge size="xs" color="blue" variant="light">
                          Main
                        </Badge>
                      )}
                      {branch.isActive && (
                        <Badge size="xs" color="green" variant="light">
                          Active
                        </Badge>
                      )}
                      <Badge size="xs" variant="light">
                        {formatHash(branch.lastCommit)}
                      </Badge>
                    </Group>
                  </Group>

                  <Group gap="sm" justify="space-between">
                    <Group gap="sm">
                      {branch.aheadCount > 0 && (
                        <Text size="xs" c="green">
                          ↑ {branch.aheadCount} ahead
                        </Text>
                      )}
                      {branch.behindCount > 0 && (
                        <Text size="xs" c="red">
                          ↓ {branch.behindCount} behind
                        </Text>
                      )}
                    </Group>
                    
                    <Group gap="xs">
                      {!branch.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBranchSwitch(branch.id)}
                        >
                          Switch to Branch
                        </Button>
                      )}
                      
                      {!branch.isMain && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBranch(branch);
                            setIsMergeModalOpen(true);
                          }}
                        >
                          Merge
                        </Button>
                      )}
                      
                      <Menu>
                        <Menu.Target>
                          <ActionIcon size="sm" variant="subtle">
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item>Rename</Menu.Item>
                          <Menu.Item>Delete</Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Create Version Modal */}
      <CreateVersionModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleVersionCreate}
      />

      {/* Create Branch Modal */}
      <CreateBranchModal
        opened={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSubmit={handleBranchCreate}
      />

      {/* Merge Modal */}
      <MergeModal
        opened={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        sourceBranch={selectedBranch?.name || ''}
        onSubmit={handleVersionMerge}
      />
    </Paper>
  );
}

// Modal Components
function CreateVersionModal({ opened, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'commit'
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Create Version" size="md">
      <Stack gap="md">
        <TextInput
          label="Version Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Add authentication features"
        />
        
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the changes in this version"
          minRows={3}
        />
        
        <Select
          label="Type"
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value || 'commit' })}
          data={[
            { value: 'commit', label: 'Commit' },
            { value: 'branch', label: 'Branch' },
            { value: 'merge', label: 'Merge' },
            { value: 'tag', label: 'Tag' }
          ]}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData.name, formData.description, formData.type)}>
            Create Version
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function CreateBranchModal({ opened, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Create Branch" size="md">
      <Stack gap="md">
        <TextInput
          label="Branch Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., feature/new-feature"
        />
        
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this branch is for"
          minRows={3}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(formData.name, formData.description)}>
            Create Branch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function MergeModal({ opened, onClose, sourceBranch, onSubmit }: any) {
  const [targetBranch, setTargetBranch] = useState('main');

  return (
    <Modal opened={opened} onClose={onClose} title="Merge Branch" size="md">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Merge changes from <strong>{sourceBranch}</strong> into the target branch.
        </Text>
        
        <Select
          label="Target Branch"
          value={targetBranch}
          onChange={(value) => setTargetBranch(value || 'main')}
          data={[
            { value: 'main', label: 'main' },
            { value: 'develop', label: 'develop' }
          ]}
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(sourceBranch, targetBranch)}>
            Merge Branch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
