import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { formatTime } from '@/services/utils/formatter';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useCreate, useCustomMutation, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconHeart, IconSend2, IconTrash } from '@tabler/icons-react';
import { Avatar, Button, message, Popconfirm, Skeleton, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserPopover } from './../../../users/list/components/UserPopover';

interface ActivityCommentTabProps {
  activityId: string;
}

type ReactionType = 'like' | null;

interface Comment {
  id: string;
  user: { id: string; avatar: string; name: string };
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  replies?: Comment[];
  reactions?: Record<string, boolean>;
  reactionCounts?: Record<string, number>;
  reactionSummary?: Record<string, number>;
  currentUserReaction?: ReactionType;
  hasUserReacted?: boolean;
  totalReactions?: number;
}

const ActivityCommentTab = ({ activityId }: ActivityCommentTabProps) => {
  const { user: currentUser } = useAuth();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<any>(null);

  const { mutate: createComment } = useCreate();
  const { mutate: updateComment } = useUpdate();
  const { mutate: deleteComment } = useDelete();
  const { mutate: updateReactionComments } = useCustomMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const {
    data: comments,
    refetch,
    isLoading,
  } = useList<Comment>({
    resource: `activities/${activityId}/comments`,
    queryOptions: { refetchInterval: false },
  });

  const [localComments, setLocalComments] = useState<Comment[]>([]);
  useEffect(() => {
    if (!comments) return;
    const raw = Array.isArray(comments.data)
      ? comments.data
      : Array.isArray((comments as any).data?.data)
        ? (comments as any).data.data
        : [];

    if (raw.length) {
      setLocalComments(raw as Comment[]);
    }
  }, [comments]);

  const SKELETON_COUNT = 3;
  const updateCommentReaction = (
    comments: Comment[],
    id: string,
    updated: Partial<Comment>,
  ): Comment[] => {
    return comments.map(c => {
      if (c.id === id) return { ...c, ...updated };
      if (c.replies && c.replies.length) {
        return { ...c, replies: updateCommentReaction(c.replies, id, updated) };
      }
      return c;
    });
  };
  const handleToggleTym = async (commentId: string) => {
    if (!currentUser?.id) {
      message.error('Không xác định người dùng hiện tại');
      return;
    }

    const parentComment = localComments.find(
      c => c.id === commentId || c.replies?.some(r => r.id === commentId),
    );
    const current =
      parentComment?.id === commentId
        ? parentComment
        : parentComment?.replies?.find(r => r.id === commentId);

    if (!current) return;

    const prevHasReacted = !!current.hasUserReacted;
    const prevCount = current.totalReactions || 0;
    const nextHasReacted = !prevHasReacted;
    const nextCount = Math.max(prevCount + (nextHasReacted ? 1 : -1), 0);

    const prevState = [...localComments];

    setLocalComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          return { ...c, hasUserReacted: nextHasReacted, totalReactions: nextCount };
        }
        if (c.replies?.find(r => r.id === commentId)) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === commentId) {
                return { ...r, hasUserReacted: nextHasReacted, totalReactions: nextCount };
              }
              return r;
            }),
          };
        }
        return c;
      }),
    );

    updateReactionComments(
      {
        url: `activities/${activityId}/comments/${commentId}/reactions`,
        method: 'post',
        values: {
          type: 'like',
        },
      },
      {
        onSuccess: () => {
          refetch();
          message.success('Cập nhật bình luận thành công');
        },
        onError: () => {
          message.error('Cập nhật bình luận thất bại');
          setLocalComments(prevState);
        },
      },
    );
  };

  const buildCommentsTree = (list: Comment[]) => {
    if (!list || !Array.isArray(list)) return [];
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];
    list.forEach(c =>
      map.set(c.id, {
        ...c,
        replies: Array.isArray(c.replies) ? c.replies : [],
      }),
    );
    list.forEach(c => {
      const parentId = c.parentCommentId;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.replies!.push(map.get(c.id)!);
      } else if (!parentId || parentId === '' || parentId === null) {
        roots.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  };

  const organizedComments = buildCommentsTree(localComments);

  const handleReplyClick = (parentId: string) => {
    setReplyToId(parentId);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSendComment = async () => {
    if (!commentContent.trim()) return;

    const tempId = uuidv4();
    const now = new Date().toISOString();

    const optimisticComment: Comment = {
      id: tempId,
      user: {
        id: currentUser?.id!,
        name: currentUser?.name || 'Bạn',
        avatar: currentUser?.avatar || '',
      },
      content: commentContent.trim(),
      createdAt: now,
      parentCommentId: replyToId || null,
      replies: [],
      hasUserReacted: false,
      totalReactions: 0,
    };

    // Cập nhật UI ngay lập tức
    setLocalComments(prev => {
      if (replyToId) {
        return prev.map(c =>
          c.id === replyToId ? { ...c, replies: [...(c.replies || []), optimisticComment] } : c,
        );
      }
      return [...prev, optimisticComment];
    });

    setCommentContent('');
    setReplyToId(null);
    setFocused(false);

    const values = {
      activityId,
      content: commentContent.trim(),
      parentCommentId: replyToId || null,
    };

    createComment(
      {
        resource: 'activities/comments',
        values,
      },
      {
        onSuccess: () => {
          message.success('Gửi bình luận thành công');
          refetch();
        },
        onError: error => {
          console.error('Error creating comment:', error);
          message.error('Không thể gửi bình luận. Vui lòng thử lại.');
        },
      },
    );
  };

  const handleSaveEdit = (id: string) => {
    const prevState = _.cloneDeep(localComments);

    setLocalComments(prev =>
      prev.map(parent => {
        if (parent.id === id) {
          return { ...parent, content: editingContent };
        }
        if (parent.replies?.some(reply => reply.id === id)) {
          return {
            ...parent,
            replies: parent.replies.map(reply =>
              reply.id === id ? { ...reply, content: editingContent } : reply,
            ),
          };
        }
        return parent;
      }),
    );
    setEditingId(null);

    updateComment(
      {
        resource: `activities/${activityId}/comments`,
        id,
        values: { content: editingContent },
      },
      {
        onSuccess: () => {
          refetch();
          message.success('Cập nhật bình luận thành công');
          setEditingContent('');
        },
        onError: () => {
          message.error('Cập nhật bình luận thất bại');
          // khôi phục
          setLocalComments(prevState);
        },
      },
    );
  };

  const handleStartEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditingContent(currentContent);
  };

  const handleDelete = (id: string) => {
    setLocalComments(prev =>
      prev
        .filter(parent => parent.id !== id)
        .map(parent => ({
          ...parent,
          replies: parent.replies?.filter(reply => reply.id !== id) || [],
        })),
    );

    deleteComment(
      { resource: `activities/${activityId}/comments`, id },
      {
        onSuccess: () => {
          refetch();
          message.success('Xóa thành công');
        },
        onError: () => {
          message.error('Xóa thất bại');
        },
      },
    );
  };

  const renderComment = (cmt: Comment, isReply = false) => {
    const isAuthor = cmt.user.id === currentUser?.id;
    const hasReacted = !!cmt.hasUserReacted;
    const count = cmt.totalReactions || 0;
    const anyoneReacted = count > 0;

    const color = hasReacted ? '#ff4d4f' : anyoneReacted ? '#ff4d4f' : '#999';
    const fill = hasReacted ? color : 'none';

    return (
      <div
        key={cmt.id}
        style={{
          marginBottom: 7,
          marginLeft: isReply ? 40 : 0,
          padding: '10px',
          background: '#fff',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
            <UserPopover userId={cmt.user.id}>
              {cmt.user?.avatar ? (
                <Avatar size={isReply ? 24 : 28} src={cmt.user?.avatar} />
              ) : (
                <Avatar
                  size={isReply ? 24 : 28}
                  style={{
                    backgroundColor: getColorFromName(cmt.user.name || AVATAR_PLACEHOLDER),
                    color: '#fff',
                    fontWeight: 'bold',
                    border: 'none',
                  }}
                >
                  {getInitials(cmt.user.name)}
                </Avatar>
              )}
            </UserPopover>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cmt.user.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>
                  <Tooltip title={dayjs(cmt.createdAt).format('DD/MM/YYYY HH:mm')}>
                    {formatTime(cmt.createdAt)}
                  </Tooltip>
                </div>
              </div>

              <div style={{ fontSize: 13, marginBottom: 6 }}>
                {isAuthor && editingId === cmt.id ? (
                  <TextArea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    onPressEnter={e => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSaveEdit(cmt.id);
                      }
                    }}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    style={{ resize: 'none' }}
                  />
                ) : (
                  cmt.content
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                    transition: 'transform 0.12s ease, color 0.2s ease',
                  }}
                  onClick={() => handleToggleTym(cmt.id)}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <IconHeart size={16} color={color} fill={fill} />
                  <span style={{ fontSize: 12, color: '#555' }}>{count}</span>
                </div>
                {editingId === cmt.id ? (
                  <>
                    <span
                      style={{ fontSize: 12, fontWeight: 550, cursor: 'pointer', color: '#1890ff' }}
                      onClick={() => handleSaveEdit(cmt.id)}
                    >
                      Lưu
                    </span>
                    <span
                      style={{ fontSize: 12, fontWeight: 550, cursor: 'pointer', color: '#686868' }}
                      onClick={() => setEditingId(null)}
                    >
                      Hủy
                    </span>
                  </>
                ) : (
                  <>
                    {isAuthor && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 550,
                          cursor: 'pointer',
                          color: '#686868',
                        }}
                        onClick={() => handleStartEdit(cmt.id, cmt.content)}
                      >
                        Chỉnh sửa
                      </span>
                    )}

                    {!isReply && (
                      <span
                        onClick={() => handleReplyClick(cmt.id)}
                        style={{
                          fontSize: 12,
                          fontWeight: 550,
                          cursor: 'pointer',
                          color: '#686868',
                        }}
                      >
                        Trả lời
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {isAuthor && (
            <div>
              <Popconfirm
                title="Xác nhận xóa bình luận?"
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(cmt.id)}
              >
                <IconTrash size={14} color="#ff4f4f" style={{ cursor: 'pointer' }} />
              </Popconfirm>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '5px 10px 10px 10px', background: '#f7f7f7', flex: 1 }}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <div
              style={{ display: 'flex', gap: 8, padding: 10, background: '#fff', borderRadius: 8 }}
            >
              <Skeleton.Avatar active size={40} shape="circle" style={{ marginTop: 5 }} />
              <Skeleton
                active
                title={false}
                paragraph={{ rows: 2, width: ['90%', '50%'] }}
                style={{ flex: 1, marginTop: 5 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: '#f7f7f7',
          flex: 1,
          padding: 10,
          overflowY: 'auto',
        }}
      >
        {organizedComments.length ? (
          organizedComments.map(cmt => (
            <div key={cmt.id}>
              {renderComment(cmt)}
              {cmt.replies?.map(reply => renderComment(reply, true))}
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#999',
              borderRadius: 8,
              background: '#f0f0f0',
            }}
          >
            Chưa có bình luận
          </div>
        )}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #e0e0e0',
          background: '#f7f7f7',
        }}
      >
        {replyToId && (
          <div
            style={{
              fontSize: 12,
              color: '#666',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Đang trả lời...</span>
            <span
              onClick={() => setReplyToId(null)}
              style={{ color: '#1890ff', cursor: 'pointer' }}
            >
              Hủy
            </span>
          </div>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          <TextArea
            ref={inputRef}
            placeholder={replyToId ? 'Nhập trả lời...' : 'Nhập bình luận...'}
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            autoSize={focused ? { minRows: 3, maxRows: 6 } : { minRows: 1.45, maxRows: 1.45 }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!commentContent.trim()) setFocused(false);
            }}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
            style={{ paddingRight: 70 }}
          />

          <Button
            type="primary"
            // loading={isCreating}
            onClick={handleSendComment}
            style={{
              position: 'absolute',
              right: 6,
              bottom: 5,
              height: 32,
            }}
          >
            <IconSend2 size={16} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ActivityCommentTab;
