import { Input, Space, Typography } from 'antd';
import { memo, useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface LocationContentProps {
  location: string | undefined;
  onLocationChange: (location: string) => void;
}

const LocationContent = ({ location, onLocationChange }: LocationContentProps) => {
  const [inputValue, setInputValue] = useState<string>(location || '');
  const [debouncedInput] = useDebounceValue(inputValue, 400);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    // onLocationChange(debouncedInput);
  }, [debouncedInput, onLocationChange]);

  return (
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
        Địa điểm tổ chức sự kiện
      </Typography>

      {/* Input */}
      <div
        style={{
          padding: '0 12px 8px',
        }}
      >
        <Input placeholder='vd: "F408"' value={inputValue} onChange={handleInputChange} autoFocus />
      </div>
    </Space>
  );
};

export default memo(LocationContent);
