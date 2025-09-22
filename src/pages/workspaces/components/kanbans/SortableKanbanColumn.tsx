import { IActivity, IStage } from '@/common/types';
import { hexToRgba } from '@/utils/formatter';
import { DragOutlined, PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUpdate } from '@refinedev/core';
import { Badge, Button, Card, ColorPicker, message, Space, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SortableActivityCard } from './SortableActivityCard';
const { Text } = Typography;

interface SortableKanbanColumnProps {
  id: string;
  stage: IStage;
  activities: IActivity[];
  isDragOverlay?: boolean;
  onAddActivity: (stageId: string) => void;
  onClick: (item: IActivity) => void;
  onChange?: (stage: { id: string; title: string; position: number; color: string }) => void;
}

export const SortableKanbanColumn: React.FC<SortableKanbanColumnProps> = ({
  id,
  stage,
  activities,
  onAddActivity,
  isDragOverlay = false,
  onClick,
  onChange,
}) => {
  const activityIds = useMemo(() => activities.map(activity => activity.id), [activities]);
  const { mutate: updateStage } = useUpdate<IStage>();
  const [title, setTitle] = useState(stage.title);
  const [color, setColor] = useState(stage.color);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setTitle(stage.title);
    setColor(stage.color);
  }, [stage.title, stage.color]);

  const handleColorChange = useCallback(
    (colorValue: any) => {
      const newColor = colorValue.toHexString();
      setColor(newColor);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateStage(
          {
            resource: 'stages',
            id: stage.id,
            values: {
              title,
              position: stage.position,
              color: newColor,
            },
          },
          {
            onSuccess: () => {
              onChange?.({
                id: stage.id,
                title,
                position: stage.position,
                color: newColor,
              });
              message.success('Cập nhật màu sắc cột thành công');
            },
            onError: () => {
              message.error('Cập nhật màu sắc cột thất bại');
            },
          },
        );
      }, 500);
    },
    [updateStage, stage.id, stage.position, title, onChange],
  );

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

  const stageStats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const overdue = activities.filter(a => a.status === 'overdue').length;
    const highPriority = activities.filter(
      a => a.priority === 'high' || a.priority === 'urgent',
    ).length;

    return { total, completed, overdue, highPriority };
  }, [activities]);

  const getStageColor = (stage: IStage) => {
    return stage?.color || '#f5f5f5';
  };

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
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                backgroundColor: color,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              <ColorPicker
                value={color}
                open={open}
                onOpenChange={setOpen}
                trigger="click"
                onChange={handleColorChange}
                onChangeComplete={handleColorChange}
                styles={{
                  popup: { padding: 0 },
                }}
              >
                <div
                  onClick={() => setOpen(true)}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    border: '2px solid #d9d9d9',
                    backgroundColor: color,
                    cursor: 'pointer',
                  }}
                />
              </ColorPicker>

              <Text style={{ fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {title}
              </Text>
            </div>

            <Badge
              count={stageStats.total}
              size="small"
              style={{
                backgroundColor: '#f0f0f0',
                color: '#666',
                border: '1px solid #d9d9d9',
              }}
            />
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
          </Space>
        </div>
      }
      styles={{
        header: {
          minHeight: 42,
          padding: '0 12px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: `${hexToRgba(getStageColor(stage), 0.02)}`,
        },
        body: {
          padding: '5px 8px 0 8px',
          overflowY: 'auto',
          overflowX: 'hidden',
          borderTop: isDraggedOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
          backgroundColor: `${hexToRgba(getStageColor(stage), 0.02)}`,
          transition: 'all 0.2s ease',
          marginBottom: 0,
          width: '260px',
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
