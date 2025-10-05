import LocationContent from '@/components/shared/LocationContent';
import { IconLocation } from '@tabler/icons-react';
import { Button, Popover } from 'antd';
import { useState } from 'react';

interface LocationActivityProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const LocationActivity = ({ value, onChange, error }: LocationActivityProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const getButtonText = () => {
    return value || 'Địa điểm';
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '12px 0',
          width: 210,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={<LocationContent location={value} onLocationChange={onChange} />}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: '#838383',
          borderColor: error ? '#ff4d4f' : '#d9d9d9',
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconLocation size={12} />}
      >
        {getButtonText()}
      </Button>
    </Popover>
  );
};

export default LocationActivity;
