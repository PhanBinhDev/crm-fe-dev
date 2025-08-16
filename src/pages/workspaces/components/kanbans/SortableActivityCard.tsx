import React, { useMemo, useState } from 'react';
import { IActivity } from '@/common/types';
import {
  CalendarOutlined,
  FlagOutlined,
  MoreOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Avatar,
  Card,
  Dropdown,
  Space,
  Tag,
  Typography,
  Tooltip,
  MenuProps,
  Progress,
  Input,
  Modal,
  message,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useDelete, useUpdate } from '@refinedev/core';
import { getColorFromName, getInitials } from '@/utils/activity';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

interface SortableActivityCardProps {
  activity: IActivity;
  isDragOverlay?: boolean;
  onClick: (item: IActivity) => void;
}

export const SortableActivityCard: React.FC<SortableActivityCardProps> = ({
  activity,
  isDragOverlay = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: {
      type: 'activity',
      activity,
    },
  });

  const { mutate: updateActivityName } = useUpdate({
    successNotification: false,
    errorNotification: false,
  });
  const { mutate: deleteActivity } = useDelete();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(activity.name);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // Calculate activity metadata
  const activityMeta = useMemo(() => {
    const now = dayjs();
    const endTime = activity.endTime ? dayjs(activity.endTime) : null;
    const isOverdue = endTime && now.isAfter(endTime) && activity.status !== 'completed';
    const isNearDeadline = endTime && now.add(1, 'day').isAfter(endTime) && !isOverdue;

    // Mock assignees - replace with real data when available
    const assignees = activity.assignees || [];
    const assigneeNames =
      assignees.length > 0
        ? assignees.map(a => a.user.name || a.user.email || 'Unknown').join(', ')
        : null;

    // Calculate progress if available
    const progress = activity.progress || 0;

    return {
      isOverdue,
      isNearDeadline,
      assigneeNames,
      assignees,
      progress,
      endTime,
    };
  }, [activity]);

  // Priority configuration
  const priorityConfig = useMemo(() => {
    const configs = {
      low: { color: '#52c41a', text: 'Thấp', icon: <FlagOutlined /> },
      medium: { color: '#faad14', text: 'Trung bình', icon: <FlagOutlined /> },
      high: { color: '#fa8c16', text: 'Cao', icon: <FlagOutlined /> },
      urgent: { color: '#f5222d', text: 'Khẩn cấp', icon: <ExclamationCircleOutlined /> },
    };
    return configs[activity.priority ?? 'medium'] || configs.medium;
  }, [activity.priority]);

  // Status configuration
  const statusConfig = useMemo(() => {
    const configs = {
      new: { color: '#d9d9d9', text: 'Mới' },
      in_progress: { color: '#1890ff', text: 'Đang thực hiện' },
      completed: { color: '#52c41a', text: 'Hoàn thành' },
      overdue: { color: '#f5222d', text: 'Quá hạn' },
    };
    return configs[activity.status] || configs.new;
  }, [activity.status]);

  // Dropdown menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
    },
    {
      key: 'rename',
      label: 'Sửa tên',
      icon: <EditOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'duplicate',
      label: 'Nhân bản',
    },
    {
      key: 'archive',
      label: 'Lưu trữ',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  // Handle menu click
  const handleMenuClick = (key: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent card drag when clicking menu
    switch (key) {
      case 'rename':
        setIsEditing(true);
        break;
      case 'delete':
        Modal.confirm({
          title: 'Xác nhận xóa',
          content: 'Bạn có chắc chắn muốn xóa hoạt động này?',
          onOk() {
            deleteActivity({
              resource: 'activities',
              id: activity.id,
              mutationMode: 'optimistic',
            });
          },
        });
        break;

      default:
        break;
    }
  };

  const handleNameSave = () => {
    if (editedName.trim() === activity.name) {
      setIsEditing(false);
      return;
    }

    updateActivityName(
      {
        resource: 'activities',
        id: activity.id,
        values: { name: editedName.trim() },
        mutationMode: 'optimistic',
      },
      {
        onSuccess: ({ data }) => {
          message.success(data.message || 'Tên hoạt động đã được cập nhật');
        },
        onError: error => {
          message.error(error.message || 'Không thể cập nhật tên hoạt động');
        },
      },
    );
    setIsEditing(false);
  };

  const cardClassName = `
    activity-card 
    ${isDragging ? 'dragging' : ''} 
    ${isDragOverlay ? 'drag-overlay' : ''}
    ${activityMeta.isOverdue ? 'overdue' : ''}
    ${activityMeta.isNearDeadline ? 'near-deadline' : ''}
  `.trim();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={e => {
        e.stopPropagation();
        onClick(activity);
      }}
      size="small"
      className={cardClassName}
      hoverable={!isDragging}
      bordered={false}
      styles={{
        body: {
          // borderLeft: activity.priority ? `3px solid ${priorityConfig.color}` : undefined,
          padding: '12px',
          position: 'relative',
          background: 'white',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
        },
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        {isEditing ? (
          <Input
            size="small"
            value={editedName}
            autoFocus
            onChange={(e: any) => setEditedName(e.target.value)}
            onPressEnter={handleNameSave}
            onBlur={handleNameSave}
            style={{ fontSize: 14, flex: 1, marginRight: 8 }}
            onKeyDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.4,
              flex: 1,
              paddingRight: 8,
            }}
            ellipsis={{ rows: 2, tooltip: activity.name }}
          >
            {activity.name}
          </Title>
        )}

        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key, domEvent }) => handleMenuClick(key, domEvent),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div
            style={{
              padding: '4px',
              borderRadius: 4,
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
            onClick={e => e.stopPropagation()}
          >
            <MoreOutlined />
          </div>
        </Dropdown>
      </div>

      {/* Description */}
      {activity.description && (
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: 'block',
            marginBottom: 8,
            lineHeight: 1.4,
          }}
          ellipsis={{
            tooltip: activity.description.length > 80 ? activity.description : false,
          }}
        >
          {activity.description.length >= 30
            ? `${activity.description.slice(0, 30)}...`
            : activity.description}
        </Text>
      )}

      {/* Progress bar */}
      {activityMeta.progress > 0 && (
        <Progress
          percent={activityMeta.progress}
          size="small"
          showInfo={false}
          strokeColor={statusConfig.color}
          style={{ marginBottom: 8 }}
        />
      )}

      {/* Tags and Status */}
      <Space size={4} wrap style={{ marginBottom: 8 }}>
        {activity.priority && (
          <Tag color={priorityConfig.color} icon={priorityConfig.icon}>
            {priorityConfig.text}
          </Tag>
        )}

        {/* {activity.status && <Tag color={statusConfig.color}>{statusConfig.text}</Tag>} */}

        {activityMeta.isOverdue && (
          <Tag color="error" icon={<ExclamationCircleOutlined />}>
            Quá hạn
          </Tag>
        )}
      </Space>

      {/* Metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={8}>
          {/* Due date */}
          {activityMeta.endTime && (
            <Tooltip
              title={`Hạn: ${activityMeta.endTime.format('DD/MM/YYYY HH:mm')}`}
              placement="bottom"
            >
              <Space size={4}>
                <CalendarOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    color: activityMeta.isOverdue
                      ? '#f5222d'
                      : activityMeta.isNearDeadline
                      ? '#fa8c16'
                      : '#8c8c8c',
                  }}
                >
                  {activityMeta.endTime.fromNow()}
                </Text>
              </Space>
            </Tooltip>
          )}

          {/* Estimate time */}
          {activity.estimateTime && (
            <Tooltip title="Thời gian ước tính" placement="bottom">
              <Space size={4}>
                <ClockCircleOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {activity.estimateTime}h
                </Text>
              </Space>
            </Tooltip>
          )}
        </Space>

        {/* Assignees */}
        {activityMeta.assignees && (
          <Avatar.Group
            max={{
              style: {
                color: '#f56a00',
                backgroundColor: '#fde3cf',
                fontSize: 10,
                width: 20,
                height: 20,
                lineHeight: '20px',
              },
              count: 2,
            }}
          >
            {activityMeta.assignees.map((assignee, index) => (
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
            ))}
          </Avatar.Group>
        )}
      </div>

      {/* Overlay indicator for drag */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            border: '2px dashed #1890ff',
            borderRadius: 6,
            pointerEvents: 'none',
          }}
        />
      )}
    </Card>
  );
};
