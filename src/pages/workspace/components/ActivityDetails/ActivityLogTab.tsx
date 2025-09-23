import { IconBell, IconSearch } from '@tabler/icons-react';
import { Button, Input, InputRef, Space, Typography } from 'antd';
import { useRef, useState } from 'react';
import ActivityDetailFilterLog from './ActivityDetailFilterLog';

const ActivityLogTab = () => {
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
          <Button
            type="text"
            style={{
              borderRadius: 8,
              justifyContent: 'flex-start',
              gap: 4,
              padding: '0 8px',
            }}
          >
            <IconBell size={16} stroke={1.5} color="#646464" />
            <span style={{ fontSize: 14, color: '#646464', fontWeight: 500 }}>4</span>
          </Button>
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
    </div>
  );
};

export default ActivityLogTab;
