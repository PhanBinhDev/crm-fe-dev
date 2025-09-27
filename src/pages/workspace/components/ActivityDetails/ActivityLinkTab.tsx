import { IconCategory, IconLink, IconList, IconPlus } from '@tabler/icons-react';
import { Button, Input, InputRef, Space, Tooltip, Typography } from 'antd';
import { useRef, useState } from 'react';
import ActivityLinks from './ActivityLinks';

interface ActivityLinkTabProps {
  activityId: string;
}

const ActivityLinkTab = ({ activityId }: ActivityLinkTabProps) => {
  const [showInput, setShowInput] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'category'>('category');
  const inputRef = useRef<InputRef>(null);

  const handleAddLinks = () => {
    setShowInput(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  const handleBlur = () => {
    setShowInput(false);
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
          Liên kết
        </Typography.Title>
        <Space style={{ gap: 2 }}>
          <Tooltip title={'Thêm liên kết'}>
            <Button
              onClick={handleAddLinks}
              type="text"
              styles={{
                icon: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              }}
              icon={<IconPlus size={16} stroke={1.5} color="#646464" />}
              style={{
                borderRadius: 8,
              }}
            />
          </Tooltip>
          <Button
            onClick={() => setViewMode('category')}
            type={'text'}
            icon={<IconCategory size={16} stroke={1.5} color="#646464" />}
            style={{
              borderRadius: 8,
              background: viewMode === 'category' ? '#f0f0f0' : undefined,
            }}
            styles={{
              icon: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
          />
          <Button
            onClick={() => setViewMode('list')}
            type={'text'}
            icon={<IconList size={16} stroke={1.5} color="#646464" />}
            style={{
              borderRadius: 8,
              background: viewMode === 'list' ? '#f0f0f0' : undefined,
            }}
            styles={{
              icon: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
          />
        </Space>
        {showInput && (
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
              prefix={<IconLink size={16} color="#bfbfbf" />}
              placeholder="Nhập liên kết..."
              onBlur={handleBlur}
              allowClear
              style={{ borderRadius: 8, outline: 'none' }}
            />
          </div>
        )}
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%' }}>
        <ActivityLinks activityId={activityId} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default ActivityLinkTab;
