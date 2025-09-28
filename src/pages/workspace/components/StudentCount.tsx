import { useDebounce } from '@/hooks/useDebounce';
import { IconHelpOctagonFilled, IconUser } from '@tabler/icons-react';
import { Button, Input, Popover, Space, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface StudentCountProps {
  value?: number;
  onChange?: (value: number) => void;
}

const StudentCount = ({ value, onChange }: StudentCountProps) => {
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
    return debouncedInput || 'Sinh viên';
  };

  const getButtonColor = () => {
    return debouncedInput ? '#1890ff' : '#838383';
  };

  const studentCountContent = (
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
        Sinh viên tham dự
      </Typography>

      {/* Input */}
      <div
        style={{
          padding: '0 12px 8px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Input
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          onPressEnter={() => setOpen(false)}
        />
      </div>

      {/* Guideline */}
      <div
        style={{
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Tooltip title="Nhập số lượng sinh viên tối đa được phép tham dự sự kiện.">
          <IconHelpOctagonFilled size={14} color="#838383" />
        </Tooltip>

        <Typography.Text
          style={{
            fontSize: 12,
          }}
          type="secondary"
        >
          Enter để xác nhận
        </Typography.Text>
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
          width: 170,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={studentCountContent}
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

export default StudentCount;
