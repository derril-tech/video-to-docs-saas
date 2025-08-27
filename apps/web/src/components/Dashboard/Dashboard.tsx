'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, Grid, Progress, RingProgress, LineChart, BarChart, Select, ActionIcon, Tooltip } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconEye, IconDownload, IconClock, IconCheck, IconX, IconRefresh, IconCalendar, IconUsers, IconFileText } from '@tabler/icons-react';

interface DashboardStats {
  totalDocuments: number;
  totalDictations: number;
  totalExports: number;
  exportSuccessRate: number;
  averageProcessingTime: number;
  activeUsers: number;
  storageUsed: number;
  storageLimit: number;
}

interface ChartData {
  date: string;
  documents: number;
  exports: number;
  users: number;
}

interface RecentActivity {
  id: string;
  type: 'document_created' | 'export_completed' | 'export_failed' | 'user_joined';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'error' | 'info';
}

interface DashboardProps {
  stats?: DashboardStats;
  chartData?: ChartData[];
  recentActivity?: RecentActivity[];
  onRefresh?: () => void;
  onViewDetails?: (type: string) => void;
}

export function Dashboard({
  stats,
  chartData,
  recentActivity,
  onRefresh,
  onViewDetails
}: DashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const mockStats: DashboardStats = {
    totalDocuments: 156,
    totalDictations: 89,
    totalExports: 234,
    exportSuccessRate: 94.2,
    averageProcessingTime: 2.3,
    activeUsers: 12,
    storageUsed: 2.4,
    storageLimit: 10
  };

  const mockChartData: ChartData[] = [
    { date: '2024-01-09', documents: 5, exports: 8, users: 3 },
    { date: '2024-01-10', documents: 8, exports: 12, users: 5 },
    { date: '2024-01-11', documents: 12, exports: 18, users: 7 },
    { date: '2024-01-12', documents: 15, exports: 22, users: 9 },
    { date: '2024-01-13', documents: 18, exports: 25, users: 11 },
    { date: '2024-01-14', documents: 22, exports: 28, users: 12 },
    { date: '2024-01-15', documents: 25, exports: 32, users: 12 }
  ];

  const mockRecentActivity: RecentActivity[] = [
    {
      id: 'act-1',
      type: 'document_created',
      title: 'API Documentation Created',
      description: 'New document created from video tutorial',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: 'act-2',
      type: 'export_completed',
      title: 'PDF Export Completed',
      description: 'API Documentation exported to PDF',
      timestamp: '2024-01-15T10:25:00Z',
      status: 'success'
    },
    {
      id: 'act-3',
      type: 'export_failed',
      title: 'DOCX Export Failed',
      description: 'Template processing error',
      timestamp: '2024-01-15T10:20:00Z',
      status: 'error'
    },
    {
      id: 'act-4',
      type: 'user_joined',
      title: 'New User Joined',
      description: 'Sarah Johnson joined the workspace',
      timestamp: '2024-01-15T10:15:00Z',
      status: 'info'
    }
  ];

  const currentStats = stats || mockStats;
  const currentChartData = chartData || mockChartData;
  const currentRecentActivity = recentActivity || mockRecentActivity;

  const handleRefresh = async () => {
    setIsLoading(true);
    onRefresh?.();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_created': return <IconFileText size={16} />;
      case 'export_completed': return <IconDownload size={16} />;
      case 'export_failed': return <IconX size={16} />;
      case 'user_joined': return <IconUsers size={16} />;
      default: return <IconEye size={16} />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const formatStorage = (gb: number) => {
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(gb * 1024).toFixed(0)} MB`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <IconTrendingUp size={16} color="green" />;
    if (current < previous) return <IconTrendingDown size={16} color="red" />;
    return null;
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={600}>
              Dashboard
            </Text>
            <Text size="sm" c="dimmed">
              Overview of your video-to-docs activity
            </Text>
          </div>
          <Group gap="sm">
            <Select
              value={timeRange}
              onChange={(value) => setTimeRange(value || '7d')}
              data={[
                { value: '1d', label: 'Last 24 hours' },
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' }
              ]}
              w={150}
            />
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Key Metrics */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total Documents</Text>
                  <IconFileText size={20} color="var(--mantine-color-blue-6)" />
                </Group>
                <Text size="xl" fw={600}>
                  {currentStats.totalDocuments.toLocaleString()}
                </Text>
                <Group gap="xs">
                  {getTrendIcon(25, 22)}
                  <Text size="xs" c="dimmed">
                    +13.6% from last week
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total Dictations</Text>
                  <IconClock size={20} color="var(--mantine-color-green-6)" />
                </Group>
                <Text size="xl" fw={600}>
                  {currentStats.totalDictations.toLocaleString()}
                </Text>
                <Group gap="xs">
                  {getTrendIcon(89, 76)}
                  <Text size="xs" c="dimmed">
                    +17.1% from last week
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total Exports</Text>
                  <IconDownload size={20} color="var(--mantine-color-purple-6)" />
                </Group>
                <Text size="xl" fw={600}>
                  {currentStats.totalExports.toLocaleString()}
                </Text>
                <Group gap="xs">
                  {getTrendIcon(32, 28)}
                  <Text size="xs" c="dimmed">
                    +14.3% from last week
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Active Users</Text>
                  <IconUsers size={20} color="var(--mantine-color-orange-6)" />
                </Group>
                <Text size="xl" fw={600}>
                  {currentStats.activeUsers}
                </Text>
                <Group gap="xs">
                  {getTrendIcon(12, 11)}
                  <Text size="xs" c="dimmed">
                    +9.1% from last week
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Performance Metrics */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Export Success Rate</Text>
                  <Badge color="green" variant="light">
                    {currentStats.exportSuccessRate}%
                  </Badge>
                </Group>
                <RingProgress
                  size={120}
                  thickness={8}
                  sections={[
                    { value: currentStats.exportSuccessRate, color: 'green' },
                    { value: 100 - currentStats.exportSuccessRate, color: 'gray' }
                  ]}
                  label={
                    <Text ta="center" size="lg" fw={500}>
                      {currentStats.exportSuccessRate}%
                    </Text>
                  }
                />
                <Text size="sm" c="dimmed" ta="center">
                  {Math.round((currentStats.exportSuccessRate / 100) * currentStats.totalExports)} successful exports
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Storage Usage</Text>
                  <Badge color="blue" variant="light">
                    {formatStorage(currentStats.storageUsed)} / {formatStorage(currentStats.storageLimit)}
                  </Badge>
                </Group>
                <Progress
                  value={(currentStats.storageUsed / currentStats.storageLimit) * 100}
                  size="lg"
                  color="blue"
                  label={`${Math.round((currentStats.storageUsed / currentStats.storageLimit) * 100)}%`}
                />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Average Processing Time</Text>
                  <Text size="sm" fw={500}>
                    {currentStats.averageProcessingTime} minutes
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Charts */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Activity Over Time</Text>
                  <Group gap="xs">
                    <Badge size="sm" color="blue" variant="light">Documents</Badge>
                    <Badge size="sm" color="purple" variant="light">Exports</Badge>
                    <Badge size="sm" color="orange" variant="light">Users</Badge>
                  </Group>
                </Group>
                
                {/* Mock chart - in real app, use a charting library */}
                <Paper p="md" withBorder style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stack align="center" gap="sm">
                    <IconTrendingUp size={48} color="var(--mantine-color-blue-6)" />
                    <Text size="lg" fw={500}>Activity Chart</Text>
                    <Text size="sm" c="dimmed">Chart showing documents, exports, and users over time</Text>
                    <Text size="xs" c="dimmed">
                      {currentChartData.length} data points from {currentChartData[0]?.date} to {currentChartData[currentChartData.length - 1]?.date}
                    </Text>
                  </Stack>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Recent Activity</Text>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => onViewDetails?.('activity')}
                  >
                    View All
                  </Button>
                </Group>
                
                <Stack gap="sm">
                  {currentRecentActivity.slice(0, 5).map((activity) => (
                    <Group key={activity.id} gap="sm" align="flex-start">
                      <div style={{ 
                        padding: '4px', 
                        borderRadius: '4px', 
                        backgroundColor: `var(--mantine-color-${getActivityColor(activity.status)}-1)` 
                      }}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {activity.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {activity.description}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Card p="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>Quick Actions</Text>
            <Group gap="sm">
              <Button
                leftSection={<IconFileText size={16} />}
                onClick={() => onViewDetails?.('documents')}
              >
                View All Documents
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                variant="outline"
                onClick={() => onViewDetails?.('exports')}
              >
                View Exports
              </Button>
              <Button
                leftSection={<IconUsers size={16} />}
                variant="outline"
                onClick={() => onViewDetails?.('users')}
              >
                Manage Users
              </Button>
              <Button
                leftSection={<IconCalendar size={16} />}
                variant="outline"
                onClick={() => onViewDetails?.('analytics')}
              >
                Detailed Analytics
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Paper>
  );
}
