import { NotificationType } from '@/common/enum/notifications';
import { INotification, NotificationTab } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { useModal } from '@/hooks/useModal';
import { useInvitationHandlers } from '@/hooks/useWorkspaces';
import { getInitials } from '@/utils/activity';
import { useList, useUpdate } from '@refinedev/core';
import { IconBell, IconChecks, IconCloudDownload, IconFile, IconX } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Empty,
  Image,
  List,
  Popover,
  Space,
  Tabs,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const modalTabs: {
  key: NotificationTab;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
] as const;

const NotificationItem = memo(
  ({
    item,
    onMarkAsRead,
  }: {
    item: INotification;
    onMarkAsRead: (noti: INotification) => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getTimeAgo = (date: string) => dayjs(date).fromNow();

    const { handleAcceptInvitation, handleRejectInvitation, loadingId, rejectingId } =
      useInvitationHandlers();

    return (
      <List.Item
        style={{
          background: isHovered ? '#f0f5ff' : item.isRead ? '#fff' : '#f6faff',
          padding: 8,
          cursor: 'pointer',
          borderRadius: 8,
          border: isHovered ? '1px solid #d6e4ff' : '1px solid transparent',
          marginBottom: 6,
          transition: 'all 0.2s ease',
        }}
        key={item.id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onMarkAsRead(item)}
      >
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <Avatar
            src={item.user?.avatar}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              flexShrink: 0,
              border: 'none',
            }}
            size={28}
          >
            {getInitials(item.user?.name)}
          </Avatar>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Typography.Text
                strong
                style={{
                  fontSize: '14px',
                  color: '#262626',
                }}
              >
                {item.user?.name}
              </Typography.Text>
              {!item.isRead && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#1890ff',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>

            <Typography.Text
              style={{
                fontSize: '12px',
                lineHeight: '1.4',
                color: '#262626',
                display: 'block',
                marginBottom: 4,
              }}
            >
              {item.title}
            </Typography.Text>

            {item.message && (
              <Typography.Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  fontSize: '12px',
                  lineHeight: '1.4',
                  margin: '0 0 4px 0',
                  color: '#595959',
                }}
              >
                {item.message}
              </Typography.Paragraph>
            )}

            {Array.isArray(item.data?.files) && item.data.files.length > 0 && (
              <div
                style={{
                  marginTop: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {item.data.files.map((file: any) => {
                  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(
                    (file.metadata?.format || file.mimeType || '').toLowerCase(),
                  );
                  const sizeMB = file.size ? (file.size / (1024 * 1024)).toFixed(1) : '';
                  return (
                    <div
                      key={file.id || file.url}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: '#f7f8fa',
                        borderRadius: 8,
                        padding: '6px 10px 6px 8px',
                        border: '1px solid #f0f0f0',
                        maxWidth: 320,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Icon hoặc preview ảnh */}
                      {isImage ? (
                        <Image
                          src={file.url}
                          alt={file.originalName || file.fileName}
                          width={44}
                          height={44}
                          style={{
                            objectFit: 'cover',
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fafafa',
                            overflow: 'hidden',
                          }}
                          preview={{ src: file.url }}
                          placeholder
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            background: '#e6f4ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            color: '#1677ff',
                          }}
                        >
                          <IconFile size={22} />
                        </div>
                      )}

                      {/* Thông tin file */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Link
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#222',
                            wordBreak: 'break-all',
                          }}
                          ellipsis
                        >
                          {file.originalName || file.fileName || 'Tệp đính kèm'}
                        </Typography.Link>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          {sizeMB && <span>{sizeMB} MB</span>}
                          {file.mimeType && <span style={{ marginLeft: 8 }}>{file.mimeType}</span>}
                        </div>
                      </div>

                      <Button
                        type="text"
                        size="small"
                        icon={<IconCloudDownload size={14} stroke={1.5} color="#333" />}
                        style={{
                          minWidth: 0,
                          padding: 0,
                          borderRadius: 7,
                        }}
                        onClick={async e => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(file.url, { mode: 'cors' });
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.originalName || file.fileName || 'download';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            // Optional: thông báo lỗi
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {item.data?.workspaceId && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button
                  type="primary"
                  size="small"
                  loading={loadingId === item.data?.workspaceId}
                  onClick={() => handleAcceptInvitation(item.data?.workspaceId)}
                >
                  Chấp nhận
                </Button>
                <Button
                  size="small"
                  danger
                  loading={rejectingId === item.data?.workspaceId}
                  onClick={() => handleRejectInvitation(item.data?.workspaceId)}
                >
                  Từ chối
                </Button>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
                fontSize: '11px',
                color: '#8c8c8c',
              }}
            >
              <span>{getTimeAgo(item.createdAt)}</span>
              {item.readAt && (
                <>
                  <span>•</span>
                  <span>Đã đọc {getTimeAgo(item.readAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </List.Item>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.isRead === nextProps.item.isRead &&
      prevProps.item.readAt === nextProps.item.readAt
    );
  },
);

const NotificationBtn = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>('all');
  const { openModal } = useModal();
  const navigate = useNavigate();

  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useList<INotification>({
    resource: 'notifications',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'createdAt', order: 'desc' }],
    queryOptions: {
      retry: false,
    },
  });

  const { mutate, isPending: isUpdating } = useUpdate({
    resource: 'notifications',
    invalidates: ['list'],
    mutationMode: 'optimistic',
    mutationOptions: {
      onSuccess: () => {
        refetch();
      },
    },
  });
  const [localNotifications, setLocalNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    if (notificationsData) {
      setLocalNotifications(notificationsData.data);
    }
  }, [notificationsData]);

  const notifications = localNotifications;
  const unreadCount = localNotifications.filter(n => !n.isRead).length;
  const allCount = localNotifications.length;

  const filteredNotifications = notifications.filter(item => {
    if (tab === 'unread') return !item.isRead;
    if (tab === 'mentions') return item.type === NotificationType.MENTION;
    return true;
  });

  const markAsRead = (noti: INotification) => {
    if (noti.type === NotificationType.ACTIVITY && noti.data?.uri && noti.data?.open) {
      navigate(noti.data.uri);
      openModal('ModalEditActivity', { activity: noti.data.open });
    }
    if (noti.type === NotificationType.WORKSPACE) {
      navigate('/settings/workspaces');
    }
    setOpen(false);
    if (isUpdating || noti.isRead) return;
    setLocalNotifications(prev =>
      prev.map(n =>
        n.id === noti.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );

    mutate({
      resource: 'notifications/read',
      id: '',
      values: {
        notificationId: noti.id,
      },
    });
  };

  const markAllAsRead = () => {
    if (isUpdating) return;

    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
    );

    mutate({
      resource: 'notifications/read-all',
      id: '',
      values: {},
    });
  };

  const clearAll = () => {
    if (isUpdating || !notifications) return;
    setLocalNotifications([]);

    mutate({
      resource: 'notifications/clear-all',
      id: '',
      values: {},
    });
  };

  const notificationContent = (
    <Space
      style={{
        width: '100%',
        maxHeight: 420,
      }}
      direction="vertical"
    >
      <div
        style={{
          padding: '8px 8px 0 12px',
          fontWeight: 600,
          fontSize: 15,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Thông báo</span>
        <Button
          type="text"
          size="small"
          style={{
            borderRadius: 7,
          }}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          onClick={() => setOpen(false)}
          icon={<IconX size={16} color="#838383" />}
        />
      </div>
      <Divider
        style={{
          margin: 0,
        }}
      />

      <Tabs
        activeKey={tab}
        size="small"
        onChange={activeKey => setTab(activeKey as NotificationTab)}
        items={modalTabs.map(item => ({
          key: item.key,
          label: (
            <span
              style={{
                fontWeight: 500,
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.label}
              <Badge
                size="small"
                count={item.key === 'all' ? allCount : unreadCount}
                style={{
                  marginLeft: 5,
                  backgroundColor: '#1890ff',
                  minWidth: 14,
                  height: 14,
                  lineHeight: '14px',
                  borderRadius: 7,
                  textAlign: 'center',
                  padding: '0 3px',
                  fontWeight: 550,
                  fontSize: 10,
                }}
                showZero={false}
              />
            </span>
          ),
        }))}
        tabBarStyle={{
          height: 32,
          minHeight: 32,
          display: 'flex',
          alignItems: 'flex-start',
          background: '#fff',
          borderRadius: 8,
          gap: 4,
          width: '100%',
          backdropFilter: 'blur(10px)',
        }}
        tabBarGutter={20}
        style={{ marginBottom: 0, padding: '0 12px', height: 32 }}
      />

      <div
        style={{ flex: 1, overflowY: 'auto', maxHeight: 400, background: '#fff' }}
        className="hidden-scrollbar"
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              background: '#fff',
            }}
          >
            <Spinner />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty
            description={
              tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'
            }
            style={{ margin: '10px 0' }}
          />
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={item => (
              <NotificationItem key={item.id} item={item} onMarkAsRead={markAsRead} />
            )}
            split={false}
            style={{ padding: '0 8px', maxHeight: 250 }}
          />
        )}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #f0f0f0',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          type="text"
          style={{
            padding: '4px 12px',
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconX size={14} stroke={1.5} />}
          disabled={!notifications.length || isUpdating}
          onClick={clearAll}
        >
          Xóa
        </Button>

        <Button
          type="primary"
          style={{
            border: 0,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
          icon={<IconChecks size={14} />}
          onClick={markAllAsRead}
          disabled={!notifications || unreadCount === 0 || isUpdating}
        >
          Đánh dấu đã đọc
        </Button>
      </div>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: 0,
          width: 350,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: 8,
        },
      }}
      trigger={['click']}
      placement="bottomRight"
      arrow={false}
      content={notificationContent}
    >
      <Badge
        count={unreadCount}
        size="small"
        offset={[-2, 2]}
        style={{ backgroundColor: '#ff4d4f', fontSize: 10 }}
      >
        <Button
          type="text"
          icon={<IconBell size={16} color="#838383" />}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Badge>
    </Popover>
  );
};

export default memo(NotificationBtn);
