import { IActivity } from '@/common/types';
import { getPriorityColor, getPriorityLabel } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/services/utils/formatter';
import { useList } from '@refinedev/core';
import { IconFlagFilled, IconPointFilled } from '@tabler/icons-react';
import type { TabsProps } from 'antd';
import { List, Tabs, Tooltip, message } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useEffect, useState } from 'react';

const AssignedTask = () => {
  const { user: currentUser } = useAuth();

  const CONTAINER_HEIGHT = 220;
  const PAGE_SIZE = 20;

  const [page, setPage] = useState(1);
  const [allAssignedActivities, setAllAssignedActivities] = useState<IActivity[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data } = useList<IActivity>({
    resource: 'activities/filter',
    pagination: {
      current: page,
      pageSize: PAGE_SIZE,
    },
    sorters: [{ field: 'createdAt', order: 'desc' }],
    filters: [
      {
        field: 'assigneeId',
        operator: 'eq',
        value: currentUser?.id,
      },
    ],
    meta: {
      query: {
        queryType: 'assigned_to_me',
        includeSubTasks: false,
      },
    },
    queryOptions: { enabled: !!currentUser?.id, keepPreviousData: true },
  });

  useEffect(() => {
    const newActivities = data?.data ?? [];
    const total = data?.total ?? 0;

    if (newActivities.length > 0 && page > 1) {
      setAllAssignedActivities(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewActivities = newActivities.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNewActivities];
      });
    } else if (page === 1) {
      setAllAssignedActivities(newActivities);
    }

    if (allAssignedActivities.length + newActivities.length >= total && total > 0) {
      setHasMore(false);
      if (page > 1 && newActivities.length === 0) {
        message.info('Không còn dữ liệu');
      }
    } else if (data && data.data && data.data.length > 0) {
      setHasMore(true);
    }
  }, [data]);

  const appendData = () => {
    if (!hasMore) return;
    setPage(prev => prev + 1);
  };

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - CONTAINER_HEIGHT) <= 1
    ) {
      appendData();
    }
  };

  const renderContent = (content: IActivity[]) => {
    return (
      <List>
        <VirtualList
          data={content}
          height={CONTAINER_HEIGHT}
          itemHeight={47}
          itemKey="id"
          onScroll={onScroll}
        >
          {(item: IActivity) => (
            <List.Item
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {item.priority ? (
                  <Tooltip title={`Ưu tiên: ${getPriorityLabel(item.priority)}`}>
                    <IconFlagFilled size={15} color={getPriorityColor(item.priority)} />
                  </Tooltip>
                ) : (
                  <div>
                    <IconFlagFilled size={15} color={'#fff'} />
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </div>
                  <IconPointFilled size={7} color="#999" />
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexShrink: 1,
                      fontSize: 12,
                    }}
                  >
                    {/* {item.wo} / {getActivityTypeLabel(item.type)} */}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  marginLeft: 5,
                }}
              >
                <span> {item.startTime && `${formatDate(item.startTime)} -`}</span>
                <Tooltip title="Hạn hoàn thành">
                  {' '}
                  {item.endTime && formatDate(item.endTime)}
                </Tooltip>
              </div>
            </List.Item>
          )}
        </VirtualList>
      </List>
    );
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `To Do (${allAssignedActivities.length})`,
      children: renderContent(allAssignedActivities),
    },
    {
      key: '2',
      label: 'In Progress',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Complete',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: 'Overdue',
      children: 'Content of Tab Pane 4',
    },
  ];

  return <Tabs defaultActiveKey="1" items={items} style={{ padding: '0 20px' }} />;
};

export default AssignedTask;
