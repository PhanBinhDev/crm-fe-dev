import {
  BellOutlined,
  CloseOutlined,
  GlobalOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Menu, message } from 'antd';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';
import NotificationsSettings from './components/NotificationsSettings';
import PreferencesSettings from './components/PreferencesSettings';
import WorkspacesSettings from './components/WorkspacesSettings';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const menuItems = [
    { key: 'general', icon: <UserOutlined />, label: 'Thông tin chung' },
    { key: 'workspaces', icon: <TeamOutlined />, label: 'Workspaces' },
    { key: 'notifications', icon: <BellOutlined />, label: 'Thông báo' },
    { key: 'preferences', icon: <GlobalOutlined />, label: 'Tùy chọn hiển thị' },
  ];

  const handleSave = () => {
    message.success('Đã lưu thay đổi thành công!');
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
    message.info('Đã hoàn tác thay đổi');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'workspaces':
        return <WorkspacesSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <div
        style={{
          width: 210,
          background: '#fff',
          padding: '24px 0',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ padding: '0 24px 24px' }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, margin: 0 }}>Cài đặt</h2>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          style={{ height: '100%', paddingRight: 10 }}
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
      <div style={{ flex: 1, padding: 5, paddingBottom: hasChanges ? 80 : 24 }}>
        <div style={{ margin: '0 auto' }}>{renderContent()}</div>
      </div>
      {/* Action Buttons */}
      {hasChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 280,
            right: 0,
            padding: '16px 24px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            zIndex: 100,
          }}
        >
          <Button icon={<CloseOutlined />} onClick={handleReset}>
            Hủy bỏ
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
