import { EyeOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import { DisplaySettings } from './DisplaySettings';

export const KanbanBoardSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fields');

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
