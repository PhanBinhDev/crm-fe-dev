import { IconBell } from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';

const NotificationActivityBtn = () => {
  return (
    <Tooltip title="Người theo dõi">
      <Button
        type="text"
        style={{
          width: 'fit-content',
          padding: '0 8px',
          color: '#838383',
          gap: 4,
          borderRadius: 8,
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconBell size={16} />}
      >
        <span
          style={{
            fontSize: 12,
            lineHeight: '16px',
            color: '#838383',
          }}
        >
          10
        </span>
      </Button>
    </Tooltip>
  );
};

export default NotificationActivityBtn;
