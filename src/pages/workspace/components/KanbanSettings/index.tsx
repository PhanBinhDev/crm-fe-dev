import { EyeOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import { DisplaySettings } from './DisplaySettings';

export const KanbanBoardSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fields');

  const comingSoonContent = (icon: React.ReactNode, text: string) => (
    <div
      style={{
        padding: '32px 20px',
        textAlign: 'center',
        color: '#8c8c8c',
        background: '#fafafa',
        borderRadius: '6px',
        margin: '16px 20px',
      }}
    >
      {React.cloneElement(icon as React.ReactElement, {
        style: { fontSize: '24px', marginBottom: '8px', color: '#d9d9d9' },
      })}
      <div style={{ fontSize: '13px' }}>{text}</div>
    </div>
  );

  const tabItems = [
    {
      key: 'fields',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <EyeOutlined style={{ fontSize: '14px' }} />
          Hiển thị
        </span>
      ),
      children: <DisplaySettings />,
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        tabBarStyle={{
          marginBottom: 0,
          paddingLeft: '16px',
          paddingRight: '16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
          minHeight: '40px',
        }}
        tabBarGutter={20}
      />
    </div>
  );
};
