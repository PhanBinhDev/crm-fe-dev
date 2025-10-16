import { NotifyOption } from '@/common/types';
import { IconAlarm, IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { Button, InputNumber, List, Popover, Select, Space, Typography } from 'antd';
import { useState } from 'react';

interface NotifyActivityProps {
  value: NotifyOption;
  onChange: (option: NotifyOption) => void;
}

const notifyOptions: NotifyOption[] = [
  { label: 'Đúng giờ', value: 0 },
  { label: 'Trước 10 phút', value: 10 },
  { label: 'Trước 1 giờ', value: 60 },
  { label: 'Tùy chỉnh...', value: 'custom' },
];

const NotifyActivity = ({ value, onChange }: NotifyActivityProps) => {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState(30);
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>('minutes');

  const notifyContent = customOpen ? (
    <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Button
          type="text"
          size="small"
          style={{
            padding: '0 4px',
            borderRadius: 7,
          }}
        >
          <IconChevronLeft
            size={14}
            style={{ cursor: 'pointer' }}
            onClick={() => setCustomOpen(false)}
          />
        </Button>
        <Typography.Text strong style={{ fontSize: 13 }}>
          Tùy chỉnh
        </Typography.Text>
      </div>

      <Space>
        <InputNumber
          size="small"
          min={1}
          value={customValue}
          onChange={v => setCustomValue(v || 1)}
        />
        <Select
          size="small"
          value={customUnit}
          onChange={v => setCustomUnit(v)}
          options={[
            { label: 'phút', value: 'minutes' },
            { label: 'giờ', value: 'hours' },
          ]}
          style={{ width: 80 }}
        />
      </Space>

      <Button
        type="primary"
        size="small"
        style={{ marginTop: 8, width: '100%', height: 28, borderRadius: 8 }}
        onClick={() => {
          const minutes = customUnit === 'minutes' ? customValue : customValue * 60;
          onChange({
            label: `Trước ${customValue} ${customUnit === 'minutes' ? 'phút' : 'giờ'}`,
            value: minutes,
          });
          setCustomOpen(false);
          setOpen(false);
        }}
      >
        Xong
      </Button>
    </Space>
  ) : (
    <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
      <Typography style={{ fontWeight: 600, paddingLeft: 6 }}>Thời gian nhắc nhở</Typography>
      <List>
        {notifyOptions.map(option => (
          <div key={option.value}>
            <List.Item
              onClick={() => {
                if (option.value === 'custom') {
                  setCustomOpen(true);
                } else {
                  onChange(option);
                  setOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderBottom: '0',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                maxHeight: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'flex-start',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f1f1')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {option.label}

              {option.value === value?.value && (
                <IconCheck size={14} style={{ marginLeft: 'auto', color: '#838383' }} />
              )}
            </List.Item>
          </div>
        ))}
      </List>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: 0,
          width: 200,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={notifyContent}
    >
      <Button
        size="small"
        type="text"
        style={{
          borderRadius: 6,
          gap: 4,
          color: '#838383',
          border: '1px solid #d9d9d9',
        }}
        icon={<IconAlarm size={14} />}
      >
        {value ? value.label : 'Nhắc trước...'}
      </Button>
    </Popover>
  );
};

export default NotifyActivity;
