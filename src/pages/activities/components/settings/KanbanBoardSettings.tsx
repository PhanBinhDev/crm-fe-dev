import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  AppstoreOutlined,
  EyeOutlined,
  FilterOutlined,
  TagsOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { StageSettings } from './stages/StageSettings';
import { DisplaySettings } from './DisplaySettings';

export const KanbanBoardSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stages');

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
      key: 'stages',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <AppstoreOutlined style={{ fontSize: '14px' }} />
          Trạng thái
        </span>
      ),
      children: <StageSettings />,
    },
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
    {
      key: 'filters',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <FilterOutlined style={{ fontSize: '14px' }} />
          Bộ lọc
        </span>
      ),
      children: comingSoonContent(<FilterOutlined />, 'Cài đặt bộ lọc sẽ có sớm...'),
    },
    {
      key: 'labels',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <TagsOutlined style={{ fontSize: '14px' }} />
          Nhãn
        </span>
      ),
      children: comingSoonContent(<TagsOutlined />, 'Quản lý nhãn sẽ có sớm...'),
    },
    {
      key: 'permissions',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <UserOutlined style={{ fontSize: '14px' }} />
          Phân quyền
        </span>
      ),
      children: comingSoonContent(<UserOutlined />, 'Cài đặt phân quyền sẽ có sớm...'),
    },
    {
      key: 'automation',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <BellOutlined style={{ fontSize: '14px' }} />
          Tự động
        </span>
      ),
      children: comingSoonContent(<BellOutlined />, 'Tự động hóa sẽ có sớm...'),
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
