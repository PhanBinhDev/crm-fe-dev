import { IActivity, IStage, IUser, IWorkspace } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import FilterActivities, { FilterParams } from '@/pages/workspace/components/FilterActivities';
import SearchActivities from '@/pages/workspace/components/SearchActivities';
import SettingsActivities from '@/pages/workspace/components/SettingsActivities';
import SortActive from '@/pages/workspace/components/SortActive';
import CalendarView from '@/pages/workspace/views/CalendarView';
import KanbanView from '@/pages/workspace/views/KanbanView';
import ListView from '@/pages/workspace/views/ListView';
import { buildFilterCondition } from '@/utils/filters';
import { CrudFilter, CrudOperators, useList, useOne } from '@refinedev/core';
import { IconCalendar, IconLayoutKanban, IconList, IconPlus } from '@tabler/icons-react';
import { Button, Card, Row, Skeleton, Space, Tabs, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'usehooks-ts';

type TabKey = 'kanban' | 'list' | 'calendar';

const KanbanWorkspaces = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('kanban');
  const [searchValue, setSearchValue] = useState<string>('');
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 992px)');
  const { isLoading } = useWorkspaceStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevWorkspaceIdRef = useRef<string | undefined>();

  const { workspaceId } = useParams();
  const { openModal } = useModal();

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const { data: workspaceData, isFetching: isLoadingWorkspace } = useOne<IWorkspace>({
    resource: 'workspaces',
    id: workspaceId || '',
    queryOptions: {
      enabled: !!workspaceId,
    },
  });

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    filters: [{ field: 'workspaceId', operator: 'eq', value: workspaceData?.data.id }],
    queryOptions: {
      enabled: !!workspaceData?.data.id,
      keepPreviousData: true,
    },
  });

  const { data: users } = useList<IUser>({
    resource: 'users/all',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    queryOptions: {
      enabled: !!workspaceData?.data.id,
      keepPreviousData: true,
    },
  });

  const activityFilters = useMemo((): CrudFilter[] => {
    const baseFilters: CrudFilter[] = [
      { field: 'q', operator: 'eq', value: searchValue },
      { field: 'includeSubTasks', operator: 'eq', value: false },
      { field: 'workspaceId', operator: 'eq', value: workspaceData?.data.id },
    ];

    const filterMappings: Array<{
      field: string;
      value: any;
      operator?: Exclude<CrudOperators, 'or' | 'and'>;
    }> = [
      { field: 'priority', value: filterParams.priority },
      { field: 'assignees', value: filterParams.assigneeId },
      { field: 'stageId', value: filterParams.stageId },
      { field: 'category', value: filterParams.category },
      { field: 'type', value: filterParams.type },
      { field: 'eventType', value: filterParams.eventType },
      { field: 'endTime', value: filterParams.endTimeFrom, operator: 'gte' },
      { field: 'endTime', value: filterParams.endTimeTo, operator: 'lte' },
    ];

    const conditionalFilters = filterMappings
      .map(({ field, value, operator }) => buildFilterCondition(field, value, operator))
      .filter(Boolean) as CrudFilter[];

    return [...baseFilters, ...conditionalFilters];
  }, [searchValue, filterParams, workspaceData?.data.id]);

  const { data: activitiesData, isFetching: isLoadingActivities } = useList<IActivity>({
    resource: 'activities',
    pagination: { mode: 'off' },
    filters: activityFilters,
    queryOptions: {
      enabled: !!workspaceData?.data.id,
      keepPreviousData: true,
    },
  });

  const activities = useMemo(() => activitiesData?.data || [], [activitiesData]);

  const handleApplyFilters = useCallback((params: FilterParams) => {
    setFilterParams(Object.keys(params).length === 0 ? {} : params);
  }, []);

  useEffect(() => {
    if (workspaceId && prevWorkspaceIdRef.current && workspaceId !== prevWorkspaceIdRef.current) {
      setIsInitialLoad(true);
    }

    prevWorkspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  useEffect(() => {
    if (isInitialLoad && !isLoadingWorkspace && !isLoadingActivities && workspaceData?.data) {
      setIsInitialLoad(false);
    }
  }, [isLoadingWorkspace, isLoadingActivities, workspaceData, isInitialLoad]);

  const tabItems = useMemo(
    () => [
      {
        key: 'kanban',
        icon: IconLayoutKanban,
        label: 'Bảng Kanban',
      },
      {
        key: 'list',
        icon: IconList,
        label: 'Danh sách',
      },
      {
        key: 'calendar',
        icon: IconCalendar,
        label: 'Lịch',
      },
    ],
    [],
  );

  const renderTabLabel = (item: (typeof tabItems)[0]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.key;

    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: isActive ? 600 : 400,
          color: isActive ? '#1677ff' : '#888',
          transition: 'color 0.2s',
        }}
      >
        <Icon
          size={16}
          style={{
            marginRight: 2,
            color: isActive ? '#1677ff' : '#bfbfbf',
            transition: 'color 0.2s',
          }}
        />
        {item.label}
      </span>
    );
  };

  const renderActiveView = useMemo(() => {
    const commonProps = {
      stages: stagesData?.data || [],
      activities,
      users: users?.data || [],
    };

    switch (activeTab) {
      case 'kanban':
        return <KanbanView stages={commonProps.stages} activities={commonProps.activities} />;
      case 'list':
        return <ListView {...commonProps} />;
      case 'calendar':
        return <CalendarView stages={commonProps.stages} activities={commonProps.activities} />;
      default:
        return null;
    }
  }, [activeTab, activities, stagesData?.data, users?.data]);

  if (isInitialLoad || isLoading) {
    return (
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fff',
                  borderRadius: 8,
                  padding: '0 12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  height: 36,
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <Skeleton.Button
                    key={i}
                    active
                    size="small"
                    style={{ width: 80, height: 20, borderRadius: 6 }}
                  />
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <Skeleton.Button
                    key={i}
                    active
                    shape="square"
                    style={{ maxWidth: 36, height: 36, minWidth: 0 }}
                  />
                ))}
                <Skeleton.Button
                  active
                  shape="square"
                  style={{ maxWidth: 36, height: 36, minWidth: 0 }}
                />
              </div>
            </div>
          </div>
          {/* Row */}
          <Row
            gutter={16}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              minWidth: '100%',
              height: '100%',
              gap: 16,
            }}
          >
            {[...Array(isMobile ? 1 : isTablet ? 2 : 4)].map((_, colIndex) => (
              <Card
                key={colIndex}
                style={{
                  borderRadius: 8,
                  minHeight: 200,
                  maxWidth: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
                styles={{
                  body: {
                    padding: 0,
                  },
                  header: {
                    height: 37,
                  },
                }}
              >
                <div
                  style={{
                    marginBottom: 12,
                    borderBottom: '1px solid #f0f0f0',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 70, minWidth: 0, height: 21 }}
                    />
                    <Skeleton.Button
                      active
                      size="small"
                      shape="circle"
                      style={{ width: 21, height: 21, minWidth: 0 }}
                    />
                  </div>

                  <Skeleton.Button
                    active
                    size="small"
                    shape="square"
                    style={{ width: 21, height: 21, minWidth: 0 }}
                  />
                </div>

                <div style={{ flex: 1, padding: '0 8px 8px', overflowY: 'auto' }}>
                  {Array.from({ length: colIndex + 1 }).map((_, index) => (
                    <Card
                      key={index}
                      size="small"
                      style={{
                        marginBottom: 12,
                        borderRadius: 6,
                      }}
                    >
                      <Skeleton active title={false} paragraph={{ rows: 4 }} />
                    </Card>
                  ))}
                </div>
              </Card>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  if (!workspaceData) {
    return <></>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        padding: '20px',
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
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as TabKey)}
          items={tabItems.map(item => ({
            key: item.key,
            label: renderTabLabel(item),
          }))}
          tabBarStyle={{
            borderBottom: 'none',
            marginBottom: 0,
            height: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 8,
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
          <SortActive activities={activities} onSorted={() => {}} />
          <FilterActivities stages={stagesData?.data || []} onApply={handleApplyFilters} />
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

      {renderActiveView}
    </div>
  );
};

export default KanbanWorkspaces;
