import { IconFilter2 } from '@tabler/icons-react';
import { Button, Popover, Space, Typography } from 'antd';
import ActivityFeedbacks from './ActivityFeedbacks';

interface ActivityFeedbackTabProps {
  activityId: string;
}

const ActivityFeedbackTab = ({ activityId }: ActivityFeedbackTabProps) => {
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
          Đánh giá và Phản hồi
        </Typography.Title>
        <Space style={{ gap: 0 }}>
          <Popover
            placement="bottomRight"
            content={<div style={{ width: 200 }}>Lọc đánh giá và phản hồi</div>}
            trigger={['click']}
            arrow={false}
          >
            <Button
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              type="text"
              icon={<IconFilter2 size={16} stroke={1.5} color="#646464" />}
              style={{ borderRadius: 8 }}
            />
          </Popover>
        </Space>
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%' }}>
        <ActivityFeedbacks activityId={activityId} />
      </div>
    </div>
  );
};

export default ActivityFeedbackTab;
