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
  DatePicker,
  Drawer,
  Flex,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ClearOutlined,
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

import { ActivityModal } from '@/pages/activities/components/ActivityModal';
import { SortableKanbanColumn } from '@/pages/activities/components/SortableKanbanColumn';
import { IActivity, IStage } from '@/common/types';
import '@/styles/kanban.css';
import { KanbanBoardSettings } from '@/pages/activities/components/settings/KanbanBoardSettings';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

const { Title, Text } = Typography;
const { Option } = Select;

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

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedPriority(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  }, []);

  const hasActiveFilters = searchTerm || selectedPriority || selectedStatus || dateRange;

  return (
    <div style={{ padding: '16px 24px' }}>
      {/* Compact Header */}
      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '16px' } }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, fontSize: 20 }}>
            Kanban Board
          </Title>

          <Space size="small">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="middle"
              onClick={() => setActivityModalVisible(true)}
            >
              Thêm mới
            </Button>
            <Button
              icon={<SettingOutlined />}
              size="middle"
              onClick={() => setSettingsDrawerVisible(true)}
            >
              Cài đặt
            </Button>
            <Space.Compact size="middle">
              <Button
                type={viewMode === 'kanban' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<BarsOutlined />}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Space.Compact>
          </Space>
        </Flex>

        {/* Compact Filters */}
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm hoạt động..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Độ ưu tiên"
              value={selectedPriority}
              onChange={setSelectedPriority}
              allowClear
              size="middle"
              style={{ width: '100%' }}
            >
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
              <Option value="urgent">Khẩn cấp</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              size="middle"
              style={{ width: '100%' }}
            >
              <Option value="new">Mới</Option>
              <Option value="in_progress">Đang thực hiện</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              size="middle"
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={12} sm={6} md={2} lg={2}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }} size="middle" type="dashed">
              Lọc
            </Button>
          </Col>
          {hasActiveFilters && (
            <Col xs={12} sm={6} md={2} lg={2}>
              <Button
                icon={<ClearOutlined />}
                style={{ width: '100%' }}
                size="middle"
                onClick={clearAllFilters}
                type="text"
                danger
              >
                Xóa
              </Button>
            </Col>
          )}
        </Row>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <Text type="secondary">Đang lọc: {activities.length} hoạt động</Text>
          </div>
        )}
      </Card>

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
                  minWidth: `${stages.length * 300}px`, // Minimum width for all columns
                }}
              >
                {stages.map(stage => (
                  <Col key={stage.id} flex="0 0 280px">
                    {' '}
                    {/* Fixed width columns */}
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
                  opacity: 0.9,
                  transform: 'rotate(5deg)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                  cursor: 'grabbing',
                  width: 280,
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
