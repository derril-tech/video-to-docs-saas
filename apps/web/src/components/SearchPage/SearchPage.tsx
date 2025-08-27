'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, TextInput, Select, Checkbox, ActionIcon, Tooltip, Highlight, Modal } from '@mantine/core';
import { IconSearch, IconFilter, IconEye, IconDownload, IconCopy, IconBookmark, IconBookmarkOff } from '@tabler/icons-react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'section' | 'transcript' | 'template';
  documentId?: string;
  documentName?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata: {
    duration?: string;
    author?: string;
    language?: string;
    confidence?: number;
  };
  highlights: {
    field: string;
    snippet: string;
    score: number;
  }[];
  score: number;
}

interface SearchFilters {
  type: string[];
  dateRange: string;
  author: string;
  tags: string[];
  minConfidence: number;
}

interface SearchPageProps {
  onResultSelect?: (result: SearchResult) => void;
  onResultDownload?: (resultId: string) => void;
  onResultBookmark?: (resultId: string, bookmarked: boolean) => void;
}

export function SearchPage({
  onResultSelect,
  onResultDownload,
  onResultBookmark
}: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'full-text' | 'semantic'>('full-text');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    dateRange: 'all',
    author: '',
    tags: [],
    minConfidence: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: 'result-1',
      title: 'API Authentication Endpoints',
      content: 'This section covers the authentication endpoints for the REST API, including OAuth 2.0 implementation and JWT token handling.',
      type: 'section',
      documentId: 'doc-1',
      documentName: 'API Documentation',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      tags: ['api', 'authentication', 'oauth', 'jwt'],
      metadata: {
        author: 'John Doe',
        language: 'en',
        confidence: 0.95
      },
      highlights: [
        {
          field: 'content',
          snippet: 'This section covers the <mark>authentication</mark> endpoints for the REST API',
          score: 0.95
        }
      ],
      score: 0.95
    },
    {
      id: 'result-2',
      title: 'User Management Tutorial',
      content: 'Learn how to implement user management features including registration, login, and profile management.',
      type: 'document',
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z',
      tags: ['tutorial', 'user-management', 'authentication'],
      metadata: {
        duration: '15:30',
        author: 'Jane Smith',
        language: 'en',
        confidence: 0.88
      },
      highlights: [
        {
          field: 'content',
          snippet: 'Learn how to implement <mark>user management</mark> features',
          score: 0.88
        }
      ],
      score: 0.88
    },
    {
      id: 'result-3',
      title: 'Meeting Notes - Q1 Planning',
      content: 'Discussion about Q1 goals, team structure, and project priorities. Key decisions made about authentication system implementation.',
      type: 'document',
      createdAt: '2024-01-13T09:00:00Z',
      updatedAt: '2024-01-13T09:00:00Z',
      tags: ['meeting', 'planning', 'q1', 'goals'],
      metadata: {
        duration: '45:00',
        author: 'Team Lead',
        language: 'en',
        confidence: 0.92
      },
      highlights: [
        {
          field: 'content',
          snippet: 'Key decisions made about <mark>authentication</mark> system implementation',
          score: 0.92
        }
      ],
      score: 0.92
    }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock results based on query
    const filteredResults = mockResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.content.toLowerCase().includes(query.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setResults(filteredResults);
    setIsSearching(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result);
    onResultSelect?.(result);
  };

  const handleResultPreview = (result: SearchResult) => {
    setSelectedResult(result);
    setIsPreviewModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'section': return '📝';
      case 'transcript': return '🎤';
      case 'template': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'blue';
      case 'section': return 'green';
      case 'transcript': return 'orange';
      case 'template': return 'purple';
      default: return 'gray';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'green';
    if (confidence >= 0.7) return 'yellow';
    return 'red';
  };

  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(handleSearch, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, searchType, filters]);

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {/* Search Header */}
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Search Documents
          </Text>
          <Button
            variant="outline"
            leftSection={<IconFilter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Group>

        {/* Search Input */}
        <Group gap="sm">
          <TextInput
            placeholder="Search documents, sections, transcripts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
            leftSection={<IconSearch size={16} />}
          />
          <Select
            value={searchType}
            onChange={(value) => setSearchType(value as 'full-text' | 'semantic')}
            data={[
              { value: 'full-text', label: 'Full Text' },
              { value: 'semantic', label: 'Semantic' }
            ]}
            w={120}
          />
          <Button onClick={handleSearch} loading={isSearching}>
            Search
          </Button>
        </Group>

        {/* Filters */}
        {showFilters && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Text fw={500} size="sm">Filters</Text>
              
              <Group gap="md">
                <Select
                  label="Document Type"
                  placeholder="All types"
                  value={filters.type[0] || ''}
                  onChange={(value) => handleFilterChange('type', value ? [value] : [])}
                  data={[
                    { value: 'document', label: 'Documents' },
                    { value: 'section', label: 'Sections' },
                    { value: 'transcript', label: 'Transcripts' },
                    { value: 'template', label: 'Templates' }
                  ]}
                  clearable
                  w={150}
                />
                
                <Select
                  label="Date Range"
                  value={filters.dateRange}
                  onChange={(value) => handleFilterChange('dateRange', value || 'all')}
                  data={[
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'year', label: 'This Year' }
                  ]}
                  w={150}
                />
                
                <TextInput
                  label="Author"
                  placeholder="Filter by author"
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  w={200}
                />
                
                <Select
                  label="Min Confidence"
                  value={filters.minConfidence.toString()}
                  onChange={(value) => handleFilterChange('minConfidence', parseFloat(value || '0'))}
                  data={[
                    { value: '0', label: 'Any' },
                    { value: '0.5', label: '50%+' },
                    { value: '0.7', label: '70%+' },
                    { value: '0.9', label: '90%+' }
                  ]}
                  w={120}
                />
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Search Results */}
        <Stack gap="md">
          {results.length > 0 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </Text>
              <Text size="sm" c="dimmed">
                Search type: {searchType === 'full-text' ? 'Full Text' : 'Semantic'}
              </Text>
            </Group>
          )}

          {results.map((result) => (
            <Card key={result.id} p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="sm">
                    <Text size="lg">{getTypeIcon(result.type)}</Text>
                    <div>
                      <Text fw={500} size="sm" style={{ cursor: 'pointer' }} onClick={() => handleResultSelect(result)}>
                        {result.title}
                      </Text>
                      {result.documentName && (
                        <Text size="xs" c="dimmed">
                          From: {result.documentName}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        {new Date(result.createdAt).toLocaleDateString()} • {result.metadata.author}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color={getTypeColor(result.type)} variant="light" size="xs">
                      {result.type}
                    </Badge>
                    <Badge color={getConfidenceColor(result.metadata.confidence || 0)} variant="light" size="xs">
                      {Math.round((result.metadata.confidence || 0) * 100)}%
                    </Badge>
                  </Group>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                  {result.content}
                </Text>

                {result.highlights.length > 0 && (
                  <Paper p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
                    <Text size="xs" fw={500} mb="xs">Highlights:</Text>
                    {result.highlights.map((highlight, index) => (
                      <Text key={index} size="xs" dangerouslySetInnerHTML={{ __html: highlight.snippet }} />
                    ))}
                  </Paper>
                )}

                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    {result.tags.map((tag) => (
                      <Badge key={tag} size="xs" variant="light">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                  
                  <Group gap="xs">
                    <Tooltip label="Preview">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleResultPreview(result)}
                      >
                        <IconEye size={14} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Download">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => onResultDownload?.(result.id)}
                      >
                        <IconDownload size={14} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Copy Link">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/documents/${result.id}`)}
                      >
                        <IconCopy size={14} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Bookmark">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => onResultBookmark?.(result.id, true)}
                      >
                        <IconBookmark size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Stack>
            </Card>
          ))}

          {query && results.length === 0 && !isSearching && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No results found for "{query}". Try adjusting your search terms or filters.
            </Text>
          )}

          {!query && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              Enter a search query to find documents, sections, and transcripts.
            </Text>
          )}
        </Stack>
      </Stack>

      {/* Preview Modal */}
      {selectedResult && (
        <Modal
          opened={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Preview: ${selectedResult.title}`}
          size="xl"
        >
          <Stack gap="md">
            <Group gap="sm">
              <Badge color={getTypeColor(selectedResult.type)}>
                {selectedResult.type}
              </Badge>
              <Badge color={getConfidenceColor(selectedResult.metadata.confidence || 0)}>
                {Math.round((selectedResult.metadata.confidence || 0) * 100)}% confidence
              </Badge>
              {selectedResult.metadata.duration && (
                <Badge variant="light">
                  {selectedResult.metadata.duration}
                </Badge>
              )}
            </Group>
            
            <Text size="sm" c="dimmed">
              {selectedResult.metadata.author} • {new Date(selectedResult.createdAt).toLocaleString()}
            </Text>
            
            <Paper p="md" withBorder>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedResult.content}
              </Paper>
            
            {selectedResult.highlights.length > 0 && (
              <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
                <Text fw={500} mb="sm">Search Highlights:</Text>
                {selectedResult.highlights.map((highlight, index) => (
                  <Text key={index} size="sm" dangerouslySetInnerHTML={{ __html: highlight.snippet }} />
                ))}
              </Paper>
            )}
            
            <Group gap="xs">
              {selectedResult.tags.map((tag) => (
                <Badge key={tag} size="sm" variant="light">
                  {tag}
                </Badge>
              ))}
            </Group>
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                handleResultSelect(selectedResult);
                setIsPreviewModalOpen(false);
              }}>
                Open Document
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Paper>
  );
}
