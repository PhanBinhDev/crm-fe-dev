import CustomCalendar from '@/components/shared/Calendar';
import { IconCalendar } from '@tabler/icons-react';
import { Button, Input, Popover, Space } from 'antd';

import { DayPicker } from 'react-day-picker';

const PresetDateSelect = () => {
  return (
    <div
      style={{
        width: 170,
        height: '100%',
        padding: 8,
      }}
    >
      Preset
    </div>
  );
};

const DuedateActivity = () => {
  return (
    <Popover
      styles={{
        body: {
          padding: 0,
          width: 480,
        },
      }}
      content={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
          }}
        >
          {/* Two input range */}
          <Space
            style={{
              padding: 8,
              borderBottom: '1px solid #f0f0f0',
            }}
            styles={{
              item: {
                width: '50%',
              },
            }}
          >
            <Input
              variant="borderless"
              style={{
                backgroundColor: '#f6f6f6',
                border: '1px solid transparent',
              }}
              onFocus={e => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.border = '1px solid #1890ff';
                }
              }}
              onBlur={e => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.border = '1px solid transparent';
                }
              }}
              placeholder="Từ ngày"
              prefix={<IconCalendar size={16} />}
            />
            <Input
              variant="borderless"
              style={{
                backgroundColor: '#f6f6f6',
              }}
              onFocus={e => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.border = '1px solid #1890ff';
                }
              }}
              onBlur={e => {
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.style.border = '1px solid transparent';
                }
              }}
              placeholder="Đến ngày"
              prefix={<IconCalendar size={16} />}
            />
          </Space>
          {/* content */}

          <Space
            styles={{
              item: {
                height: '100%',
              },
            }}
          >
            <PresetDateSelect />
            <div
              style={{
                flex: 1,
                borderLeft: '1px solid #f0f0f0',
              }}
            >
              <CustomCalendar mode="range" />
            </div>
          </Space>

          {/* Left side is a preset */}
          {/* right side is a date picker */}
        </div>
      }
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
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
        icon={<IconCalendar size={12} />}
      >
        Hạn
      </Button>
    </Popover>
  );
};

export default DuedateActivity;
