import { IActivity } from '@/common/types';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { UserOutlined } from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { Avatar, List, Tooltip } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useState } from 'react';

const CONTAINER_HEIGHT = 280;
const PAGE_SIZE = 20;

const TodayTask: React.FC = () => {
  const assignees: any[] = [];
  const { currentWorkspace } = useWorkspaces();

  const [page, setPage] = useState(1);

  const { data } = useList<IActivity>({
    resource: 'activities',
    pagination: {
      current: page,
      pageSize: PAGE_SIZE,
    },
    sorters: [{ field: 'createdAt', order: 'desc' }],
    filters: [
      {
        field: 'workspaceId',
        operator: 'eq',
        value: currentWorkspace?.id,
      },
    ],
    queryOptions: { enabled: !!currentWorkspace?.id },
  });

  const activities: IActivity[] = data?.data ?? [];

  const appendData = () => {
    if (!activities.length) {
      return;
    }

    setPage(prev => prev + 1);
  };

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - CONTAINER_HEIGHT) <= 1
    ) {
      appendData();
    }
  };

  return (
    <List style={{ padding: '0 20px' }}>
      <VirtualList
        data={activities}
        height={CONTAINER_HEIGHT}
        itemHeight={47}
        itemKey="email"
        onScroll={onScroll}
      >
        {(item: IActivity) => (
          <List.Item key={item.name}>
            <div>{item.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {assignees?.length > 0 ? (
                assignees.slice(0, 3).map((assignee, index) => (
                  <Tooltip key={index} title={assignee.user.name}>
                    {assignee.user.avatar ? (
                      <Avatar
                        size="small"
                        src={assignee.user.avatar}
                        style={{ marginLeft: index > 0 ? -8 : 0 }}
                      />
                    ) : (
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: getColorFromName(
                            assignee.user.name || AVATAR_PLACEHOLDER,
                          ),
                          color: '#fff',
                          fontWeight: 'bold',
                          marginLeft: index > 0 ? -8 : 0,
                        }}
                      >
                        {getInitials(assignee.user.name)}
                      </Avatar>
                    )}
                  </Tooltip>
                ))
              ) : (
                <Tooltip title="Chưa có người thực hiện">
                  <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
                    <UserOutlined />
                  </Avatar>
                </Tooltip>
              )}
              {assignees?.length > 3 && (
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#f5f5f5', color: '#999', marginLeft: -8 }}
                >
                  +{assignees.length - 3}
                </Avatar>
              )}
            </div>
          </List.Item>
        )}
      </VirtualList>
    </List>
  );
};

export default TodayTask;
