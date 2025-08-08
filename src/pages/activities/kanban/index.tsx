import React, { useState } from 'react';
import { useList, useUpdate } from '@refinedev/core';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Button,
  Space,
  Dropdown,
  Input,
  Select,
  DatePicker,
  Drawer,
} from 'antd';
import {
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BarsOutlined,
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
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import { ActivityModal } from '../components/ActivityModal';
import { StageManager } from '../components/StageManager';
import { IActivity, IStage } from '@/common/types';
import { ActivityPriority } from '@/common/enum/activity';
import './kanban.css';

const { Title, Text } = Typography;
const { Option } = Select;

const priorityColors = {
  [ActivityPriority.LOW]: 'blue',
  [ActivityPriority.MEDIUM]: 'orange',
  [ActivityPriority.HIGH]: 'red',
  [ActivityPriority.URGENT]: 'purple',
};

const SortableActivityCard: React.FC<{ activity: IActivity }> = ({ activity }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assigneeNames = 'Unknown'; // IActivity không có assignees field, cần kiểm tra lại backend

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      size="small"
      className={`activity-card ${isDragging ? 'dragging' : ''}`}
      bodyStyle={{ padding: 12 }}
      actions={[
        <Dropdown
          key="more"
          menu={{
            items: [
              { key: 'edit', label: 'Chỉnh sửa' },
              { key: 'delete', label: 'Xóa', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <MoreOutlined />
        </Dropdown>,
      ]}
    >
      <div>
        <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: 14 }}>
          {activity.name}
        </Title>

        {activity.description && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            {activity.description.length > 100
              ? `${activity.description.substring(0, 100)}...`
              : activity.description}
          </Text>
        )}

        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {activity.priority && (
            <Tag color={priorityColors[activity.priority]} icon={<FlagOutlined />}>
              {activity.priority.toUpperCase()}
            </Tag>
          )}

          <div className="activity-meta">
            {activity.endTime && (
              <>
                <CalendarOutlined />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(activity.endTime).format('DD/MM/YYYY')}
                </Text>
              </>
            )}

            {activity.estimateTime && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {activity.estimateTime}p
              </Text>
            )}
          </div>

          {assigneeNames && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <Avatar size={20} icon={<UserOutlined />} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12 }}>{assigneeNames}</Text>
            </div>
          )}
        </Space>
      </div>
    </Card>
  );
};

const KanbanColumn: React.FC<{
  id: string;
  stage: IStage;
  activities: IActivity[];
  onAddActivity: (stageId: string) => void;
}> = ({ id, stage, activities, onAddActivity }) => {
  const activityIds = activities.map(activity => activity.id);

  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <Card
      ref={setNodeRef}
      className="kanban-column"
      title={
        <div className="column-header">
          <Space>
            <Text strong>{stage.title}</Text>
            <span className="task-count">{activities.length}</span>
          </Space>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAddActivity(stage.id)}
          />
        </div>
      }
      style={{
        height: 'calc(100vh - 200px)',
        marginBottom: 0,
      }}
      bodyStyle={{
        padding: 16,
        height: 'calc(100vh - 260px)',
        overflowY: 'auto',
      }}
    >
      <SortableContext id={stage.id} items={activityIds} strategy={verticalListSortingStrategy}>
        <div className="activities-list">
          {activities.map(activity => (
            <div key={activity.id} style={{ marginBottom: 8 }}>
              <SortableActivityCard activity={activity} />
            </div>
          ))}
        </div>
      </SortableContext>
    </Card>
  );
};

export const ActivitiesKanbanPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>();
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [activeActivity, setActiveActivity] = useState<IActivity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch stages
  const { data: stagesData } = useList<IStage>({
    resource: 'stages',
    pagination: { pageSize: 100 },
    sorters: [{ field: 'position', order: 'asc' }],
  });

  // Fetch activities
  const { data: activitiesData, refetch } = useList<IActivity>({
    resource: 'activities',
    pagination: { pageSize: 1000 },
    filters: [
      ...(searchTerm ? [{ field: 'name', operator: 'contains' as const, value: searchTerm }] : []),
      ...(selectedPriority
        ? [{ field: 'priority', operator: 'eq' as const, value: selectedPriority }]
        : []),
      ...(selectedStatus
        ? [{ field: 'status', operator: 'eq' as const, value: selectedStatus }]
        : []),
    ],
  });

  const { mutate: updateActivity } = useUpdate();

  const stages = stagesData?.data?.sort((a, b) => a.position - b.position) || [];
  const activities = (activitiesData?.data || []) as IActivity[];

  // Group activities by stage
  const activitiesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = activities.filter(activity => activity.stageId === stage.id);
    return acc;
  }, {} as Record<string, IActivity[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activity = activities.find(a => a.id === active.id);
    setActiveActivity(activity || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeActivity = activities.find(a => a.id === active.id);
    if (!activeActivity) return;

    // Tìm stage từ over ID
    const targetStage = stages.find(
      stage =>
        stage.id === over.id ||
        activitiesByStage[stage.id]?.some((activity: IActivity) => activity.id === over.id),
    );

    if (!targetStage) return;

    // Chỉ update nếu stage thay đổi
    if (activeActivity.stageId !== targetStage.id) {
      updateActivity(
        {
          resource: 'activities',
          id: activeActivity.id,
          values: {
            stageId: targetStage.id,
          },
        },
        {
          onSuccess: () => {
            refetch();
          },
        },
      );
    }

    setActiveActivity(null);
  };

  const handleAddActivity = (stageId: string) => {
    setSelectedStageId(stageId);
    setActivityModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Kanban Board
          </Title>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setActivityModalVisible(true)}
            >
              Thêm mới
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsDrawerVisible(true)}>
              Cài đặt
            </Button>
            <Button.Group>
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
                Danh sách
              </Button>
            </Button.Group>
          </Space>
        </div>

        {/* Filters */}
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm hoạt động..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Độ ưu tiên"
              value={selectedPriority}
              onChange={setSelectedPriority}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
              <Option value="urgent">Khẩn cấp</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="new">Mới</Option>
              <Option value="in_progress">Đang thực hiện</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Col>
          <Col span={4}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Col>
          <Col span={4}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }}>
              Lọc nâng cao
            </Button>
          </Col>
        </Row>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Row
            gutter={16}
            style={{
              overflowX: 'scroll',
              display: 'flex',
              flexWrap: 'nowrap',
              padding: '20px 10px',
            }}
          >
            {stages.map(stage => (
              <Col key={stage.id} span={5}>
                <KanbanColumn
                  id={stage.id}
                  stage={stage}
                  activities={activitiesByStage[stage.id] || []}
                  onAddActivity={handleAddActivity}
                />
              </Col>
            ))}
          </Row>

          <DragOverlay>
            {activeActivity ? (
              <Card size="small" style={{ opacity: 0.8 }}>
                <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                  {activeActivity.name}
                </Title>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <Text>List view will be implemented here</Text>
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
        width={600}
        open={settingsDrawerVisible}
        onClose={() => setSettingsDrawerVisible(false)}
      >
        <StageManager />
      </Drawer>
    </div>
  );
};
