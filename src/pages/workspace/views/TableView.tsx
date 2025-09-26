import { ActivityPriority, ActivityStatus } from '@/common/enum/activity';
import { IActivity, IStage, IUser } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useModal } from '@/hooks/useModal';
import '@/styles/table-list.css';
import {
  getActivityPriorityColor,
  getActivityPriorityLabel,
  getActivityStatusLabel,
  getColorFromName,
  getInitials,
  useLocalStorageState,
} from '@/utils/activity';
import {
  AppstoreAddOutlined,
  CalendarOutlined,
  FlagOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
import { Avatar, Button, Checkbox, Dropdown, Space, Table, Tag, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

interface TableViewProps {
  stages: IStage[];
  activities: IActivity[];
  users: IUser[];
}

const TableView = ({ stages, activities, users }: TableViewProps) => {
  const { openModal } = useModal();
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
          <td colSpan={3}>
            <div
              className="dragging-item"
              style={{
                padding: '5px 10px',
                backgroundColor: '#fff',
                border: `2px solid ${stage?.color || '#1890ff'}`,
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'grabbing',
              }}
            >
              <span
                className="drag-handle-dragging"
                {...attributes}
                {...listeners}
                style={{
                  color: '#8c8c8c',
                  fontSize: '16px',
                  cursor: 'grabbing',
                  opacity: 1,
                }}
              >
                ⋮⋮
              </span>
              <div
                className="stage-indicator"
                style={{
                  width: '4px',
                  height: '32px',
                  backgroundColor: stage?.color || '#1890ff',
                  borderRadius: '2px',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>
                  {activity.name}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                  {stage ? getActivityStatusLabel(stage.title as ActivityStatus) : 'Chưa xác định'}
                </div>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr ref={setNodeRef} style={style} {...props} className={props.className}>
        {React.Children.map(children, (child, index) => {
          if (index === 0 && React.isValidElement(child)) {
            const rowNumber = dataSource.findIndex(item => item.id === props['data-row-key']) + 1;

            const typedChild = child as React.ReactElement<any>;

            return React.cloneElement(typedChild, {
              ...typedChild.props,
              children: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    style={{ cursor: 'grab', fontSize: '14px', color: '#8c8c8c' }}
                  >
                    ⋮⋮
                  </span>
                  <span style={{ color: '#8c8c8c', fontSize: 13 }}>{rowNumber}</span>
                  {typedChild.props.children}
                </div>
              ),
            });
          }
          return child;
        })}
      </tr>
    );
  };

  const tableColumns = [
    { key: 'stt', title: 'STT', dataIndex: 'id', width: 55, fixed: 'left' as const },
    {
      key: 'name',
      title: 'Tên công việc',
      dataIndex: 'name',
      width: 270,
      fixed: 'left' as const,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      key: 'type',
      title: 'Loại',
      dataIndex: 'type',
      width: 70,
      fixed: 'left' as const,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      key: 'assignees',
      title: 'Người thực hiện',
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
      key: 'stageId',
      title: 'Trạng thái',
      dataIndex: 'stageId',
      width: 150,
      render: (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        return (
          <Space size="small" style={{ flex: 1, gap: 4 }}>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                backgroundColor: stage?.color || '#f5f5f5',
                padding: '4px 8px 4px 6px',
                borderRadius: '6px',
              }}
            >
              <ColorPicker value={stage?.color || ''} size={8} disabled />
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: '13px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {stage ? getActivityStatusLabel(stage.title as ActivityStatus) : 'Chưa xác định'}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      key: 'priority',
      title: 'Ưu tiên',
      dataIndex: 'priority',
      width: 150,
      render: (priority: ActivityPriority) => (
        <Tag
          color={getActivityPriorityColor(priority)}
          icon={<FlagOutlined style={{ fontSize: 15 }} />}
          className="priority-tag"
          bordered={false}
        >
          {getActivityPriorityLabel(priority) || 'None'}
        </Tag>
      ),
    },
    {
      key: 'estimateTime',
      title: 'Ước tính thời gian',
      dataIndex: 'estimateTime',
      width: 100,
      render: (time: number) => (time ? <span style={{ fontSize: 13 }}>{time} giờ</span> : '-'),
    },
    {
      key: 'startTime',
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      width: 160,
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
    {
      key: 'endTime',
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      width: 160,
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
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'createdBy',
      title: 'Người tạo',
      dataIndex: 'createdBy',
      width: 120,
      render: (createdUserId: string) => {
        const user = users.find(u => u.id === createdUserId);
        return <div style={{ fontWeight: 500 }}>{user ? user.name : 'Không xác định'}</div>;
      },
    },
  ];

  const defaultColumn = ['stt', 'name', 'assignees', 'stageId', 'priority', 'endTime'];
  const { value: visibleColumns, setValue: setVisibleColumns } = useLocalStorageState(
    'tableView-visibleColumns',
    defaultColumn,
  );

  const tbColumns = tableColumns.filter(col => visibleColumns.includes(col.key));

  const menu = (
    <div style={{ padding: 8 }}>
      <Checkbox.Group
        value={visibleColumns}
        onChange={(checked: any) => setVisibleColumns(checked)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tableColumns.map(col => (
            <Checkbox
              key={col.key}
              value={col.key}
              disabled={col.key === 'name' || col.key === 'stt'}
            >
              {col.title}
            </Checkbox>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={dataSource.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Dropdown
              overlayClassName="dropdown-menu-overlay"
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button icon={<AppstoreAddOutlined />}>Cột hiển thị</Button>
            </Dropdown>
          </div>
          <Table
            className="table-view"
            columns={tbColumns}
            dataSource={dataSource}
            rowKey="id"
            scroll={{ x: 1200 }}
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
    </>
  );
};

export default TableView;
