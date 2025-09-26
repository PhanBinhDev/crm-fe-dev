import { IconSearch } from '@tabler/icons-react';
import { Button, Input, InputRef, Space, Typography } from 'antd';
import { useRef, useState } from 'react';
import ActivityChangedHistory from './ActivityChangedHistory';
import ActivityDetailFilterLog from './ActivityDetailFilterLog';
import ActivityDetailFollowLog from './ActivityDetailFollowLog';
interface ActivityLogTabProps {
  activityId: string;
}

const ActivityLogTab = ({ activityId }: ActivityLogTabProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const handleSearchClick = () => {
    setShowSearch(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleBlur = () => {
    setShowSearch(false);
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
          Activity
        </Typography.Title>
        <Space style={{ gap: 0 }}>
          <Button
            onClick={handleSearchClick}
            type="text"
            icon={<IconSearch size={16} stroke={1.5} color="#646464" />}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            style={{
              borderRadius: 8,
            }}
          />
          <ActivityDetailFollowLog />
          <ActivityDetailFilterLog />
        </Space>

        {showSearch && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 'calc(100% + 1px)',
              background: '#fff',
              zIndex: 10,
              padding: 12,
              borderBottom: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <Input
              ref={inputRef}
              prefix={<IconSearch size={16} color="#bfbfbf" />}
              placeholder="Search..."
              onBlur={handleBlur}
              allowClear
              style={{ borderRadius: 8, outline: 'none' }}
            />
          </div>
        )}
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%' }}>
        <ActivityChangedHistory activityId={activityId} />
      </div>
    </div>
  );
};

export default ActivityLogTab;
