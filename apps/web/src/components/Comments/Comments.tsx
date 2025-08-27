'use client';

import React, { useState, useRef } from 'react';
import { Paper, Text, Group, Button, Stack, Card, Badge, TextInput, Textarea, ActionIcon, Tooltip, Modal, Avatar, Menu, Divider } from '@mantine/core';
import { IconMessage, IconPlay, IconPause, IconEdit, IconTrash, IconReply, IconFlag, IconClock, IconUser } from '@tabler/icons-react';

interface AudioSnippet {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  audioSnippet?: AudioSnippet;
  replies: Comment[];
  isEdited: boolean;
  isResolved: boolean;
  tags: string[];
}

interface CommentsProps {
  comments?: Comment[];
  currentTime?: number;
  onCommentAdd?: (content: string, audioSnippet?: AudioSnippet) => void;
  onCommentReply?: (commentId: string, content: string) => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentResolve?: (commentId: string) => void;
  onTimeSeek?: (time: number) => void;
  onAudioPlay?: (startTime: number, endTime: number) => void;
}

export function Comments({
  comments = [],
  currentTime = 0,
  onCommentAdd,
  onCommentReply,
  onCommentEdit,
  onCommentDelete,
  onCommentResolve,
  onTimeSeek,
  onAudioPlay
}: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<AudioSnippet | null>(null);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'recent' | 'resolved'>('time');

  // Mock comments
  const mockComments: Comment[] = [
    {
      id: 'comment-1',
      content: 'This authentication flow needs better error handling for expired tokens.',
      author: {
        id: 'user-1',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      timestamp: '2024-01-15T10:30:00Z',
      audioSnippet: {
        id: 'snippet-1',
        startTime: 120,
        endTime: 135,
        text: 'Now let\'s implement the authentication flow with proper error handling.',
        confidence: 0.92
      },
      replies: [
        {
          id: 'reply-1',
          content: 'I agree, we should add retry logic for token refresh.',
          author: {
            id: 'user-2',
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=2'
          },
          timestamp: '2024-01-15T10:35:00Z',
          replies: [],
          isEdited: false,
          isResolved: false,
          tags: ['improvement']
        }
      ],
      isEdited: false,
      isResolved: false,
      tags: ['bug', 'authentication']
    },
    {
      id: 'comment-2',
      content: 'Great explanation of the OAuth 2.0 flow!',
      author: {
        id: 'user-3',
        name: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=3'
      },
      timestamp: '2024-01-15T10:25:00Z',
      audioSnippet: {
        id: 'snippet-2',
        startTime: 85,
        endTime: 95,
        text: 'OAuth 2.0 provides a secure way to handle authentication.',
        confidence: 0.88
      },
      replies: [],
      isEdited: false,
      isResolved: true,
      tags: ['positive']
    }
  ];

  const allComments = [...mockComments, ...comments];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onCommentAdd?.(newComment, selectedSnippet);
    setNewComment('');
    setSelectedSnippet(null);
  };

  const handleReply = (commentId: string, content: string) => {
    onCommentReply?.(commentId, content);
    setReplyingTo(null);
  };

  const handleEdit = (commentId: string) => {
    const comment = allComments.find(c => c.id === commentId);
    if (comment) {
      setEditContent(comment.content);
      setEditingComment(commentId);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    onCommentEdit?.(commentId, editContent);
    setEditingComment(null);
    setEditContent('');
  };

  const handleDelete = (commentId: string) => {
    onCommentDelete?.(commentId);
  };

  const handleResolve = (commentId: string) => {
    onCommentResolve?.(commentId);
  };

  const handlePlaySnippet = (snippet: AudioSnippet) => {
    onAudioPlay?.(snippet.startTime, snippet.endTime);
  };

  const handleSeekToTime = (time: number) => {
    onTimeSeek?.(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <Card key={comment.id} p="md" withBorder style={{ marginLeft: isReply ? '2rem' : '0' }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <Avatar src={comment.author.avatar} size="sm">
                {comment.author.name.charAt(0)}
              </Avatar>
              <div>
                <Text size="sm" fw={500}>
                  {comment.author.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {getTimeAgo(comment.timestamp)}
                  {comment.isEdited && ' (edited)'}
                </Text>
              </div>
            </Group>
            
            <Group gap="xs">
              {comment.isResolved && (
                <Badge size="xs" color="green" variant="light">
                  Resolved
                </Badge>
              )}
              
              <Menu>
                <Menu.Target>
                  <ActionIcon size="sm" variant="subtle">
                    <IconEdit size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => handleEdit(comment.id)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconReply size={14} />}
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    Reply
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFlag size={14} />}
                    onClick={() => handleResolve(comment.id)}
                  >
                    {comment.isResolved ? 'Unresolve' : 'Mark Resolved'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          {comment.audioSnippet && (
            <Paper p="sm" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
              <Group gap="sm" align="flex-start">
                <ActionIcon
                  size="sm"
                  variant="filled"
                  color="blue"
                  onClick={() => handlePlaySnippet(comment.audioSnippet!)}
                >
                  <IconPlay size={12} />
                </ActionIcon>
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb="xs">
                    <Text size="xs" fw={500}>
                      {formatTime(comment.audioSnippet.startTime)} - {formatTime(comment.audioSnippet.endTime)}
                    </Text>
                    <Badge size="xs" variant="light">
                      {Math.round(comment.audioSnippet.confidence * 100)}%
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    "{comment.audioSnippet.text}"
                  </Text>
                </div>
              </Group>
            </Paper>
          )}

          {isEditing ? (
            <Stack gap="sm">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                minRows={2}
              />
              <Group gap="xs">
                <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                  Cancel
                </Button>
              </Group>
            </Stack>
          ) : (
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Text>
          )}

          {comment.tags.length > 0 && (
            <Group gap="xs">
              {comment.tags.map((tag) => (
                <Badge key={tag} size="xs" variant="light">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}

          {isReplying && (
            <Stack gap="sm">
              <Textarea
                placeholder="Write a reply..."
                minRows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const target = e.target as HTMLTextAreaElement;
                    handleReply(comment.id, target.value);
                  }
                }}
              />
              <Group gap="xs">
                <Button size="sm" onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const textarea = target.closest('.mantine-Stack')?.querySelector('textarea') as HTMLTextAreaElement;
                  if (textarea) {
                    handleReply(comment.id, textarea.value);
                  }
                }}>
                  Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </Group>
            </Stack>
          )}

          {comment.replies.length > 0 && (
            <Stack gap="sm">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </Stack>
          )}
        </Stack>
      </Card>
    );
  };

  const sortedComments = allComments.sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return (a.audioSnippet?.startTime || 0) - (b.audioSnippet?.startTime || 0);
      case 'recent':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'resolved':
        return a.isResolved === b.isResolved ? 0 : a.isResolved ? 1 : -1;
      default:
        return 0;
    }
  });

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            Comments ({allComments.length})
          </Text>
          <Group gap="sm">
            <Button
              size="sm"
              variant="outline"
              leftSection={<IconClock size={14} />}
              onClick={() => setSortBy(sortBy === 'time' ? 'recent' : 'time')}
            >
              Sort by {sortBy === 'time' ? 'Time' : 'Recent'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSnippetModalOpen(true)}
            >
              Add at Current Time
            </Button>
          </Group>
        </Group>

        {/* Add Comment */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Group gap="sm">
              <Avatar src="https://i.pravatar.cc/150?img=4" size="sm">
                You
              </Avatar>
              <Text size="sm" fw={500}>
                Add a comment
              </Text>
            </Group>
            
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              minRows={3}
            />
            
            {selectedSnippet && (
              <Paper p="sm" withBorder style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                <Group gap="sm" align="flex-start">
                  <ActionIcon
                    size="sm"
                    variant="filled"
                    color="green"
                    onClick={() => handlePlaySnippet(selectedSnippet)}
                  >
                    <IconPlay size={12} />
                  </ActionIcon>
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb="xs">
                      <Text size="xs" fw={500}>
                        {formatTime(selectedSnippet.startTime)} - {formatTime(selectedSnippet.endTime)}
                      </Text>
                      <Badge size="xs" variant="light">
                        {Math.round(selectedSnippet.confidence * 100)}%
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                      "{selectedSnippet.text}"
                    </Text>
                  </div>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => setSelectedSnippet(null)}
                  >
                    <IconTrash size={12} />
                  </ActionIcon>
                </Group>
              </Paper>
            )}
            
            <Group gap="sm" justify="space-between">
              <Group gap="sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSnippetModalOpen(true)}
                >
                  Add Audio Snippet
                </Button>
                <Text size="xs" c="dimmed">
                  Current time: {formatTime(currentTime)}
                </Text>
              </Group>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Add Comment
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Comments List */}
        <Stack gap="md">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => renderComment(comment))
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No comments yet. Be the first to add a comment!
            </Text>
          )}
        </Stack>
      </Stack>

      {/* Audio Snippet Modal */}
      <Modal
        opened={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        title="Add Audio Snippet"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select a time range to create an audio snippet for your comment.
          </Text>
          
          <Group gap="sm">
            <TextInput
              label="Start Time"
              placeholder="0:00"
              value={formatTime(currentTime)}
              readOnly
            />
            <TextInput
              label="End Time"
              placeholder="0:30"
              defaultValue="0:30"
            />
          </Group>
          
          <Paper p="sm" withBorder>
            <Text size="sm" fw={500} mb="xs">Preview:</Text>
            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
              "This is a preview of the audio snippet that will be attached to your comment..."
            </Text>
          </Paper>
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setIsSnippetModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Create snippet and close modal
              setIsSnippetModalOpen(false);
            }}>
              Add Snippet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
