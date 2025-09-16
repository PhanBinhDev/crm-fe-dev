import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { onMessageListener, requestForToken } from '@/providers/fcmNotification/firebase';
import { useList, useLogout } from '@refinedev/core';
import { IconBell, IconChecks, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Layout,
  MenuProps,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { INotification } from '@/common/types/notification';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Header } = Layout;
export const AppHeader = () => {
  useEffect(() => {
    // Lấy token
    requestForToken();

    // Lắng nghe message
    onMessageListener()
      .then((payload: any) => {
        alert(`Thông báo mới: ${payload.notification?.title}`);
      })
      .catch(err => console.log('Lỗi lắng nghe message:', err));
  }, []);

  const { user, isLoading } = useAuth();
  const { mutate: logout } = useLogout();
  const [profileTab, setProfileTab] = useState(false);

  const [isMoreNotifications, setIsMoreNotifications] = useState(false);

  const {
    data: notifications,
    refetch,
    isLoading: isLoadingMoreNotifications,
  } = useList({
    resource: 'notifications',
    pagination: { pageSize: isMoreNotifications ? 999 : 10, current: 1 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });

  const [countNotifications, setCountNotifications] = useState(0);

  useEffect(() => {
    if (notifications?.data) {
      setCountNotifications(notifications.data.filter(n => !n.isRead).length);
    }
  }, [notifications]);

  const handleReadAllNotifications = async () => {
    if (countNotifications === 0) return;

    setCountNotifications(0);
    await axiosInstance.patch('notifications/read-all');
    refetch();
  };

  const notificationItems: MenuProps['items'] = useMemo(() => {
    const headerMenuDropdown: MenuProps['items'][number] = {
      key: 'headerMenuDropdown',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: 'rgb(232 230 230)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>Thông báo</span>
          <Button
            size="small"
            icon={<IconChecks size={18} color="#1890FF" />}
            style={{
              padding: 0,
              fontSize: 13,
              border: 'none',
              boxShadow: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#1890FF',
            }}
            onClick={handleReadAllNotifications}
            className="btn-notification-read-all"
          >
            Đọc tất cả
          </Button>
        </div>
      ),
      type: 'item',
      disabled: true,
      className: 'dropdown-header',
    };

    const items = notifications?.data.map((notification): MenuProps['items'][number] => {
      return {
        key: notification.id,
        icon: <Avatar src={notification?.userId?.avatar || AVATAR_PLACEHOLDER} />,
        label: (
          <div
            style={{
              position: 'relative',
              padding: '2px 0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Space direction="vertical" size={0} style={{ padding: '2px 0' }}>
              <Space size="small" style={{ padding: '2px 0' }}>
                <Typography.Text strong>{notification?.userId?.name || 'Username'}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(notification?.createdAt).fromNow()}
                </Typography.Text>
              </Space>
              <Typography.Text>{notification?.message}</Typography.Text>
            </Space>

            {!notification?.isRead && (
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '25%',
                  transform: 'translateY(-50%)',
                  width: 8,
                  height: 8,
                  backgroundColor: 'green',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
        ),
        onClick: () => handleReadOneNotification(notification),
        style: {
          backgroundColor: notification.isRead ? 'none' : 'rgba(0, 0, 0, 0.04)',
        },
        className: 'notification-item',
        type: 'item',
      };
    });

    return [headerMenuDropdown, ...(items || [])];
  }, [notifications]);

  const handleReadOneNotification = async (notification: INotification) => {
    if (notification.isRead) return;
    setCountNotifications(prev => (prev > 0 ? prev - 1 : 0));

    await axiosInstance.patch(`notifications/read`, { notificationId: notification?.id });
    refetch();
  };

  console.log(notifications);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <IconUser size={18} />,
      label: 'Hồ sơ cá nhân',
      type: 'item',
      onClick: () => setProfileTab(true),
    },
    { key: 'settings', icon: <IconSettings size={18} />, label: 'Cài đặt', type: 'item' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: (
        <IconLogout
          size={18}
          style={{
            color: 'inherit',
          }}
        />
      ),
      label: 'Đăng xuất',
      danger: true,
      type: 'item',
      onClick: () => logout(),
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
          left: 0,
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
                minWidth: 300,
                padding: 0,
                boxShadow:
                  '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
                borderRadius: isMoreNotifications ? '8px 8px' : '8px 8px 0 0',
                maxHeight: isMoreNotifications ? 550 : 500,
              },
            }}
            dropdownRender={menu => {
              if (isMoreNotifications || (notifications?.data && notifications?.data?.length < 10))
                return menu;

              return (
                <>
                  {menu}

                  <div
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderRadius: '0 0 8px 8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                      backgroundColor: 'rgb(232 230 230)',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setIsMoreNotifications(true);
                    }}
                  >
                    Xem tất cả
                  </div>
                </>
              );
            }}
            placement="bottomRight"
            trigger={['click']}
            getPopupContainer={trigger => trigger.parentElement || document.body}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                borderRadius: 4,
              }}
            >
              <Badge
                count={countNotifications > 0 ? countNotifications : ''}
                size="small"
                offset={[-2, 2]}
                style={{ backgroundColor: '#ff4d4f' }}
              >
                <Button
                  type="text"
                  icon={<IconBell size={18} color="#595959" />}
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
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 6,
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                borderRadius: 4,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isLoading ? (
                <Spin size="small" />
              ) : (
                <>
                  <Avatar
                    size={28}
                    src={user?.avatar || AVATAR_PLACEHOLDER}
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
        width={500}
        open={profileTab}
        onClose={() => setProfileTab(false)}
        mask={true}
        maskClosable={true}
        styles={{
          body: {
            padding: 0,
            height: '100%',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            position: 'fixed',
          },
        }}
      >
        <ProfilePage />
      </Drawer>
    </>
  );
};
