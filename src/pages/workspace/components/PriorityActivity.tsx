import { IconFlag } from '@tabler/icons-react';
import { Button } from 'antd';

const PriorityActivity = () => {
  return (
    <>
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: '#838383',
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconFlag size={12} />}
      >
        Ưu tiên
      </Button>
    </>
  );
};

export default PriorityActivity;
