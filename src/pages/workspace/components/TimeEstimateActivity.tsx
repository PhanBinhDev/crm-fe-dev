import { IconHelpOctagonFilled, IconHourglassEmpty } from '@tabler/icons-react';
import { Button, Input, Popover, Space, Tooltip, Typography } from 'antd';

const TimeEstimateActivity = () => {
  const timeEstimateContent = (
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
        Ước lượng thời gian
      </Typography>

      {/* input */}
      <div
        style={{
          padding: '0 12px 8px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Input placeholder='vd: "2h", "30m"' />
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
        <Tooltip title='Sử dụng ngôn ngữ tự nhiên để thêm ước lượng thời gian bằng phút, giờ, ngày, tuần hoặc tháng. Hãy thử nhập như "1h" hoặc "1d"'>
          <IconHelpOctagonFilled size={14} color="#838383" />
        </Tooltip>

        <Typography.Text
          style={{
            fontSize: 12,
          }}
          type="secondary"
        >
          Thay đổi sẽ tự động lưu
        </Typography.Text>
      </div>
    </Space>
  );
  return (
    <Popover
      styles={{
        body: {
          padding: '12px 0',
          width: 250,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={timeEstimateContent}
    >
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
    </Popover>
  );
};

export default TimeEstimateActivity;
