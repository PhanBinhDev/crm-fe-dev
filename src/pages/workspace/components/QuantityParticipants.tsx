import { useDebounce } from '@/hooks/useDebounce';
import { IconUser } from '@tabler/icons-react';
import { Button, Input, Popover, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface QuantityParticipantsProps {
  value?: number;
  onChange?: (value: number) => void;
}

const QuantityParticipants = ({ value, onChange }: QuantityParticipantsProps) => {
  const [inputValue, setInputValue] = useState<number>(value || 0);
  const debouncedInput = useDebounce(inputValue, 400);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!debouncedInput) {
      onChange?.(0);
      return;
    }
    if (debouncedInput) {
      onChange?.(debouncedInput);
    }
  }, [debouncedInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const getButtonText = () => {
    return debouncedInput || 'Người tham dự';
  };

  const getButtonColor = () => {
    return debouncedInput ? '#1890ff' : '#838383';
  };

  const timeEstimateContent = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Typography
        style={{
          padding: '0 12px',
          fontWeight: 600,
        }}
      >
        Tổng số người tham dự
      </Typography>

      {/* Input */}
      <div
        style={{
          padding: '0 12px 8px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Input placeholder='vd: "F408"' value={inputValue} onChange={handleInputChange} autoFocus />
      </div>
    </Space>
  );

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
      content={timeEstimateContent}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: getButtonColor(),
          borderColor: debouncedInput ? '#1890ff' : undefined,
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconUser size={12} />}
      >
        {getButtonText()}
      </Button>
    </Popover>
  );
};

export default QuantityParticipants;
