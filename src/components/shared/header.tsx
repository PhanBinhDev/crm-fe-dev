import { Layout, Space, Dropdown, Button, Avatar, Spin, MenuProps } from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge } from 'antd';
import styles from '@/styles/header.module.css';
import { useAuth } from '@/hooks/useAuth';

const { Header } = Layout;
export const AppHeader = () => {
  const { user, isLoading } = useAuth();

  const notificationItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <BellOutlined style={{ color: '#1890ff' }} />,
      label: 'Bạn có một nhiệm vụ mới',
      onClick: () => console.log('Click notification 1'),
      className: 'notification-item',
    },
    {
      key: '2',
      icon: <ClockCircleOutlined style={{ color: '#ff4d4f' }} />,
      label: 'Deadline sắp đến hạn',
      onClick: () => console.log('Click notification 2'),
      className: 'notification-item',
    },
  ];
  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', type: 'item' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt', type: 'item' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      label: 'Đăng xuất',
      danger: true,
      type: 'item',
      onClick: () => console.log('Logout'),
      style: {},
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,21,41,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 64,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }} />
      <Space size={8} align="center">
        <Dropdown
          menu={{
            items: notificationItems,
            style: {
              padding: '8px 6px',
              minWidth: 200,
              boxShadow:
                '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
            },
          }}
          placement="bottomRight"
          trigger={['click']}
          getPopupContainer={trigger => trigger.parentElement || document.body}
        >
          <div className={styles.headerIcon}>
            <Badge count={2} size="small" offset={[-2, 2]} style={{ backgroundColor: '#ff4d4f' }}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px', color: '#595959' }} />}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Badge>
          </div>
        </Dropdown>
        <Dropdown
          menu={{
            items: userMenuItems,
            style: {
              padding: '8px 6px',
              minWidth: 150,
              boxShadow:
                '0 3px 6px -4px rgba(0,0,0,0.2), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
            },
          }}
          placement="bottomRight"
          trigger={['click']}
          getPopupContainer={trigger => trigger.parentElement || document.body}
        >
          <Button
            type="text"
            className={styles.userAvatar}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#595959',
              backgroundColor: 'transparent',
            }}
          >
            {isLoading ? (
              <Spin size="small" />
            ) : (
              <>
                <Avatar
                  size={28}
                  src={'/default-avatar.png'}
                  icon={<UserOutlined style={{ fontSize: '18px' }} />}
                  style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                />
                <span className={styles.userName}>{user?.name}</span>
              </>
            )}
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};
