import { IActivity } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useList } from '@refinedev/core';
import React, { useState } from 'react';
import { renderContent } from './AssignedTask';

const CONTAINER_HEIGHT = 280;
const PAGE_SIZE = 20;

const TodayTask: React.FC = () => {
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
    <div style={{ padding: '0 20px' }}>{renderContent(activities, CONTAINER_HEIGHT, onScroll)}</div>
  );
};

export default TodayTask;
