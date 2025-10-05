import { Input, Space, Typography } from 'antd';
import { memo, useState } from 'react';

interface LocationContentProps {
  location: string | undefined;
  onLocationChange: (location: string) => void;
}

const LocationContent = ({ location, onLocationChange }: LocationContentProps) => {
  const [inputValue, setInputValue] = useState<string>(location || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <Input
          placeholder='vd: "F408"'
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          onBlur={() => onLocationChange(inputValue)}
          onPressEnter={() => onLocationChange(inputValue)}
        />
      </div>
    </Space>
  );
};

export default memo(LocationContent);
