import { ActivityPriorityLevel } from '@/common/types';
import PriorityContent from '@/components/shared/PriorityContent';
import { IconFlagFilled } from '@tabler/icons-react';
import { Button, Popover } from 'antd';
import { useState } from 'react';

interface PriorityActivityProps {
  value: ActivityPriorityLevel | null;
  onChange: (option: ActivityPriorityLevel | null) => void;
}

const PriorityActivity = ({ value, onChange }: PriorityActivityProps) => {
  const [open, setOpen] = useState(false);

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
      placement="bottomRight"
      arrow={false}
      content={
        <PriorityContent
          priority={value}
          onChangePriority={option => {
            setOpen(false);
            onChange(option);
          }}
        />
      }
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: '#838383',
          borderColor: value ? value.color : undefined,
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconFlagFilled size={12} color={value ? value.color : undefined} />}
      >
        {value ? value.label : 'Ưu tiên'}
      </Button>
    </Popover>
  );
};

export default PriorityActivity;
