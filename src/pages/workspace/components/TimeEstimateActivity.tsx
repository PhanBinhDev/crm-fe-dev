import EstimateContent from '@/components/shared/EstimateContent';
import { formatMinutesToText } from '@/utils/formatter';
import { parseTimeEstimate } from '@/utils/times';
import { IconHourglassEmpty } from '@tabler/icons-react';
import { Button, Popover } from 'antd';
import { useState } from 'react';

interface TimeEstimateActivityProps {
  value?: string;
  onChange: (value: string) => void;
}

const TimeEstimateActivity = ({ value, onChange }: TimeEstimateActivityProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '12px 0',
          width: 280,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={<EstimateContent estimateTime={value} onEstimateChange={onChange} />}
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
        icon={<IconHourglassEmpty size={12} />}
      >
        {formatMinutesToText(value ? parseTimeEstimate(value)?.minutes || 0 : 0) ||
          'Thời gian ước tính'}
      </Button>
    </Popover>
  );
};

export default TimeEstimateActivity;
