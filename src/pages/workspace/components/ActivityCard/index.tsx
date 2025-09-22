import { IActivity, IStage } from '@/common/types';
import { DragDropType, getPriorityLabel } from '@/constants';
import { useDisplayConfig } from '@/contexts/DisplayConfig';
import { useModal } from '@/hooks/useModal';
import { getActivityPriorityColor } from '@/utils';
import { CalendarOutlined, HourglassOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconChevronDown, IconChevronRight, IconLabelFilled, IconShare } from '@tabler/icons-react';
import { Avatar, Card, Progress, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import ToolbarActivityCard from './Toolbar';

const { Text } = Typography;

interface ActivityCardProps {
  activity: IActivity;
  isPortal?: boolean;
  isCompletedStage?: boolean;
  stages?: IStage[];
}

const ActivityCard = ({ activity, isPortal, isCompletedStage, stages }: ActivityCardProps) => {
  const { config } = useDisplayConfig();
  const { openModal } = useModal();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

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
      border: isHovered ? '1px solid #cecece' : '1px solid #e0dfdfff',
      boxShadow: isOver ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
      position: 'relative',
    };
  }, [transform, transition, isDragging, isHovered, isOver]);

  const showActions = useMemo(
    () => isHovered && !isDragging && !isOver && !isPortal,
    [isHovered, isDragging, isOver, isPortal],
  );

  return (
    <>
      <Card
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
            <Tooltip title={getPriorityLabel(activity.priority)} placement="left">
              <div
                style={{
                  position: 'absolute',
                  top: -18,
                  left: -16,
                  transform: 'rotate(90deg)',
                  transformOrigin: 'center',
                }}
              >
                <IconLabelFilled color={getActivityPriorityColor(activity.priority)} size={20} />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
        </div>

        {/* Tiêu đề */}
        <div style={{ width: '100%', position: 'relative', marginBottom: 6 }}>
          <Text
            onClick={() =>
              openModal('ModalEditActivity', {
                activity,
                stage: stages?.find(s => s.id === activity.stageId),
              })
            }
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

        {/* Assignees */}
        {config.showAssignee && activity.assignees ? (
          activity.assignees.length > 0 ? (
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {activity.assignees.map(assignee => (
                <Tooltip title={assignee.user?.name || ''} key={assignee.id}>
                  <Avatar icon={<UserOutlined />} />
                </Tooltip>
              ))}
            </div>
          ) : (
            <Tooltip title="Chưa có người được giao" placement="right">
              <Avatar size={20} icon={<UserOutlined />} style={{ marginBottom: 6 }} />
            </Tooltip>
          )
        ) : (
          ''
        )}

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
            <Tooltip title="Thời gian bắt đầu - kết thúc" placement="left">
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
            </Tooltip>
          ) : (
            ''
          )}

          {config.showEstimate && activity.estimateTime ? (
            <Tooltip title="Thời gian ước tính" placement="left">
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
            </Tooltip>
          ) : (
            ''
          )}
        </div>

        {/* Mô tả */}
        {config.showDescription && activity.description ? (
          <Tooltip title="Mô tả" placement="left">
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
          </Tooltip>
        ) : (
          ''
        )}

        {/* Progress */}
        {config.showProgress && <Progress percent={activity.progress || 0} size="small" />}

        {/* Subtask */}
        {config.showSubtask && activity.subActivities && activity.subActivities.length > 0 ? (
          <>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
                padding: '2px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
              onClick={toggleOpen}
            >
              <div
                style={{
                  fontSize: 12,

                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <IconShare size={13} />
                <p style={{ fontSize: 13 }}>{activity.subActivities.length} Nhiệm vụ con</p>
              </div>
              <div>{isOpen ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}</div>
            </div>
          </>
        ) : (
          ''
        )}

        {showActions && (
          <ToolbarActivityCard
            activity={activity}
            isCompletedStage={!!isCompletedStage}
            stages={[]}
          />
        )}
      </Card>
      {config.showSubtask &&
        activity.subActivities &&
        activity.subActivities.length > 0 &&
        isOpen && (
          <div
            style={{
              border: isHovered ? '1px solid #cecece' : '1px solid #e0dfdfff',
              borderRadius: 5,
              margin: '-5px 0 8px 15px',
              padding: '5px 10px',
              background: '#fff',
            }}
          >
            {activity.subActivities.map((sub, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, opacity: 0.8 }}> {activity.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{sub.name}</div>
              </div>
            ))}
          </div>
        )}
    </>
  );
};

export default ActivityCard;
