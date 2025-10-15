import { IFeedback } from '@/common/types/feedback';
import { Card, List, Rate, Space, Typography } from 'antd';
import dayjs from 'dayjs';

interface ActivityFeedbacksProps {
  filteredFeedbacks?: IFeedback[];
}

const ActivityFeedbacks = ({ filteredFeedbacks }: ActivityFeedbacksProps) => {
  if (filteredFeedbacks?.length === 0 || !filteredFeedbacks) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '10px',
          margin: '10px',
          color: '#999',
          borderRadius: 8,
          background: '#f0f0f0',
        }}
      >
        Chưa có đánh giá nào
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '10px',
        margin: '10px',
        overflowY: 'auto',
        maxHeight: '70vh',
      }}
    >
      <List
        dataSource={filteredFeedbacks}
        renderItem={feedback => (
          <List.Item style={{ borderBottom: '1px solid #f0f0f0' }}>
            <Card
              bordered
              style={{
                width: '100%',
                borderRadius: 10,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography.Text style={{ fontSize: 16, flex: 1 }} strong>
                    {feedback.fullName}
                  </Typography.Text>
                  <Rate disabled style={{ fontSize: 8 }} defaultValue={feedback.rating} />
                </div>
                <Typography.Text style={{ fontSize: 14 }}>
                  {feedback.email} - {feedback.studentId}
                </Typography.Text>
              </Space>

              {feedback.comments && (
                <>
                  <Typography.Paragraph
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: '#333',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <b>Bình luận:</b> {feedback.comments}
                  </Typography.Paragraph>
                </>
              )}

              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Gửi lúc: {dayjs(feedback.submittedAt).format('HH:mm DD/MM/YYYY')}
              </Typography.Text>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ActivityFeedbacks;
