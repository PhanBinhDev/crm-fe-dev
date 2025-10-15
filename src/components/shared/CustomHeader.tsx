import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { IconLogout, IconSettings, IconUser, IconUserCircle } from '@tabler/icons-react';
import { Avatar, Button, Drawer, Dropdown, Layout, MenuProps, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IUser } from '../../common/types/users';
import CustomBreadcrumb from './CustomBreadcrumb';
import NotificationBtn from './NotificationBtn';

const { Header } = Layout;

interface CustomHeaderProps {
  collapsed: boolean;
}

export const CustomHeader = ({ collapsed }: CustomHeaderProps) => {
  const { data: user, isLoading, refetch } = useGetIdentity<IUser>();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const [profileTab, setProfileTab] = useState(false);
  useEffect(() => {
    if (!profileTab) refetch?.();
  }, [profileTab]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <IconUserCircle size={16} />,
      label: 'Hồ sơ cá nhân',
      onClick: () => setProfileTab(true),
      style: { borderRadius: 8 },
    },
    {
      key: 'settings',
      icon: <IconSettings size={16} />,
      onClick: () => navigate('/settings'),
      label: 'Cài đặt',
      style: { borderRadius: 8 },
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <IconLogout size={16} style={{ color: 'inherit' }} />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout(),
      style: { borderRadius: 8 },
    },
  ];

  return (
    <>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,21,41,0.08)',
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 72 : 240,
          zIndex: 10,
          height: 64,
          transition: 'all 0.2s',
        }}
      >
        <CustomBreadcrumb />

        <Space size={8} align="center">
          <NotificationBtn />
          <Dropdown
            menu={{
              items: userMenuItems,
              style: {
                padding: 6,
                minWidth: 180,
                borderRadius: 10,
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
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 6,
                cursor: 'pointer',
                borderRadius: 20,
                transition: 'background 0.2s',
                background: 'transparent',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Skeleton.Avatar active size={28} shape="circle" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 82, height: 16, minWidth: 0 }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Avatar
                    size={28}
                    src={
                      user?.avatar
                        ? user.avatar.startsWith('http')
                          ? `${user.avatar}?t=${user.updatedAt}`
                          : `${import.meta.env.VITE_API_BASE_URL}${user.avatar}?t=${user.updatedAt}`
                        : AVATAR_PLACEHOLDER
                    }
                    icon={<IconUser size={18} />}
                    style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#262626',
                      height: 'fit-content',
                    }}
                  >
                    {user?.name}
                  </span>
                </>
              )}
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Drawer
        title="Hồ sơ cá nhân"
        width={450}
        open={profileTab}
        onClose={() => setProfileTab(false)}
        mask
        maskClosable
        destroyOnClose
        styles={{
          body: { padding: 0, height: '100%' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)', position: 'fixed' },
        }}
      >
        <ProfilePage />
      </Drawer>
    </>
  );
};
