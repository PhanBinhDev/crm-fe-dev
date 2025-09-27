import { IActivity, IStage, IUser, IWorkspace } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import FilterActivities, { FilterParams } from '@/pages/workspace/components/FilterActivities';
import SearchActivities from '@/pages/workspace/components/SearchActivities';
import SettingsActivities from '@/pages/workspace/components/SettingsActivities';
import SortActive from '@/pages/workspace/components/SortActive';
import CalendarView from '@/pages/workspace/views/CalendarView';
import KanbanView from '@/pages/workspace/views/KanbanView';
import ListView from '@/pages/workspace/views/ListView';
import TableView from '@/pages/workspace/views/TableView';
import { useList, useOne } from '@refinedev/core';
import { IconCalendar, IconLayoutKanban, IconList, IconPlus, IconTable } from '@tabler/icons-react';
import { Button, Space, Spin, Tabs, Tooltip } from 'antd';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

type TabKey = 'kanban' | 'list' | 'calendar' | 'table';

const KanbanWorkspaces = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('kanban');
  const [searchValue, setSearchValue] = useState<string>('');
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [displayActivities, setDisplayActivities] = useState<IActivity[]>([]);

  const { workspaceId } = useParams();
  const { openModal } = useModal();

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const { data: workspaceData, isLoading: isLoadingWorkspace } = useOne<IWorkspace>({
    resource: 'workspaces',
    id: workspaceId || '',
    queryOptions: { enabled: !!workspaceId },
  });

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    queryOptions: { enabled: !!workspaceData?.data.id },
  });

  const { data: users } = useList<IUser>({
    resource: 'users/all',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    queryOptions: { enabled: !!workspaceData?.data.id },
  });

  const activityFilters: any[] = [
    { field: 'q', operator: 'eq', value: searchValue },
    { field: 'includeSubTasks', operator: 'eq', value: true },
    { field: 'workspaceId', operator: 'eq', value: workspaceData?.data.id },
  ];

  if (filterParams.priority) {
    activityFilters.push({ field: 'priority', operator: 'eq', value: filterParams.priority });
  }
  if (filterParams.stageId) {
    activityFilters.push({ field: 'stageId', operator: 'eq', value: filterParams.stageId });
  }
  if (filterParams.category) {
    activityFilters.push({ field: 'category', operator: 'eq', value: filterParams.category });
  }
  if (filterParams.endTimeFrom) {
    activityFilters.push({
      field: 'endTime',
      operator: 'gte',
      value: filterParams.endTimeFrom,
    });
  }
  if (filterParams.endTimeTo) {
    activityFilters.push({
      field: 'endTime',
      operator: 'lte',
      value: filterParams.endTimeTo,
    });
  }

  if (filterParams.type) {
    activityFilters.push({ field: 'type', operator: 'eq', value: filterParams.type });
  }
  if (filterParams.eventType) {
    activityFilters.push({ field: 'eventType', operator: 'eq', value: filterParams.eventType });
  }

  const { data: activitiesData } = useList<IActivity>({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: activityFilters,
    queryOptions: {
      enabled: !!workspaceData?.data.id,
      onSuccess: data => {
        setDisplayActivities(data.data);
      },
    },
  });

  if (isLoadingWorkspace) {
    return <Spin />;
  }

  if (!workspaceData) {
    return <></>;
  }

  const handleApplyFilters = (params: FilterParams) => {
    if (Object.keys(params).length === 0) {
      setFilterParams({});
    } else {
      setFilterParams(params);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Headers */}
      <Space
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: 12,
        }}
      >
        {/* Change layout */}
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as TabKey)}
          items={[
            {
              key: 'kanban',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'kanban' ? 600 : 400,
                    color: activeTab === 'kanban' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconLayoutKanban
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'kanban' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Bảng Kanban
                </span>
              ),
            },
            {
              key: 'list',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'list' ? 600 : 400,
                    color: activeTab === 'list' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconList
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'list' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Danh sách
                </span>
              ),
            },
            {
              key: 'calendar',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'calendar' ? 600 : 400,
                    color: activeTab === 'calendar' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconCalendar
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'calendar' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Lịch
                </span>
              ),
            },

            {
              key: 'table',
              label: (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: activeTab === 'table' ? 600 : 400,
                    color: activeTab === 'table' ? '#1677ff' : '#888',
                    transition: 'color 0.2s',
                  }}
                >
                  <IconTable
                    size={16}
                    style={{
                      marginRight: 2,
                      color: activeTab === 'table' ? '#1677ff' : '#bfbfbf',
                      transition: 'color 0.2s',
                    }}
                  />
                  Bảng dữ liệu
                </span>
              ),
            },
          ]}
          tabBarStyle={{
            borderBottom: 'none',
            marginBottom: 0,
            height: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            padding: '0 12px',
            gap: 8,
          }}
          style={{
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <SearchActivities onSearch={onSearch} />
          <SortActive
            activities={displayActivities}
            onSorted={(sorted: IActivity[]) => setDisplayActivities(sorted)}
          />
          <FilterActivities onApply={handleApplyFilters} />
          <SettingsActivities />

          <Tooltip title="Thêm mới hoạt động">
            <Button
              type="primary"
              icon={<IconPlus size={16} />}
              onClick={() => openModal('ModalAddActivity')}
              style={{
                borderRadius: 8,
                width: 36,
                height: 36,
              }}
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            />
          </Tooltip>
        </div>
      </Space>

      {activeTab === 'kanban' && (
        <KanbanView stages={stagesData?.data || []} activities={displayActivities} />
      )}
      {activeTab === 'list' && (
        <ListView
          stages={stagesData?.data || []}
          activities={displayActivities}
          users={users?.data || []}
        />
      )}
      {activeTab === 'calendar' && (
        <CalendarView stages={stagesData?.data || []} activities={displayActivities} />
      )}
      {activeTab === 'table' && (
        <TableView
          stages={stagesData?.data || []}
          activities={displayActivities}
          users={users?.data || []}
        />
      )}
    </div>
  );
};

export default KanbanWorkspaces;
