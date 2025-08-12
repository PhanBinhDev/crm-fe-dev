import React, { useMemo } from 'react';
import { IActivity, IStage } from '@/common/types';
import { PlusOutlined, MoreOutlined, DragOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Card, Space, Typography, Badge, Dropdown, MenuProps } from 'antd';
import { SortableActivityCard } from './SortableActivityCard';

const { Text } = Typography;

interface SortableKanbanColumnProps {
  id: string;
  stage: IStage;
  activities: IActivity[];
  onAddActivity: (stageId: string) => void;
  onClick: (item: IActivity) => void;
  isDragOverlay?: boolean;
}

export const SortableKanbanColumn: React.FC<SortableKanbanColumnProps> = ({
  id,
  stage,
  activities,
  onAddActivity,
  isDragOverlay = false,
  onClick,
}) => {
  const activityIds = useMemo(() => activities.map(activity => activity.id), [activities]);

  // Sortable for column dragging
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef: setSortableRef,
    transform: sortableTransform,
    transition: sortableTransition,
    isDragging: isColumnDragging,
  } = useSortable({
    id,
    data: {
      type: 'column',
      stage,
    },
  });

  // Droppable for activity dropping
  const {
    setNodeRef: setDroppableRef,
    isOver,
    active,
  } = useDroppable({
    id,
    data: {
      type: 'stage',
      stage,
    },
  });

  // Combine refs
  const setRefs = (element: HTMLElement | null) => {
    setSortableRef(element);
    setDroppableRef(element);
  };

  // Calculate stage statistics
  const stageStats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const overdue = activities.filter(a => a.status === 'overdue').length;
    const highPriority = activities.filter(
      a => a.priority === 'high' || a.priority === 'urgent',
    ).length;

    return { total, completed, overdue, highPriority };
  }, [activities]);

  // Stage color based on type or custom color
  const getStageColor = (stage: IStage) => {
    if (stage.color) return stage.color;

    return '#f5f5f5';
  };

  // Dropdown menu for column actions
  const columnMenuItems: MenuProps['items'] = [
    {
      key: 'add',
      label: 'Thêm hoạt động',
      icon: <PlusOutlined />,
      onClick: () => onAddActivity(stage.id),
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa cột',
    },
    {
      key: 'duplicate',
      label: 'Nhân bản cột',
    },
    {
      key: 'divider2',
      type: 'divider',
    },
    {
      key: 'clear',
      label: 'Xóa tất cả hoạt động',
      disabled: activities.length === 0,
    },
    {
      key: 'delete',
      label: 'Xóa cột',
      danger: true,
    },
  ];

  const isDraggedOver = isOver && active && active.data.current?.type === 'activity';
  const isEmpty = activities.length === 0;

  const columnStyle = {
    transform: CSS.Transform.toString(sortableTransform),
    transition: isColumnDragging ? 'none' : sortableTransition,
    opacity: isColumnDragging ? 0.5 : 1,
    cursor: isColumnDragging ? 'grabbing' : 'default',
  };

  return (
    <Card
      ref={setRefs}
      style={columnStyle}
      className={`kanban-column ${isDraggedOver ? 'drag-over' : ''} ${
        isEmpty ? 'empty-column' : ''
      } ${isColumnDragging ? 'column-dragging' : ''}`}
      size="small"
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <Space size="small" style={{ flex: 1 }}>
            {/* Drag handle for column */}
            <div
              {...sortableAttributes}
              {...sortableListeners}
              style={{
                cursor: 'grab',
                padding: '2px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Kéo để sắp xếp cột"
            >
              <DragOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
            </div>

            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStageColor(stage),
                border: '2px solid #d9d9d9',
              }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {stage.title}
            </Text>
            <Badge
              count={stageStats.total}
              size="small"
              style={{
                backgroundColor: '#f0f0f0',
                color: '#666',
                border: '1px solid #d9d9d9',
              }}
            />
            {/* {stageStats.overdue > 0 && (
              <Badge
                count={stageStats.overdue}
                size="small"
                style={{ backgroundColor: '#ff4d4f' }}
                title={`${stageStats.overdue} quá hạn`}
              />
            )}
            {stageStats.highPriority > 0 && (
              <Badge
                count={stageStats.highPriority}
                size="small"
                style={{ backgroundColor: '#faad14' }}
                title={`${stageStats.highPriority} ưu tiên cao`}
              />
            )} */}
          </Space>

          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={e => {
                e.stopPropagation();
                onAddActivity(stage.id);
              }}
              style={{
                minWidth: 24,
                height: 24,
                padding: 0,
              }}
              title="Thêm hoạt động mới"
            />
            <Dropdown menu={{ items: columnMenuItems }} trigger={['click']} placement="bottomRight">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={e => e.stopPropagation()}
                style={{
                  minWidth: 24,
                  height: 24,
                  padding: 0,
                }}
                title="Thêm tùy chọn"
              />
            </Dropdown>
          </Space>
        </div>
      }
      styles={{
        header: {
          minHeight: 42,
          padding: '0 12px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: getStageColor(stage),
        },
        body: {
          padding: '8px',
          height: 'calc(100vh - 230px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          border: isDraggedOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
          backgroundColor: isDraggedOver ? '#f0f9ff' : '#fafafa',
          transition: 'all 0.2s ease',
          minHeight: 400,
          marginBottom: 0,
        },
      }}
    >
      <SortableContext id={stage.id} items={activityIds} strategy={verticalListSortingStrategy}>
        <div className="activities-list">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  marginBottom: index === activities.length - 1 ? 0 : 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <SortableActivityCard
                  onClick={() => onClick(activity)}
                  activity={activity}
                  isDragOverlay={isDragOverlay}
                />
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#bfbfbf',
                fontSize: 12,
                border: '2px dashed #f0f0f0',
                borderRadius: 6,
                backgroundColor: '#fafafa',
              }}
            >
              <PlusOutlined style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
              <div>Không có hoạt động</div>
              <div style={{ marginTop: 4 }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => onAddActivity(stage.id)}
                  style={{ padding: 0, height: 'auto', fontSize: 12 }}
                >
                  Thêm hoạt động đầu tiên
                </Button>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Drop zone indicator when dragging activity over empty column */}
      {isDraggedOver && isEmpty && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '12px 20px',
            backgroundColor: '#e6f4ff',
            border: '1px dashed #1890ff',
            borderRadius: 12,
            color: '#1890ff',
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          Thả hoạt động vào đây
        </div>
      )}

      {/* Column drag overlay */}
      {isDragOverlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            border: '1px solid #1890ff',
            borderRadius: 12,
            pointerEvents: 'none',
          }}
        />
      )}
    </Card>
  );
};
