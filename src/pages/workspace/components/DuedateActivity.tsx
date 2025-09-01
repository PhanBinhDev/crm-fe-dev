import { IconCalendar } from '@tabler/icons-react';
import { Button } from 'antd';

const DuedateActivity = () => {
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
        icon={<IconCalendar size={12} />}
      >
        Hạn
      </Button>
    </>
  );
};

export default DuedateActivity;
