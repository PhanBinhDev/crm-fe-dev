import { IActivity, IStage } from '@/common/types';
import { DragDropType, getActivityLabel, getPriorityColor, getPriorityLabel } from '@/constants';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useDisplayConfig } from '@/contexts/DisplayConfig';
import { useModal } from '@/hooks/useModal';
import { getColorFromName, getInitials } from '@/utils/activity';
import { formatMinutesToText } from '@/utils/formatter';
import { CalendarOutlined, HourglassOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useOne } from '@refinedev/core';
import {
  IconAlertTriangle,
  IconCaretDownFilled,
  IconCategory,
  IconFlagFilled,
  IconShare,
} from '@tabler/icons-react';
import { Avatar, Button, Card, Progress, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import ToolbarActivityCard from './Toolbar';

const { Text } = Typography;

interface ActivityCardProps {
  activity: IActivity;
  isPortal?: boolean;
  isCompletedStage?: boolean;
  isClosedStage?: boolean;
  stages?: IStage[];
}

const ActivityCard = ({
  activity,
  isPortal,
  isCompletedStage,
  isClosedStage,
  stages,
}: ActivityCardProps) => {
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

  const { data: progressData } = useOne({
    resource: `activities/${activity.id}/progress`,
    id: '',
    queryOptions: {
      enabled: !!activity.id,
      retry: false,
      queryKey: ['activity-progress', activity.id],
    },
  });

  return (
    <>
      <Card
        style={{ ...styles }}
        styles={{ body: { padding: '10px 8px 8px' } }}
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
        onClick={() => {
          openModal('ModalEditActivity', {
            activity,
            stage: stages?.find(s => s.id === activity.stageId),
          });
        }}
      >
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
              padding: '0 2px',
            }}
          >
            {activity.name}
          </Text>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 5,
          }}
        >
          {config.showType && activity.type ? (
            <Tooltip title="Loại công việc" placement="left">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  border: '1px solid #e0dfdfff',
                  padding: '1px 4px',
                  borderRadius: 4,
                  width: 'fit-content',
                }}
              >
                <IconCategory size={14} />
                <p>{getActivityLabel(activity.type)}</p>
              </div>
            </Tooltip>
          ) : (
            ''
          )}

          {config.showPriority && activity.priority ? (
            <Tooltip title={`Ưu tiên: ${getPriorityLabel(activity.priority)}`} placement="right">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  border: `1px solid ${getPriorityColor(activity.priority)}`,
                  padding: '1px 4px',
                  borderRadius: 4,
                  width: 'fit-content',
                }}
              >
                <IconFlagFilled size={14} color={getPriorityColor(activity.priority)} />
                <p>{getPriorityLabel(activity.priority)}</p>
              </div>
            </Tooltip>
          ) : (
            ''
          )}
        </div>

        {/* Assignees */}
        {config.showAssignee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            {activity.assignees && activity.assignees.length > 0 ? (
              <>
                {activity.assignees.slice(0, 3).map((assignee, index) => {
                  const userName = assignee.user?.name || AVATAR_PLACEHOLDER;
                  const initials = getInitials(userName);
                  const avatarColor = getColorFromName(userName);

                  return (
                    <Tooltip key={index} title={assignee.user?.name} placement="top">
                      <Avatar
                        size="small"
                        src={assignee.user?.avatar}
                        style={{
                          backgroundColor: avatarColor,
                          color: '#fff',
                          fontWeight: 'bold',
                          marginLeft: index > 0 ? -8 : 0,
                          border: 'none',
                        }}
                      >
                        {initials}
                      </Avatar>
                    </Tooltip>
                  );
                })}
                {activity.assignees.length > 3 && (
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor: '#f5f5f5',
                      color: '#999',
                      marginLeft: -8,
                    }}
                  >
                    +{activity.assignees.length - 3}
                  </Avatar>
                )}
              </>
            ) : (
              <Tooltip title="Chưa có người thực hiện" placement="top">
                <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
                  <UserOutlined />
                </Avatar>
              </Tooltip>
            )}
          </div>
        )}

        {/* info */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            marginBottom: 5,
          }}
        >
          {config.showEndTime && activity.endTime ? (
            <Tooltip
              title={activity.startTime && activity.endTime ? 'Thời gian bắt đầu - kết thúc' : ''}
              placement="left"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 5,
                  fontSize: 12,
                }}
              >
                {dayjs(activity.endTime).isBefore(dayjs()) &&
                activity.stage.stageGroup !== 'done' ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      border: `1px solid red`,
                      padding: '1px 4px',
                      borderRadius: 4,
                      width: 'fit-content',
                      background: 'red',
                    }}
                  >
                    <IconAlertTriangle size={14} color={'white'} />
                    <p style={{ color: 'white', fontWeight: 600 }}>Trễ hạn</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarOutlined size={13} />
                    <div>
                      <Tooltip
                        title={activity.startTime ? 'Thời gian bắt đầu' : ''}
                        placement="left"
                      >
                        {activity.startTime ? dayjs(activity.startTime).format('DD/MM/YY') : ''}
                      </Tooltip>

                      <Tooltip
                        title={activity.endTime ? 'Thời gian kết thúc' : ''}
                        placement="right"
                      >
                        {dayjs(activity.endTime).format('DD/MM/YY')}
                      </Tooltip>
                    </div>
                  </div>
                )}
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
                  <span>{formatMinutesToText(activity.estimateTime)}</span>
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
                marginBottom: 5,
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
        {config.showProgress && (
          <div style={{ width: '100%', marginBottom: 5 }}>
            <Tooltip title="Tiến độ" placement="left">
              <Progress
                percent={progressData?.data?.progress || 0}
                size="small"
                style={{ margin: 0 }}
              />
            </Tooltip>
          </div>
        )}

        {/* Subtask */}
        {config.showSubtask && activity.subActivities && activity.subActivities.length > 0 && (
          <Button
            type="text"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderRadius: 6,
              padding: '0 8px',
              cursor: 'pointer',
              background: isHovered ? '#f5f5f5' : 'transparent',
              fontSize: 13,
              color: '#595959',
            }}
            onClick={e => {
              e.stopPropagation();
              toggleOpen();
            }}
            icon={
              isOpen ? (
                <IconCaretDownFilled size={14} color="#838383" />
              ) : isHovered ? (
                <IconCaretDownFilled
                  size={14}
                  color="#838383"
                  style={{
                    transform: 'rotate(-90deg)',
                  }}
                />
              ) : (
                <IconShare size={14} color="#8c8c8c" />
              )
            }
          >
            {activity.subActivities.length} Nhiệm vụ con
          </Button>
        )}

        {showActions && !isClosedStage && !isCompletedStage && (
          <ToolbarActivityCard
            activity={activity}
            isCompletedStage={!!isCompletedStage}
            stages={stages || []}
          />
        )}
      </Card>
      {config.showSubtask &&
        activity.subActivities &&
        activity.subActivities.length > 0 &&
        isOpen && (
          <>
            {activity.subActivities.map((sub: IActivity, i: number) => (
              <div
                onClick={e => {
                  e.stopPropagation();
                  openModal('ModalEditActivity', {
                    activity: sub,
                    parentActivity: activity,
                    isSubtask: true,
                    stage: stages?.find(s => s.id === activity.stageId),
                  });
                }}
                key={i}
                style={{
                  border: isHovered ? '1px solid #cecece' : '1px solid #e0dfdfff',
                  borderRadius: 5,
                  margin: '-5px 0 8px 15px',
                  padding: '5px 10px',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.8 }}> {activity.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{sub.name}</div>
              </div>
            ))}
          </>
        )}
    </>
  );
};

export default ActivityCard;
