import { IconBan, IconBell, IconChevronLeft } from '@tabler/icons-react';
import { Button, InputNumber, List, Popover, Select, Space, Typography } from 'antd';
import { useState } from 'react';

interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}

interface NotifyActivityProps {
  value: NotifyOption | null;
  onChange: (option: NotifyOption | null) => void;
}

const notifyOptions: NotifyOption[] = [
  { label: 'Đúng hạn', value: 0 },
  { label: 'Trước 10 phút', value: 10 },
  { label: 'Trước 1 giờ', value: 60 },
  { label: 'Không nhắc nhở', value: 'none' },
  { label: 'Tùy chỉnh...', value: 'custom' },
];

const NotifyActivity = ({ value, onChange }: NotifyActivityProps) => {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState(30);
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>('minutes');

  const notifyContent = customOpen ? (
    <Space direction="vertical" style={{ width: '100%', padding: '0 12px 8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 0',
        }}
      >
        <IconChevronLeft
          size={16}
          style={{ cursor: 'pointer' }}
          onClick={() => setCustomOpen(false)}
        />
        <Typography.Text strong style={{ fontSize: 12 }}>
          Thời gian nhắc nhở
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
        style={{ marginTop: 8, width: '100%' }}
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
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography style={{ padding: '3px 12px 0', fontWeight: 600 }}>Thời gian nhắc nhở</Typography>
      <List style={{ paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        {notifyOptions.map(option => (
          <div key={option.value} style={{ padding: '0 8px' }}>
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
            </List.Item>
          </div>
        ))}
      </List>

      <div style={{ padding: '0 8px' }}>
        <Button
          onClick={() => {
            setOpen(false);
            onChange(null);
          }}
          type="text"
          size="small"
          style={{
            color: '#ff4d4f',
            fontSize: 14,
            width: '100%',
            height: 28,
            gap: 2,
            justifyContent: 'flex-start',
            borderRadius: 8,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconBan size={14} style={{ marginRight: 8 }} />}
        >
          Xóa nhắc nhở
        </Button>
      </div>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '8px 0',
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
        style={{
          borderRadius: 6,
          gap: 4,
          color: value ? '#1890ff' : '#838383',
        }}
        icon={<IconBell size={14} />}
      >
        {value ? value.label : 'Thông báo'}
      </Button>
    </Popover>
  );
};

export default NotifyActivity;
