import { INotification, NotificationTab } from '@/common/types';
import { useInfiniteList, useUpdate } from '@refinedev/core';
import { IconBell, IconChecks, IconX } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Empty,
  List,
  Popover,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { memo, useMemo, useState } from 'react';

const modalTabs: {
  key: NotificationTab;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'mentions', label: 'Nhắc tên' },
] as const;

const NotificationBtn = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>('all');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteList<INotification>({
      resource: 'notifications',
      pagination: { pageSize: 10 },
      sorters: [{ field: 'createdAt', order: 'desc' }],
      queryOptions: {
        getNextPageParam: lastPage => {
          console.log('lastPage', lastPage);

          return lastPage.pagination.afterCursor;
        },
        getPreviousPageParam: firstPage => {
          return firstPage.pagination.beforeCursor;
        },
      },
    });

  const { mutate, isPending: isUpdating } = useUpdate({
    resource: 'notifications',
    invalidates: ['list'],
    mutationMode: 'optimistic',
  });

  const notifications = useMemo(() => {
    const notificationMap = new Map();

    data?.pages.forEach(page => {
      page.data.forEach(notification => {
        if (!notificationMap.has(notification.id)) {
          notificationMap.set(notification.id, notification);
        }
      });
    });

    return Array.from(notificationMap.values());
  }, [data]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 28 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const markAsRead = (noti: INotification) => {
    if (isUpdating || noti.isRead) return;

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

    mutate({
      resource: 'notifications/read-all',
      id: '',
      values: {},
    });
  };

  const clearAll = () => {
    if (isUpdating || !notifications) return;

    mutate({
      resource: 'notifications/clear-all',
      id: '',
      values: {},
    });
  };

  const renderItem = (item: INotification) => (
    <List.Item
      style={{
        background: item.isRead ? '#fff' : '#f6faff',
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: 6,
        position: 'relative',
      }}
      key={item.id}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f5f5f5';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = item.isRead ? '#fff' : '#f6faff';
      }}
      onClick={() => markAsRead(item)}
    >
      <List.Item.Meta
        avatar={
          <Avatar src={item.user?.avatar} style={{ background: '#eee' }} size="small">
            {item.user?.name?.[0]}
          </Avatar>
        }
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 0 }}>
            <Typography.Text strong style={{ fontSize: '13px' }}>
              {item.user?.name}
            </Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              {!item.isRead && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: '#1677ff',
                    marginRight: 4,
                  }}
                />
              )}

              <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                {dayjs(item.createdAt).format('HH:mm')}
              </Typography.Text>
            </div>
          </div>
        }
        description={
          <div style={{ marginTop: '2px' }}>
            <Typography.Text style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {item.title}
            </Typography.Text>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
              {dayjs(item.createdAt).format('DD/MM/YYYY')}
            </div>
          </div>
        }
      />
    </List.Item>
  );

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
              }}
            >
              {item.label}
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
        onScroll={handleScroll}
      >
        {isLoading ? (
          <Spin style={{ margin: '10px auto', display: 'block' }} />
        ) : notifications.length === 0 ? (
          <Empty description="Không có thông báo nào" style={{ margin: '10px 0' }} />
        ) : (
          <List
            dataSource={notifications}
            renderItem={renderItem}
            split={false}
            style={{ padding: '0 8px' }}
          />
        )}
        {isFetchingNextPage && <Spin style={{ margin: '12px auto', display: 'block' }} />}
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
          icon={<IconX size={14} />}
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
        style={{ backgroundColor: '#ff4d4f' }}
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
