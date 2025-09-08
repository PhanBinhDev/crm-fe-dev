import { ActivityPriorityLevel } from '@/common/types';
import { activityPriorityFilterOptions } from '@/constants';
import { IconBan, IconCheck, IconFlagFilled } from '@tabler/icons-react';
import { Button, List, Popover, Space, Typography } from 'antd';
import { useState } from 'react';

interface PriorityActivityProps {
  onSelect: (option: ActivityPriorityLevel | null) => void;
}

const PriorityActivity = ({ onSelect }: PriorityActivityProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<ActivityPriorityLevel | null>(null);

  const priorityContent = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Typography
        style={{
          padding: '3px 12px 0',
          fontWeight: 600,
        }}
      >
        Mức độ ưu tiên
      </Typography>

      <List
        style={{
          paddingBottom: 8,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {activityPriorityFilterOptions.map(option => (
          <div
            key={option.value}
            style={{
              padding: '0 8px',
            }}
          >
            <List.Item
              onClick={() => {
                setSelectedPriority(option);
                setOpen(false);
                onSelect(option);
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderBottom: '0',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                maxHeight: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'flex-start',
                background: selectedPriority?.value === option.value ? '#f5f7fa' : 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f1f1f1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <IconFlagFilled size={16} style={{ marginRight: 8, color: option.color }} />
              {option.label}

              {selectedPriority?.value === option.value && (
                <IconCheck style={{ marginLeft: 'auto', color: '#202020' }} size={14} />
              )}
            </List.Item>
          </div>
        ))}
      </List>

      <div
        style={{
          padding: '0 8px',
        }}
      >
        <Button
          onClick={() => {
            setSelectedPriority(null);
            setOpen(false);
            onSelect(null);
          }}
          type="text"
          size="small"
          style={{
            color: '#ff4d4f',
            fontSize: 14,
            width: '100%',
            height: 28,
            gap: 2,
            justifyContent: 'flex-start',
            borderRadius: 8,
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          icon={<IconBan size={12} style={{ marginRight: 8 }} />}
        >
          Xóa ưu tiên
        </Button>
      </div>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '8px 0',
          width: 185,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={priorityContent}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: '#838383',
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={
          <IconFlagFilled size={12} color={selectedPriority ? selectedPriority.color : undefined} />
        }
      >
        {selectedPriority ? selectedPriority.label : 'Ưu tiên'}
      </Button>
    </Popover>
  );
};

export default PriorityActivity;
