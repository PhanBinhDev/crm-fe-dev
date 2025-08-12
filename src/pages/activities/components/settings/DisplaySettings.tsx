import React, { useState } from 'react';
import { Switch, Divider, Radio, Slider, Typography } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  TagOutlined,
  FileTextOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface DisplayConfig {
  showAssignee: boolean;
  showDueDate: boolean;
  showPriority: boolean;
  showTags: boolean;
  showDescription: boolean;
  showProgress: boolean;
  cardSize: 'compact' | 'normal' | 'detailed';
  cardsPerColumn: number;
}

export const DisplaySettings: React.FC = () => {
  const [config, setConfig] = useState<DisplayConfig>({
    showAssignee: true,
    showDueDate: true,
    showPriority: true,
    showTags: true,
    showDescription: false,
    showProgress: true,
    cardSize: 'normal',
    cardsPerColumn: 10,
  });

  const handleConfigChange = (key: keyof DisplayConfig, value: any) => {
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
      key: 'showDueDate',
      label: 'Ngày hết hạn',
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
      key: 'showTags',
      label: 'Nhãn/Tags',
      icon: <TagOutlined />,
      description: 'Hiển thị các tags được gán',
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
                backgroundColor: config[option.key as keyof DisplayConfig] ? '#f6ffed' : '#fff',
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
                checked={config[option.key as keyof DisplayConfig] as boolean}
                onChange={value => handleConfigChange(option.key as keyof DisplayConfig, value)}
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
            <Radio value="compact">
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>Compact</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Hiển thị tối thiểu thông tin, tiết kiệm không gian
                </div>
              </div>
            </Radio>
            <Radio value="normal">
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>Bình thường</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Cân bằng giữa thông tin và không gian
                </div>
              </div>
            </Radio>
            <Radio value="detailed">
              <div>
                <div style={{ fontWeight: 500, fontSize: '13px' }}>Chi tiết</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Hiển thị đầy đủ thông tin, card lớn hơn
                </div>
              </div>
            </Radio>
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
            marks={{
              5: '5',
              10: '10',
              20: '20',
              50: '50+',
            }}
            tooltip={{
              formatter: value => `${value} cards`,
            }}
          />
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#8c8c8c',
              textAlign: 'center',
            }}
          >
            Hiện tại: {config.cardsPerColumn} thẻ mỗi cột
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px dashed #d9d9d9',
        }}
      >
        <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
          Preview: Các thay đổi sẽ được áp dụng real-time
        </Text>
        <div
          style={{
            padding: '12px',
            background: '#fff',
            borderRadius: '6px',
            border: '1px solid #e8e8e8',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>Sample Task Card</div>
          {config.showAssignee && <div>👤 Assigned to: John Doe</div>}
          {config.showDueDate && <div>📅 Due: Tomorrow</div>}
          {config.showPriority && <div>🏁 Priority: High</div>}
          {config.showTags && <div>🏷️ Tags: #urgent #backend</div>}
          {config.showProgress && <div>📊 Progress: 60%</div>}
          {config.showDescription && (
            <div style={{ color: '#8c8c8c' }}>Lorem ipsum dolor sit amet...</div>
          )}
        </div>
      </div>
    </div>
  );
};
