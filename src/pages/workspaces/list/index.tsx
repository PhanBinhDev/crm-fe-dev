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
  Select,
  Drawer,
  Popover,
  Tooltip,
  Badge,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  BellOutlined,
  ShareAltOutlined,
  SaveOutlined,
  DownloadOutlined,
  UsergroupAddOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import {
  IconSettings,
  IconDownload,
  IconPlus,
  IconList,
  IconLayoutKanban,
  IconFilter,
  IconSortAscending,
  IconUsersGroup,
} from '@tabler/icons-react';

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

import { ActivityModal } from '@/pages/workspaces/components/modals/ActivityModal';
import { SortableKanbanColumn } from '@/pages/workspaces/components/kanbans/SortableKanbanColumn';
import { IActivity, IStage } from '@/common/types';
import '@/styles/kanban.css';
import { KanbanBoardSettings } from '@/pages/workspaces/components/settings/KanbanBoardSettings';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { KanbanFilterPopover } from '../components/kanbans/KanbanFilterPopover';
import { EditActivityModal } from '@/pages/workspaces/components/modals/EditActivityModal';
import { getActivityPriorityColor } from '@/utils';
import { ActivityPriority } from '@/common/enum/activity';

const { Title, Text } = Typography;

const getStageColor = (stage: IStage) => {
  return stage?.color || '#f5f5f5';
};

export const ActivitiesKanbanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
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
      retry: false,
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
      render: (priority: ActivityPriority) => (
        <Tag
          color={getActivityPriorityColor(priority)}
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
          marginBottom: 12,
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Tìm kiếm nhiệm vụ..."
          prefix={<IconList size={18} style={{ color: '#8c8c8c' }} />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 260, minWidth: 200 }}
        />
        <Space size="middle">
          <Button
            icon={<IconSettings size={16} />}
            onClick={() => setSettingsDrawerVisible(true)}
            style={{ borderRadius: 8 }}
          >
            Cài đặt
          </Button>
          <Button icon={<IconDownload size={18} />} style={{ borderRadius: 8 }}>
            Nhập / Xuất
          </Button>
          <Button
            icon={<IconPlus size={18} />}
            type="primary"
            style={{ borderRadius: 8 }}
            onClick={() => setActivityModalVisible(true)}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <Space>
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<IconList size={18} />}
            style={{ borderRadius: 8 }}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            type={viewMode === 'kanban' ? 'primary' : 'default'}
            icon={<IconLayoutKanban size={18} />}
            style={{ borderRadius: 8 }}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
        </Space>
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
            <Button icon={<IconFilter size={18} />} style={{ borderRadius: 8 }}>
              Filter
            </Button>
          </Popover>
          <Button icon={<IconSortAscending size={18} />} style={{ borderRadius: 8 }}>
            Sort
          </Button>
          <Button icon={<IconUsersGroup size={18} />} style={{ borderRadius: 8 }}>
            Group
          </Button>
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

            {/* Activity drag overlay */}
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

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BarsOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Title level={4} type="secondary">
                List View
              </Title>
              <Text type="secondary">Chế độ xem danh sách sẽ được phát triển sớm</Text>
            </div>
          </div>
        </Card>
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

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={editActivityModal}
        onCancel={() => {
          setEditActivityModal(false);
          setEditActivity(null);
        }}
        onSuccess={() => {
          setEditActivityModal(false);
          setEditActivity(null);
          refetch();
        }}
        activity={editActivity!}
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
    </div>
  );
};
