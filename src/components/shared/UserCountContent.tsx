import { Input, Space, Typography } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface UserCountContentProps {
  count: number | undefined;
  onCountChange: (count: number) => void;
  title: string;
}

const UserCountContent = ({
  count,
  onCountChange,
  title = 'người tham gia',
}: UserCountContentProps) => {
  const [inputValue, setInputValue] = useState<number>(count || 0);
  const [debouncedInput] = useDebounceValue(inputValue, 500);

  const isUserInput = useRef(false);

  useEffect(() => {
    if (!isUserInput.current && count !== inputValue) {
      setInputValue(count || 0);
    }
  }, [count]);

  useEffect(() => {
    if (isUserInput.current && debouncedInput !== count) {
      onCountChange(debouncedInput);
    }
    isUserInput.current = false;
  }, [debouncedInput, onCountChange, count]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true;
    setInputValue(Number(e.target.value));
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
        Ước lượng số {title}
      </Typography>

      <div
        style={{
          padding: '0 12px 8px',
        }}
      >
        <Input
          type="number"
          placeholder='vd: "F408"'
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
        />
      </div>
    </Space>
  );
};

export default memo(UserCountContent);
