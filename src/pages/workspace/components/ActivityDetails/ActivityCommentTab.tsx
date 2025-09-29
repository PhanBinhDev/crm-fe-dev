import { IconSend2, IconTrash } from '@tabler/icons-react';
import { Avatar, Button, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useRef, useState } from 'react';

interface ActivityCommentTabProps {
  activityId: string;
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
    content: 'cmt',
    createdAt: '28/09/2025 12:30',
  },
];

const ActivityCommentTab = ({ activityId }: ActivityCommentTabProps) => {
  const [comments] = useState<Comment[]>(dummyComments);
  const [newComment, setNewComment] = useState('');
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<any>(null);

  const handleReplyClick = () => {
    setFocused(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
        {comments.map(cmt => (
          <div
            style={{
              marginBottom: 7,
              padding: '10px',
              background: '#ffffffff',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                key={cmt.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  flex: 1,
                }}
              >
                <Avatar>{cmt.author[0]}</Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{cmt.author}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#999',
                      }}
                    >
                      {cmt.createdAt}
                    </div>
                  </div>

                  <div style={{ fontSize: 13, marginBottom: 6 }}>{cmt.content}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 550,
                        cursor: 'pointer',
                        color: '#686868ff',
                      }}
                    >
                      Chỉnh sửa
                    </div>
                    <div
                      onClick={handleReplyClick}
                      style={{
                        fontSize: 12,
                        fontWeight: 550,
                        cursor: 'pointer',
                        color: '#686868ff',
                      }}
                    >
                      Trả lời
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <IconTrash size={14} color="#ff4f4fff" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #e0e0e0ff',
          background: '#f7f7f7ff',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <TextArea
            ref={inputRef}
            placeholder="Nhập bình luận..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            autoSize={focused ? { minRows: 3, maxRows: 6 } : { minRows: 1.45, maxRows: 1.45 }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!newComment.trim()) setFocused(false);
            }}
            style={{ paddingRight: 70 }}
          />

          <Button
            type="primary"
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
