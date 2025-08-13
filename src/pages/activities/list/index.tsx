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
import { EditActivityModal } from '@/pages/activities/components/modals/EditActivityModal';

const { Title, Text } = Typography;

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
  const [editActivityModal, setEditActivityModal] = useState(false);
  const [editActivity, setEditActivity] = useState<IActivity | null>(null);

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

  // edit
  const handleOpenEditActivityModal = useCallback((activity: IActivity) => {
    setEditActivityModal(true);
    setEditActivity(activity);
    console.log(activity);
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
                      onClick={handleOpenEditActivityModal}
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
                  onClick={handleOpenEditActivityModal}
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
        activity={editActivity}
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
