import { Input, Space, Typography } from 'antd';
import { memo, useState } from 'react';

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          onBlur={() => onCountChange(inputValue)}
          onPressEnter={() => onCountChange(inputValue)}
        />
      </div>
    </Space>
  );
};

export default memo(UserCountContent);
