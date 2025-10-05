import { Input, Space, Typography } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface LocationContentProps {
  location: string | undefined;
  onLocationChange: (location: string) => void;
}

const LocationContent = ({ location, onLocationChange }: LocationContentProps) => {
  const [inputValue, setInputValue] = useState<string>(location || '');
  const [debouncedInput] = useDebounceValue(inputValue, 500);

  const isUserInput = useRef(false);

  useEffect(() => {
    if (!isUserInput.current && location !== inputValue) {
      setInputValue(location || '');
    }
  }, [location]);

  useEffect(() => {
    if (isUserInput.current && debouncedInput !== location && debouncedInput) {
      onLocationChange(debouncedInput);
    }
    isUserInput.current = false;
  }, [debouncedInput, onLocationChange, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true;
    setInputValue(e.target.value);
  };

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
