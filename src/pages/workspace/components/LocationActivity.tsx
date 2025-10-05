import LocationContent from '@/components/shared/LocationContent';
import { useDebounce } from '@/hooks/useDebounce';
import { IconLocation } from '@tabler/icons-react';
import { Button, Input, Popover, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface LocationActivityProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const LocationActivity = ({ value, onChange, error }: LocationActivityProps) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const debouncedInput = useDebounce(inputValue, 400);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      onChange?.('');
      return;
    }
    if (debouncedInput) {
      onChange?.(debouncedInput);
    }
  }, [debouncedInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

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
          color: debouncedInput ? '#1890ff' : '#838383',
          borderColor: error ? '#ff4d4f' : debouncedInput ? '#1890ff' : '#d9d9d9',
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
