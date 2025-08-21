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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
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
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
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
import { getColorFromName, getInitials } from '@/utils/activity';
import { AVATAR_PLACEHOLDER } from '@/constants/app';

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
  const [editActivityModal, setEditActivityModal] = useState(false);
  const [editActivity, setEditActivity] = useState<IActivity | null>(null);

  const getTargetStageId = (over: any) => {
    const sortableData = over?.data?.current?.sortable;
    if (sortableData?.containerId) return String(sortableData.containerId);
    return over?.id ? String(over.id) : undefined;
  };

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
      const t = event.active?.data?.current?.type as 'column' | 'activity' | undefined;

      if (t === 'column') {
        const col = stages.find(s => s.id === event.active.id);
        if (col) setActiveColumn(col);
        return;
      }

      if (t === 'activity') {
        const a = activities.find(x => x.id === event.active.id);
        if (a) setActiveActivity(a);
      }
    },
    [activities, stages],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveActivity(null);
      setActiveColumn(null);

      if (!over || !active) return;

      const type = active.data?.current?.type as 'column' | 'activity' | undefined;

      if (type === 'column') {
        const from = stages.findIndex(s => s.id === active.id);
        // over có thể là 1 column hoặc 1 activity trong column; lấy containerId nếu có
        const overStageId = getTargetStageId(over);
        const to = stages.findIndex(s => s.id === overStageId);
        if (from === -1 || to === -1 || from === to) return;

        const newStages = arrayMove(stages, from, to);

        newStages.forEach((stage, idx) => {
          if (stage.position !== idx) {
            updateStage(
              {
                resource: 'stages',
                id: stage.id,
                values: { position: idx },
                mutationMode: 'optimistic',
              },
              { onError: () => refetch() },
            );
          }
        });
        return;
      }

      if (type === 'activity') {
        const a = activities.find(x => x.id === active.id);
        if (!a) return;

        const targetStageId = getTargetStageId(over);
        if (!targetStageId) return;

        if (a.stageId !== targetStageId) {
          updateActivity({
            resource: 'activities',
            id: a.id,
            values: { stageId: targetStageId },
            mutationMode: 'optimistic',
            successNotification: false,
          });
          return;
        }

        // (TÙY CHỌN) Nếu có field position trong IActivity, thêm logic reorder trong cùng cột:
        // const list = activitiesByStage[targetStageId] || [];
        // const from = list.findIndex(x => x.id === active.id);
        // const overId = over.id as string;
        // const to = list.findIndex(x => x.id === overId);
        // if (from !== -1 && to !== -1 && from !== to) {
        //   const reordered = arrayMove(list, from, to);
        //   // cập nhật position cho các item bị ảnh hưởng (optimistic)
        //   reordered.forEach((item, idx) => {
        //     if (item.position !== idx) {
        //       updateActivity({
        //         resource: 'activities',
        //         id: item.id,
        //         values: { position: idx },
        //         mutationMode: 'optimistic',
        //         successNotification: false,
        //       });
        //     }
        //   });
        // }
      }
    },
    [stages, activities, activitiesByStage, updateStage, updateActivity, refetch],
  );

  const handleAddActivity = useCallback((stageId: string) => {
    setSelectedStageId(stageId);
    setActivityModalVisible(true);
  }, []);

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
      dataIndex: 'assignees',
      key: 'assignees',
      width: 140,
      render: (assignees: any[]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {assignees && assignees.length > 0 ? (
            assignees.slice(0, 3).map((assignee, index) => (
              <Tooltip key={index} title={assignee.user.name} placement="top">
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
                      backgroundColor: getColorFromName(assignee.user.name || AVATAR_PLACEHOLDER),
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
            <Tooltip title="Chưa có người thực hiện" placement="top">
              <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
                <UserOutlined />
              </Avatar>
            </Tooltip>
          )}

          {/* Hiển thị số lượng còn lại nếu có nhiều hơn 3 assignees */}
          {assignees && assignees.length > 3 && (
            <Avatar
              size="small"
              style={{
                backgroundColor: '#f5f5f5',
                color: '#999',
                marginLeft: -8,
              }}
            >
              +{assignees.length - 3}
            </Avatar>
          )}
        </div>
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
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Chỉnh sửa',
                onClick: () => handleOpenEditActivityModal(record),
              },
              {
                key: 'duplicate',
                label: 'Nhân bản',
                onClick: () => console.log('Duplicate', record.id),
              },
              {
                key: 'delete',
                label: 'Xoá',
                danger: true,
                onClick: () => console.log('Delete', record.id),
              },
            ],
          }}
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
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
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
          collisionDetection={closestCorners}
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
                      onClick={handleOpenEditActivityModal}
                    />
                  </Col>
                ))}
              </Row>
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={{ duration: 200 }}>
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
                styles={{ body: { padding: 0 } }}
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
