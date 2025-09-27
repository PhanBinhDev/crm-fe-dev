import { Typography } from 'antd';
interface ActivityCommentTabProps {
  activityId: string;
}

const ActivityCommentTab = ({ activityId }: ActivityCommentTabProps) => {
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
          height: '100%',
          padding: 8,
          maxHeight: 'calc(90vh - 97px)',
          overflowY: 'auto',
        }}
      ></div>
    </div>
  );
};

export default ActivityCommentTab;
