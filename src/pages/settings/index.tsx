import { BellOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';
import NotificationsSettings from './components/NotificationsSettings';
import WorkspacesSettings from './components/WorkspacesSettings';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const menuItems = [
    { key: 'general', icon: <UserOutlined />, label: 'Thông tin chung' },
    { key: 'workspaces', icon: <TeamOutlined />, label: 'Workspaces' },
    { key: 'notifications', icon: <BellOutlined />, label: 'Thông báo' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        background: '#ffffffff',
        height: 'calc(100vh - 136px)',
      }}
    >
      <div
        style={{
          width: 210,
          background: '#fff',
          padding: '15px 0',
          borderRight: '1px solid #f0f0f0',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '0 24px 24px' }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, margin: 0 }}>Cài đặt</h2>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          style={{ paddingRight: 10 }}
          onSelect={({ key }) => setActiveSection(key)}
          inlineIndent={0}
        >
          {menuItems.map(item => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              style={{
                paddingLeft: '24px !important',
                margin: 0,
                marginBottom: 3,
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          padding: 5,
          paddingBottom: hasChanges ? 80 : 24,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <div style={{ margin: '0 auto' }}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
