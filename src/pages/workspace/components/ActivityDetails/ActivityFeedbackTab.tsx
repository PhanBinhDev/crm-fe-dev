import { IconSearch } from '@tabler/icons-react';
import { Button, InputRef, Space, Typography } from 'antd';
import { useRef, useState } from 'react';
import ActivityFeedbacks from './ActivityFeedbacks';

interface ActivityFeedbackTabProps {
  activityId: string;
}

const ActivityFeedbackTab = ({ activityId }: ActivityFeedbackTabProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'category'>('list');
  const inputRef = useRef<InputRef>(null);

  const handleSearchClick = () => {
    setShowSearch(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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
          position: 'relative',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Activity feedbacks
        </Typography.Title>
        <Space style={{ gap: 0 }}>
          <Button
            onClick={handleSearchClick}
            type="text"
            icon={<IconSearch size={16} stroke={1.5} color="#646464" />}
            style={{ borderRadius: 8 }}
          />
        </Space>
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%' }}>
        <ActivityFeedbacks activityId={activityId} />
      </div>
    </div>
  );
};

export default ActivityFeedbackTab;
