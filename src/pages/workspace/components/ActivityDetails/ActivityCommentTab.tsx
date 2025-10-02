import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useCreate, useDelete, useList, useUpdate } from '@refinedev/core';
import { IconSend2, IconTrash } from '@tabler/icons-react';
import { Avatar, Button, message, Popconfirm, Skeleton, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRef, useState } from 'react';
dayjs.extend(relativeTime);
dayjs.locale('vi');

interface ActivityCommentTabProps {
  activityId: string;
}

interface Comment {
  id: string;
  user: { avatar: string; name: string };
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  replies?: Comment[];
}

const ActivityCommentTab = ({ activityId }: ActivityCommentTabProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<any>(null);

  const { mutate: createComment, isLoading: isCreating } = useCreate();
  const { mutate: updateComment } = useUpdate();
  const { mutate: deleteComment } = useDelete();
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
  });

  if (isLoading) {
    return (
      <div style={{ padding: 10 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  const buildCommentsTree = (comments: Comment[]) => {
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    comments.forEach(c => {
      map.set(c.id, { ...c, replies: [] });
    });

    map.forEach(cmt => {
      if (cmt.parentCommentId) {
        const parent = map.get(cmt.parentCommentId);
        if (parent) {
          parent.replies?.push(cmt);
        }
      } else {
        roots.push(cmt);
      }
    });

    return roots;
  };

  const organizedComments = buildCommentsTree(comments?.data || []);

  const handleReplyClick = (parentId: string) => {
    setReplyToId(parentId);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSendComment = () => {
    if (!commentContent.trim()) return;

    const values = {
      activityId,
      content: commentContent,
      parentCommentId: replyToId || '',
    };

    createComment(
      {
        resource: `activities/comments`,
        values,
      },
      {
        onSuccess: () => {
          setCommentContent('');
          setReplyToId(null);
          setFocused(false);
          refetch();
          message.success(replyToId ? 'Đã trả lời' : 'Đã bình luận');
        },
        onError: error => {
          console.error('Error creating comment:', error);
          message.error('Gửi thất bại');
        },
      },
    );
  };

  const handleSaveEdit = (id: string) => {
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
          setEditingId(null);
          setEditingContent('');
        },
        onError: () => {
          message.error('Cập nhật bình luận thất bại');
        },
      },
    );
  };

  const handleStartEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditingContent(currentContent);
  };

  const handleDelete = (id: string) => {
    deleteComment(
      {
        resource: `activities/${activityId}/comments`,
        id,
      },
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
    const now = dayjs();
    const createdAt = dayjs(cmt.createdAt);
    const isWithinOneWeek = now.diff(createdAt, 'days') < 7;
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
            {cmt.user?.avatar ? (
              <Avatar size={isReply ? 32 : 40} src={cmt.user?.avatar} />
            ) : (
              <Avatar
                size="small"
                style={{
                  backgroundColor: getColorFromName(cmt.user.name || AVATAR_PLACEHOLDER),
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(cmt.user.name)}
              </Avatar>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cmt.user.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>
                  {isWithinOneWeek ? createdAt.fromNow() : createdAt.format('DD/MM/YYYY HH:mm')}
                </div>
              </div>

              <div style={{ fontSize: 13, marginBottom: 6 }}>
                {editingId === cmt.id ? (
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {editingId === cmt.id ? (
                  <>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 550,
                        cursor: 'pointer',
                        color: '#1890ff',
                      }}
                      onClick={() => handleSaveEdit(cmt.id)}
                    >
                      Lưu
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 550,
                        cursor: 'pointer',
                        color: '#686868ff',
                      }}
                      onClick={() => setEditingId(null)}
                    >
                      Hủy
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 550,
                        cursor: 'pointer',
                        color: '#686868ff',
                      }}
                      onClick={() => handleStartEdit(cmt.id, cmt.content)}
                    >
                      Chỉnh sửa
                    </span>

                    {!isReply && (
                      <span
                        onClick={() => handleReplyClick(cmt.id)}
                        style={{
                          fontSize: 12,
                          fontWeight: 550,
                          cursor: 'pointer',
                          color: '#686868ff',
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

          <div>
            <Popconfirm
              title="Xác nhận xóa bình luận?"
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(cmt.id)}
            >
              <IconTrash size={14} color="#ff4f4fff" style={{ cursor: 'pointer' }} />
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 8px 8px 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Bình luận
        </Typography.Title>
      </div>

      <div
        style={{
          background: '#f7f7f7ff',
          flex: 1,
          padding: '5px 10px 10px 10px',
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
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Chưa có bình luận
          </div>
        )}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #e0e0e0ff',
          background: '#f7f7f7ff',
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
            loading={isCreating}
            onClick={handleSendComment}
            style={{
              position: 'absolute',
              right: 6,
              bottom: 5,
              height: 32,
            }}
          >
            <IconSend2 />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCommentTab;
