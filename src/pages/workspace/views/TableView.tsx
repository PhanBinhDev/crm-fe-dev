import { ActivityPriority } from '@/common/enum/activity';
import { IActivity, IStage } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import {
  getActivityPriorityColor,
  getActivityPriorityLabel,
  getColorFromName,
  getInitials,
} from '@/utils/activity';
import { CalendarOutlined, FlagOutlined, UserOutlined } from '@ant-design/icons';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;

interface TableViewProps {
  stages: IStage[];
  activities: IActivity[];
}

const TableView = ({ stages, activities }: TableViewProps) => {
  console.log(activities);
  const [dataSource, setDataSource] = useState<IActivity[]>(activities);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = dataSource.findIndex(item => item.id === active.id);
      const newIndex = dataSource.findIndex(item => item.id === over.id);

      setDataSource(arrayMove(dataSource, oldIndex, newIndex));
    }
  };

  const SortableRow = ({ children, ...props }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });

    const style = {
      ...props.style,
      transform: CSS.Transform.toString(transform),
      transition,
      ...(isDragging
        ? {
            position: 'relative' as const,
            zIndex: 9999,
          }
        : {}),
    };

    // Lấy thông tin activity để hiển thị khi drag
    const activity = dataSource.find(item => item.id === props['data-row-key']);
    const stage = stages.find(s => s.id === activity?.stageId);

    if (isDragging && activity) {
      return (
        <tr ref={setNodeRef} style={style} {...props} className="row-dragging">
          <td colSpan={6}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#fff',
                borderRadius: '6px',
                border: `2px solid ${stage?.color || '#1890ff'}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                width: '30%',
                minWidth: '250px',
              }}
            >
              <span
                className="drag-handle"
                {...attributes}
                {...listeners}
                style={{ cursor: 'grabbing', color: '#8c8c8c', fontSize: '12px' }}
              >
                ⋮⋮
              </span>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: stage?.color || '#1890ff',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#262626',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activity.name}
              </span>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr ref={setNodeRef} style={style} {...props} className={props.className}>
        {children?.map((child: any, index: number) => {
          if (index === 0) {
            return {
              ...child,
              props: {
                ...child.props,
                children: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span
                      className="drag-handle"
                      {...attributes}
                      {...listeners}
                      style={{ cursor: 'grab' }}
                    >
                      ⋮⋮
                    </span>
                    <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                      {dataSource.findIndex(item => item.id === props['data-row-key']) + 1}
                    </span>
                  </div>
                ),
              },
            };
          }
          return child;
        })}
      </tr>
    );
  };

  const tableColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: 'Task',
      dataIndex: 'name',
      width: 350,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignees',
      width: 160,
      render: (assignees: any[]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {assignees?.length > 0 ? (
            assignees.slice(0, 3).map((assignee, index) => (
              <Tooltip key={index} title={assignee.user.name}>
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
            <Tooltip title="Chưa có người thực hiện">
              <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
                <UserOutlined />
              </Avatar>
            </Tooltip>
          )}
          {assignees?.length > 3 && (
            <Avatar
              size="small"
              style={{ backgroundColor: '#f5f5f5', color: '#999', marginLeft: -8 }}
            >
              +{assignees.length - 3}
            </Avatar>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'stageId',
      width: 160,
      render: (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        return (
          <Space size="small">
            <div
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: stage?.color || '#f5f5f5',
              }}
            >
              <ColorPicker value={stage?.color || ''} />
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                {stage?.title || ''}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 160,
      render: (priority: ActivityPriority) => (
        <Tag
          color={getActivityPriorityColor(priority)}
          icon={<FlagOutlined style={{ fontSize: 15 }} />}
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: 13,
          }}
          bordered={false}
        >
          {getActivityPriorityLabel(priority) || 'None'}
        </Tag>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      width: 150,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={dataSource.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          rowKey="id"
          tableLayout="fixed"
          components={{
            body: {
              row: SortableRow,
            },
          }}
          pagination={false}
        />
      </SortableContext>
    </DndContext>
  );
};

export default TableView;
