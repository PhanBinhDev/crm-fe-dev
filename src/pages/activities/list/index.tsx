import React, { useState, useCallback, useMemo } from 'react';
import { useList, useUpdate } from '@refinedev/core';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Input,
  Drawer,
  Popover,
  Badge,
  Avatar,
  Table,
  Tag,
  Progress,
  Dropdown,
  Menu,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DownloadOutlined,
  UsergroupAddOutlined,
  SortAscendingOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { ActivityModal } from '@/pages/activities/components/modals/ActivityModal';
import { SortableKanbanColumn } from '@/pages/activities/components/kanbans/SortableKanbanColumn';
import { IActivity, IStage } from '@/common/types';
import '@/styles/kanban.css';
import { KanbanBoardSettings } from '@/pages/activities/components/settings/KanbanBoardSettings';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { KanbanFilterPopover } from '../components/kanbans/KanbanFilterPopover';

const { Title, Text } = Typography;

// Helper function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '#ff4d4f';
    case 'medium':
      return '#faad14';
    case 'low':
      return '#52c41a';
    default:
      return '#d9d9d9';
  }
};

// Helper function to get stage color
const getStageColor = (stage: IStage) => {
  return stage?.color || '#f5f5f5';
};

export const ActivitiesKanbanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>();
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [activeActivity, setActiveActivity] = useState<IActivity | null>(null);
  const [activeColumn, setActiveColumn] = useState<IStage | null>(null);
  const [dragType, setDragType] = useState<'activity' | 'column' | null>(null);

  useBodyScrollLock(settingsDrawerVisible);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { mode: 'off' },
    sorters: [{ field: 'position', order: 'asc' }],
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  });

  const filters = useMemo(() => {
    const filterArray = [];
    if (searchTerm) {
      filterArray.push({ field: 'title', operator: 'contains' as const, value: searchTerm });
    }
    if (selectedPriority) {
      filterArray.push({ field: 'priority', operator: 'eq' as const, value: selectedPriority });
    }
    if (selectedStatus) {
      filterArray.push({ field: 'status', operator: 'eq' as const, value: selectedStatus });
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      filterArray.push(
        { field: 'createdAt', operator: 'gte' as const, value: dateRange[0].toISOString() },
        { field: 'createdAt', operator: 'lte' as const, value: dateRange[1].toISOString() },
      );
    }
    return filterArray;
  }, [searchTerm, selectedPriority, selectedStatus, dateRange]);

  const { data: activitiesData, refetch } = useList<IActivity>({
    resource: 'activities',
    pagination: { pageSize: 1000 },
    filters,
  });
  console.log('activitydata', activitiesData);

  const { mutate: updateActivity } = useUpdate();
  const { mutate: updateStage } = useUpdate();

  const stages = useMemo(
    () => stagesData?.data?.sort((a, b) => a.position - b.position) || [],
    [stagesData],
  );

  const activities = useMemo(() => (activitiesData?.data || []) as IActivity[], [activitiesData]);

  const activitiesByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = activities.filter(activity => activity.stageId === stage.id);
      return acc;
    }, {} as Record<string, IActivity[]>);
  }, [stages, activities]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      const draggedColumn = stages.find(stage => stage.id === active.id);
      if (draggedColumn) {
        setActiveColumn(draggedColumn);
        setDragType('column');
        return;
      }

      const activity = activities.find(a => a.id === active.id);
      if (activity) {
        setActiveActivity(activity);
        setDragType('activity');
      }
    },
    [activities, stages],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveActivity(null);
      setActiveColumn(null);
      setDragType(null);

      if (!over || !active) return;

      // Handle column drag
      if (dragType === 'column') {
        const activeColumnIndex = stages.findIndex(stage => stage.id === active.id);
        const overColumnIndex = stages.findIndex(stage => stage.id === over.id);

        if (
          activeColumnIndex !== overColumnIndex &&
          activeColumnIndex !== -1 &&
          overColumnIndex !== -1
        ) {
          const newStages = arrayMove(stages, activeColumnIndex, overColumnIndex);

          // Update positions for all affected stages
          newStages.forEach((stage, index) => {
            if (stage.position !== index) {
              updateStage(
                {
                  resource: 'stages',
                  id: stage.id,
                  values: { position: index },
                  mutationMode: 'optimistic',
                },
                {
                  onError: () => {
                    refetch();
                  },
                },
              );
            }
          });
        }
        return;
      }

      if (dragType === 'activity') {
        const activeActivity = activities.find(a => a.id === active.id);
        if (!activeActivity) return;

        // Find target stage - check if dropping on stage or on activity within stage
        let targetStageId: string | undefined;

        if (stages.find(stage => stage.id === over.id)) {
          // Dropped directly on stage
          targetStageId = over.id as string;
        } else {
          // Dropped on activity - find which stage this activity belongs to
          for (const stage of stages) {
            if (
              activitiesByStage[stage.id]?.some((activity: IActivity) => activity.id === over.id)
            ) {
              targetStageId = stage.id;
              break;
            }
          }
        }

        if (!targetStageId || activeActivity.stageId === targetStageId) return;

        updateActivity({
          resource: 'activities',
          id: activeActivity.id,
          values: { stageId: targetStageId },
          mutationMode: 'optimistic',
          successNotification: false,
        });
      }
    },
    [dragType, activities, stages, activitiesByStage, updateActivity, updateStage, refetch],
  );

  const handleAddActivity = useCallback((stageId: string) => {
    setSelectedStageId(stageId);
    setActivityModalVisible(true);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedPriority(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const tableColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>{index + 1}</span>
      ),
    },
    {
      title: 'Task',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (text: string, record: IActivity) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{text}</div>
            {record.description && (
              <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: 1.3 }}>
                {record.description.length > 80
                  ? `${record.description.substring(0, 80)}...`
                  : record.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: string) => (
        <Tag
          color={getPriorityColor(priority)}
          icon={<FlagOutlined />}
          style={{ borderRadius: 12 }}
        >
          {priority || 'None'}
        </Tag>
      ),
    },
    {
      title: 'Assignee',
      dataIndex: 'assignedActivities',
      key: 'assignedActivities',
      width: 140,
      render: (assignee: any) =>
        assignee ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar size="small" src={assignee.avatar} icon={<UserOutlined />} />
            <span style={{ fontSize: 13 }}>{assignee.name}</span>
          </div>
        ) : (
          <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
            <UserOutlined />
          </Avatar>
        ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 140,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>{new Date(date).toLocaleDateString()}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number = 0) => (
        <Progress
          percent={status}
          size="small"
          strokeColor={status === 100 ? '#52c41a' : '#1890ff'}
          showInfo={false}
          style={{ margin: 0 }}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <span style={{ fontSize: 13, color: '#8c8c8c' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (record: IActivity) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit">Edit</Menu.Item>
              <Menu.Item key="duplicate">Duplicate</Menu.Item>
              <Menu.Item key="delete" danger>
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 16,
        }}
      >
        {/* Search box */}
        <Input
          placeholder="Tìm kiếm nhiệm vụ..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />
        <Space size="small">
          <Button icon={<SettingOutlined />} onClick={() => setSettingsDrawerVisible(true)}>
            Cài đặt
          </Button>
          <Button icon={<DownloadOutlined />}>Nhập / Xuất</Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setActivityModalVisible(true)}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      {/* Header row 2 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 16,
        }}
      >
        {/* Chuyển chế độ xem */}
        <Space>
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<BarsOutlined />}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            type={viewMode === 'kanban' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
        </Space>
        {/* Filter, Sort, Group */}
        <Space>
          <Popover
            placement="bottomLeft"
            content={
              <KanbanFilterPopover
                searchTerm={searchTerm}
                selectedPriority={selectedPriority}
                selectedStatus={selectedStatus}
                dateRange={dateRange}
                onSearch={handleSearch}
                onPriorityChange={setSelectedPriority}
                onStatusChange={setSelectedStatus}
                onDateRangeChange={setDateRange}
                onClearAll={clearAllFilters}
              />
            }
            trigger="click"
          >
            <Button icon={<FilterOutlined />}>Filter</Button>
          </Popover>
          <Button icon={<SortAscendingOutlined />}>Sort</Button>
          <Button icon={<UsergroupAddOutlined />}>Group</Button>
        </Space>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '0 4px 20px 4px',
            }}
          >
            {/* Sortable context for columns */}
            <SortableContext
              items={stages.map(stage => stage.id)}
              strategy={horizontalListSortingStrategy}
            >
              <Row
                gutter={16}
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  minWidth: `${stages.length * 300}px`,
                }}
              >
                {stages.map(stage => (
                  <Col key={stage.id} flex="0 0 280px">
                    <SortableKanbanColumn
                      id={stage.id}
                      stage={stage}
                      activities={activitiesByStage[stage.id] || []}
                      onAddActivity={handleAddActivity}
                      isDragOverlay={false}
                    />
                  </Col>
                ))}
              </Row>
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={{ duration: 200 }}>
            {/* Column drag overlay */}
            {activeColumn && dragType === 'column' ? (
              <div style={{ width: 280 }}>
                <SortableKanbanColumn
                  id={activeColumn.id}
                  stage={activeColumn}
                  activities={activitiesByStage[activeColumn.id] || []}
                  onAddActivity={() => {}}
                  isDragOverlay={true}
                />
              </div>
            ) : null}

            {activeActivity && dragType === 'activity' ? (
              <Card
                size="small"
                style={{
                  opacity: 0.98,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  cursor: 'grabbing',
                  width: 280,
                  borderRadius: 12,
                }}
                styles={{ body: { padding: '12px' } }}
              >
                <Title level={5} style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
                  {activeActivity.name}
                </Title>
                {activeActivity.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activeActivity.description.length > 50
                      ? `${activeActivity.description.substring(0, 50)}...`
                      : activeActivity.description}
                  </Text>
                )}
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {stages.map(stage => {
            const stageActivities = activitiesByStage[stage.id] || [];

            return (
              <Card
                key={stage.id}
                style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  borderLeft: `4px solid ${getStageColor(stage)}`,
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Stage Header */}
                <div
                  style={{
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getStageColor(stage),
                      }}
                    />
                    <Title level={5} style={{ margin: 0, color: '#262626' }}>
                      {stage.title}
                    </Title>
                    <Badge
                      count={stageActivities.length}
                      style={{
                        backgroundColor: getStageColor(stage),
                        fontSize: '11px',
                        minWidth: '20px',
                        height: '20px',
                        lineHeight: '18px',
                      }}
                    />
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddActivity(stage.id)}
                    style={{ color: '#8c8c8c' }}
                  >
                    Add task
                  </Button>
                </div>

                {/* Tasks Table */}
                {stageActivities.length > 0 ? (
                  <Table
                    columns={tableColumns}
                    dataSource={stageActivities}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                    size="middle"
                    className="clickup-table"
                    rowClassName="clickup-table-row"
                    showHeader={stage.position === 0}
                  />
                ) : (
                  <div
                    style={{
                      padding: '40px 24px',
                      textAlign: 'center',
                      color: '#8c8c8c',
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>No tasks in this status</div>
                    <Button type="link" size="small" onClick={() => handleAddActivity(stage.id)}>
                      Add the first task
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        visible={activityModalVisible}
        onCancel={() => {
          setActivityModalVisible(false);
          setSelectedStageId(undefined);
        }}
        onSuccess={() => {
          setActivityModalVisible(false);
          setSelectedStageId(undefined);
          refetch();
        }}
        stageId={selectedStageId}
      />

      {/* Settings Drawer */}
      <Drawer
        title="Cài đặt Kanban Board"
        width={700}
        open={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
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
        <KanbanBoardSettings />
      </Drawer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .clickup-table .ant-table-thead > tr > th {
            background-color: #fafafa;
            border-bottom: 2px solid #f0f0f0;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #8c8c8c;
            padding: 12px 16px;
          }
          
          .clickup-table-row {
            border-bottom: 1px solid #f0f0f0;
          }
          
          .clickup-table-row:hover {
            background-color: #fafafa;
          }
          
          .clickup-table .ant-table-tbody > tr > td {
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
          }
          
          .clickup-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }
        `,
        }}
      />
    </div>
  );
};
