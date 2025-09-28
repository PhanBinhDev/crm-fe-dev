import { Avatar, Button, Skeleton, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';

interface ActivityCommentTabProps {
  activityId: string;
  loading?: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

const dummyComments: Comment[] = [
  {
    id: '1',
    author: 'Diễm',
    content: 'Công việc này cần bổ sung thêm chi tiết deadline.',
    createdAt: '28/09/2025 12:30',
  },
  {
    id: '2',
    author: 'Huy',
    content: 'Đã cập nhật file tài liệu mới.',
    createdAt: '28/09/2025 13:00',
  },
];

const ActivityCommentTab = ({ activityId, loading }: ActivityCommentTabProps) => {
  const [comments, setComments] = useState<Comment[]>(dummyComments);
  const [newComment, setNewComment] = useState('');
  const [focused, setFocused] = useState(false);

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
          position: 'relative',
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
          padding: 12,
          overflowY: 'auto',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <Skeleton.Avatar active size="large" shape="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 6 }} />
                  <Skeleton paragraph={{ rows: 2, width: ['80%', '60%'] }} active />
                </div>
              </div>
            ))}
          </div>
        ) : (
          comments.map(cmt => (
            <div
              key={cmt.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 16,
                paddingBottom: '10px',
                borderBottom: '1px solid #e0e0e0ff',
              }}
            >
              <Avatar>{cmt.author[0]}</Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cmt.author}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#999',
                    marginBottom: 3,
                  }}
                >
                  {cmt.createdAt}
                </div>
                <div style={{ fontSize: 13 }}>{cmt.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: 8,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        <TextArea
          placeholder="Nhập bình luận..."
          autoSize={focused ? { minRows: 3, maxRows: 6 } : { minRows: 1, maxRows: 1 }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!newComment.trim()) setFocused(false);
          }}
        />
        {focused && <Button type="primary">Gửi</Button>}
      </div>
    </div>
  );
};

export default ActivityCommentTab;
