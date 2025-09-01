import { IconHourglassEmpty } from '@tabler/icons-react';
import { Button } from 'antd';

const TimeEstimateActivity = () => {
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
        icon={<IconHourglassEmpty size={12} />}
      >
        Ước lượng
      </Button>
    </>
  );
};

export default TimeEstimateActivity;
