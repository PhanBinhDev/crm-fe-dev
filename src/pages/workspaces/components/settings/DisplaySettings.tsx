import { useDisplayConfig } from '@/contexts/DisplayConfig';
import {
  CalendarOutlined,
  FileTextOutlined,
  FlagOutlined,
  PercentageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Divider, Radio, Slider, Switch, Typography } from 'antd';
import React from 'react';

const { Text, Title } = Typography;

export const DisplaySettings: React.FC = () => {
  const { config, setConfig } = useDisplayConfig();

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const fieldOptions = [
    {
      key: 'showAssignee',
      label: 'Người được giao',
      icon: <UserOutlined />,
      description: 'Hiển thị avatar người được giao việc',
    },
    {
      key: 'showEndTime',
      label: 'Ngày hết hạn',
      icon: <CalendarOutlined />,
      description: 'Hiển thị due date của task',
    },
    {
      key: 'showEstimate',
      label: 'Ước tính thời gian',
      icon: <CalendarOutlined />,
      description: 'Hiển thị due date của task',
    },
    {
      key: 'showPriority',
      label: 'Độ ưu tiên',
      icon: <FlagOutlined />,
      description: 'Hiển thị mức độ ưu tiên (High, Medium, Low)',
    },
    {
      key: 'showDescription',
      label: 'Mô tả',
      icon: <FileTextOutlined />,
      description: 'Hiển thị preview mô tả (tối đa 2 dòng)',
    },
    {
      key: 'showProgress',
      label: 'Tiến độ',
      icon: <PercentageOutlined />,
      description: 'Hiển thị thanh progress bar',
    },
  ];

  return (
    <div style={{ padding: '20px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      {/* Card Fields */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>
          Thông tin hiển thị trên card
        </Title>

        {fieldOptions.map(option => (
          <div key={option.key} style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                backgroundColor: config[option.key as keyof typeof config] ? '#f6ffed' : '#fff',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}
                >
                  {option.icon}
                  <Text strong style={{ fontSize: '13px' }}>
                    {option.label}
                  </Text>
                </div>
                <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>{option.description}</Text>
              </div>
              <Switch
                size="small"
                checked={config[option.key as keyof typeof config] as boolean}
                onChange={value => handleConfigChange(option.key as keyof typeof config, value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '24px 0' }} />

      {/* Card Layout */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>
          Kích thước card
        </Title>
        <Radio.Group
          value={config.cardSize}
          onChange={e => handleConfigChange('cardSize', e.target.value)}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Radio value="compact">Compact</Radio>
            <Radio value="normal">Bình thường</Radio>
            <Radio value="detailed">Chi tiết</Radio>
          </div>
        </Radio.Group>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      {/* Cards per column */}
      <div>
        <Title level={5} style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>
          Số card tối đa mỗi cột
        </Title>
        <div style={{ padding: '0 8px' }}>
          <Slider
            min={5}
            max={50}
            value={config.cardsPerColumn}
            onChange={value => handleConfigChange('cardsPerColumn', value)}
            marks={{ 5: '5', 10: '10', 20: '20', 50: '50+' }}
            tooltip={{ formatter: value => `${value} cards` }}
          />
        </div>
      </div>
    </div>
  );
};
