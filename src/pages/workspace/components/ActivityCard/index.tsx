import { IActivity } from '@/common/types';
import { DragDropType } from '@/constants';
import { useDisplayConfig } from '@/contexts/DisplayConfig';
import { useModal } from '@/hooks/useModal';
import { getActivityPriorityColor } from '@/utils';
import { CalendarOutlined, HourglassOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconLabelFilled } from '@tabler/icons-react';
import { Avatar, Card, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import ToolbarActivityCard from './Toolbar';

const { Text } = Typography;

interface ActivityCardProps {
  activity: IActivity;
  isPortal?: boolean;
  isCompletedStage?: boolean;
}

const ActivityCard = ({ activity, isPortal, isCompletedStage }: ActivityCardProps) => {
  const { config } = useDisplayConfig();
  const { openModal } = useModal();
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: activity.id,
      data: {
        type: DragDropType.KANBAN_CARD,
        activity,
      },
    });

  const styles: React.CSSProperties = useMemo(() => {
    const baseStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginBottom: '8px',
      cursor: 'pointer',
      borderRadius: 8,
    };

    if (isDragging) {
      return {
        ...baseStyle,
        opacity: 0.5,
        border: '1px solid #1677ff',
        boxShadow: '0 4px 12px rgba(22, 119, 255, 0.15)',
      };
    }

    return {
      ...baseStyle,
      opacity: 1,
      border: isHovered ? '1px solid #cecece' : '1px solid #f0f0f0',
      boxShadow: isOver ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
      position: 'relative',
    };
  }, [transform, transition, isDragging, isHovered, isOver]);

  const showActions = useMemo(
    () => isHovered && !isDragging && !isOver && !isPortal,
    [isHovered, isDragging, isOver, isPortal],
  );

  return (
    <Card
      onClick={() => openModal('ModalEditActivity', { activity })}
      style={{ ...styles }}
      styles={{ body: { padding: '10px 12px' } }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={e => {
        setIsHovered(true);
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
        }
      }}
      onMouseLeave={e => {
        setIsHovered(false);
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
        }
      }}
    >
      <div style={{ width: '100%', position: 'relative', marginBottom: 3 }}>
        {config.showPriority && activity.priority ? (
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: -15,
              // transform: 'rotate(90deg)',
              // transformOrigin: 'center',
            }}
          >
            <IconLabelFilled color={getActivityPriorityColor(activity.priority)} size={20} />
          </div>
        ) : (
          ''
        )}
      </div>

      {/* Tiêu đề */}
      <div style={{ width: '100%', position: 'relative', marginBottom: 6 }}>
        <Text
          strong
          style={{
            fontSize: 14,
            width: '100%',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            lineHeight: '1.4em',
            maxHeight: '2.8em',
          }}
        >
          {activity.name}
        </Text>
      </div>

      {/* info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          marginBottom: 6,
          // justifyContent: 'space-between',
        }}
      >
        {config.showEndTime && activity.endTime ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 5,
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarOutlined size={13} />
              <div>
                <span>{dayjs(activity.endTime).format('DD/MM/YY')}</span>
                {' - '}
                <span>{dayjs(activity.endTime).format('DD/MM/YY')}</span>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        {config.showEstimate && activity.estimateTime ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 3,
              fontSize: 12,
            }}
          >
            <HourglassOutlined size={13} />
            <div>
              <span>{activity.estimateTime}</span>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>

      {/* Mô tả */}
      {config.showDescription && activity.description ? (
        <Typography.Paragraph
          type="secondary"
          style={{
            fontSize: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 8,
            whiteSpace: 'normal',
            lineHeight: '1.4em',
            maxHeight: '2.8em',
          }}
        >
          {activity.description}
        </Typography.Paragraph>
      ) : (
        ''
      )}

      {/* Assignees */}
      {config.showAssignee && activity.assignees && activity.assignees.length > 0 ? (
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {activity.assignees.map(assignee => (
            <Tooltip title={assignee.user?.name || ''} key={assignee.id}>
              <Avatar size={24} icon={<UserOutlined />} />
            </Tooltip>
          ))}
        </div>
      ) : (
        ''
      )}

      {/* Progress */}
      {/* {config.showProgress && (
        <Progress percent={activity.progress || 0} size="small" style={{ marginBottom: 8 }} />
      )} */}

      {showActions && (
        <ToolbarActivityCard activity={activity} isCompletedStage={!!isCompletedStage} />
      )}
    </Card>
  );
};

export default ActivityCard;
