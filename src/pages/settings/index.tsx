import { useLogout } from '@refinedev/core';
import {
  IconBellCog,
  IconBuildingCog,
  IconLogout,
  IconShieldCog,
  IconUserSquareRounded,
} from '@tabler/icons-react';
import { Button, Typography } from 'antd';
import { useMemo, useState } from 'react';
import GeneralSettings from './components/GeneralSettings';
import NotificationsSettings from './components/NotificationsSettings';
import WorkspacesSettings from './components/WorkspacesSettings';

type SettingsTab = 'general' | 'workspaces' | 'notifications' | 'privacy';

type MenuItem = {
  key: SettingsTab;
  icon: React.ReactNode;
  label: string;
};

const menuItems: MenuItem[] = [
  {
    key: 'general',
    icon: <IconUserSquareRounded size={16} color="#333" />,
    label: 'Cài đặt chung',
  },
  {
    key: 'workspaces',
    icon: <IconBuildingCog size={16} color="#333" />,
    label: 'Workspaces',
  },
  { key: 'notifications', icon: <IconBellCog size={16} color="#333" />, label: 'Thông báo' },
  { key: 'privacy', icon: <IconShieldCog size={16} color="#333" />, label: 'Quyền riêng tư' },
];

const SettingsPage = () => {
  const { mutate: logout } = useLogout();
  const [activeSection, setActiveSection] = useState<SettingsTab>('general');

  const renderContent = useMemo(() => {
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
  }, [activeSection]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          height: 60,
          minHeight: 60,
          borderBottom: '1px solid #f0f0f0',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 'semibold' }}>
          {menuItems.find(item => item.key === activeSection)?.label || 'Cài đặt'}
        </Typography.Title>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
        }}
      >
        {/* sidebar */}
        <div
          style={{
            width: 200,
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              flex: 1,
            }}
          >
            {menuItems.map(item => (
              <Button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                icon={item.icon}
                type="text"
                style={{
                  justifyContent: 'flex-start',
                  background: activeSection === item.key ? '#f5f5f5' : undefined,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* logout */}
          <div
            style={{
              padding: 8,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <Button
              color="red"
              icon={<IconLogout size={16} />}
              style={{
                width: '100%',
                color: '#ff4d4f',
                borderColor: '#ff4d4f',
                transition: 'all 0.3s',
                borderRadius: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ff4d4f';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#ff4d4f';
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              onClick={() => logout()}
            >
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* content */}
        <div
          style={{
            flex: 1,
            maxHeight: 'calc(100vh - 156px)',
            overflowY: 'auto',
            paddingBottom: 12,
          }}
        >
          {renderContent}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
