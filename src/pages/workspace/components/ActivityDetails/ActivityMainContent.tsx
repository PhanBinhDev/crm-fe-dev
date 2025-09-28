import { ActivityType } from '@/common/enum/activity';
import { ActivityPriorityLevel, IActivity, IStage } from '@/common/types';
import { IAssignee } from '@/common/types/assignee';
import AssigneeContent from '@/components/shared/AssigneeContent';
import EstimateContent from '@/components/shared/EstimateContent';
import PriorityContent from '@/components/shared/PriorityContent';
import StatusContent from '@/components/shared/StatusContent';
import { getPriorityLabel, mapToActivityPriorityFilter } from '@/constants';
import { getActivityPriorityColor } from '@/utils/activity';
import { formatMinutesToText } from '@/utils/formatter';
import { getNextStage } from '@/utils/stage';
import { parseTimeEstimate } from '@/utils/times';
import { HttpError, PrevContext, UpdateResponse } from '@refinedev/core';
import {
  IconCalendar,
  IconCaretRightFilled,
  IconCheck,
  IconFlag,
  IconFlagFilled,
  IconHourglassEmpty,
  IconPlaystationCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Avatar, Button, Popover, Space, Tooltip } from 'antd';
import { MutateFunction } from 'node_modules/@refinedev/core/dist/definitions/types';
import { UpdateParams } from 'node_modules/@refinedev/core/dist/hooks/data/useUpdate';
import { useCallback } from 'react';
import ActivityContentItem from './ActivityContentItem';

interface ActivityMainContentProps {
  isContentNarrow: boolean;
  itemData: IActivity;
  stages: IStage[];
  onUpdate: MutateFunction<
    UpdateResponse<IActivity>,
    HttpError,
    UpdateParams<IActivity, HttpError, {}>,
    PrevContext<IActivity>
  >;
  setFormData: React.Dispatch<React.SetStateAction<Partial<IActivity>>>;
}

const ActivityMainContent = ({
  isContentNarrow,
  itemData,
  stages,
  onUpdate,
  setFormData,
}: ActivityMainContentProps) => {
  const onStageChange = useCallback(
    (stage: IStage) => {
      setFormData(prev => ({
        ...prev,
        stage,
      }));
      onUpdate({
        values: {
          stage,
          stageId: stage.id,
        },
      });
    },
    [setFormData, onUpdate, stages],
  );

  const onAssigneesChange = useCallback(
    (assignees: IAssignee[]) => {
      const payload = new Set(
        assignees.map(assignee => ({
          userId: assignee.user.id,
          user: assignee.user,
        })),
      );

      setFormData(prev => ({
        ...prev,
        assignees,
      }));

      onUpdate({
        values: {
          assignees: Array.from(payload),
        },
      });
    },
    [setFormData, onUpdate],
  );

  const onPriorityChange = useCallback(
    (priority: ActivityPriorityLevel | null) => {
      setFormData(prev => ({
        ...prev,
        priority: priority?.value,
      }));
      onUpdate({
        values: {
          priority: priority?.value || null,
        },
      });
    },
    [setFormData, onUpdate],
  );

  const onEstimateChange = useCallback(
    (estimateTime: string) => {
      const { minutes } = parseTimeEstimate(estimateTime) || {};

      setFormData(prev => ({
        ...prev,
        estimateTime: minutes,
      }));
      onUpdate({
        values: { estimateTime: minutes },
      });
    },
    [setFormData, onUpdate],
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isContentNarrow ? '1fr' : 'repeat(2, 1fr)',
        gridTemplateRows: isContentNarrow ? 'repeat(6, auto)' : 'repeat(3, auto)',
        gap: 16,
        width: '100%',
      }}
    >
      {/* Stage */}
      <ActivityContentItem
        startContent={
          <>
            <IconPlaystationCircle size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Trạng thái
            </span>
          </>
        }
        endContent={
          <Popover
            placement="bottomLeft"
            content={
              <StatusContent
                stages={stages}
                currentStage={itemData.stage}
                onChangeStage={onStageChange}
              />
            }
            arrow={false}
            trigger={['click']}
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            <Space
              style={{
                gap: 4,
                flex: 1,
                height: '100%',
                padding: '0 6px',
              }}
              styles={{
                item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            >
              <Space
                style={{
                  gap: 0,
                }}
                styles={{
                  item: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
              >
                <Button
                  type="text"
                  size="small"
                  style={{
                    padding: '0 6px',
                    background: itemData?.stage?.color || '#f0f0f0',
                    color: '#fff',
                    borderRadius: 7,
                    transition: 'all 0.3s',
                    ...(!itemData?.stage?.isCompleted
                      ? {
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }
                      : {
                          borderTopRightRadius: 7,
                          borderBottomRightRadius: 7,
                        }),
                    fontSize: 14,
                  }}
                >
                  {itemData?.stage?.title.toLocaleUpperCase()}
                </Button>
                {!itemData?.stage?.isCompleted && (
                  <Tooltip
                    title={`Giai đoạn tiếp theo: ${getNextStage(itemData.stage, stages)?.title}`}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<IconCaretRightFilled size={14} />}
                      style={{
                        background: itemData?.stage?.color || '#f0f0f0',
                        color: '#fff',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderTopRightRadius: 7,
                        borderBottomRightRadius: 7,
                        borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        const nextStage = getNextStage(itemData.stage, stages);
                        if (nextStage) {
                          onUpdate(
                            {
                              values: {
                                stage: nextStage,
                                stageId: nextStage.id,
                              },
                            },
                            {
                              onSuccess: () => {
                                setFormData(prev => ({
                                  ...prev,
                                  stage: nextStage,
                                  stageId: nextStage.id,
                                }));
                              },
                            },
                          );
                        }
                      }}
                      styles={{
                        icon: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      }}
                    />
                  </Tooltip>
                )}
              </Space>
              {!itemData?.stage?.isCompleted && (
                <Tooltip title="Đánh dấu hoàn thành">
                  <Button
                    size="small"
                    type="primary"
                    style={{
                      background: '#0000000f',
                      borderRadius: 7,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#00000026';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#0000000f';
                    }}
                    styles={{
                      icon: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                    icon={<IconCheck size={14} color="#646464" />}
                    onClick={e => {
                      e.stopPropagation();
                      if (itemData.stage?.isCompleted) return;
                      const completedId = stages.find(stage => stage.isCompleted)?.id;
                      if (completedId) {
                        onUpdate(
                          {
                            values: {
                              stage: stages.find(stage => stage.id === completedId),
                              stageId: completedId,
                            },
                          },
                          {
                            onSuccess: () => {
                              setFormData(prev => ({
                                ...prev,
                                stage: stages.find(stage => stage.id === completedId),
                                stageId: completedId,
                              }));
                            },
                          },
                        );
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Space>
          </Popover>
        }
      />

      {/* Assignees */}
      <ActivityContentItem
        startContent={
          <>
            <IconUsers size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Phụ trách
            </span>
          </>
        }
        endContent={
          <Popover
            placement="bottomLeft"
            content={
              <AssigneeContent
                currentAssignees={itemData.assignees || []}
                onChangeAssignees={onAssigneesChange}
              />
            }
            arrow={false}
            trigger={['click']}
            styles={{
              body: { padding: 0 },
            }}
          >
            <Space
              style={{ flex: 1, height: '100%', justifyContent: 'space-between' }}
              styles={{
                item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            >
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  borderRadius: 7,
                  fontSize: 14,
                  gap: 2,
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {!itemData.assignees?.length ? (
                  'Trống'
                ) : (
                  <>
                    {itemData.assignees.slice(0, 3).map((assignee, index) => (
                      <Avatar
                        key={`assignee-${index}-${assignee?.user?.id}`}
                        size={'small'}
                        src={assignee?.user?.avatar}
                        style={{ backgroundColor: '#7b69ee', color: '#fff' }}
                        onClick={e => e?.stopPropagation()}
                      >
                        {assignee?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    ))}
                    {itemData.assignees.length > 3 && (
                      <Avatar size="small" style={{ backgroundColor: '#d9d9d9', color: '#333' }}>
                        +{itemData.assignees.length - 3}
                      </Avatar>
                    )}
                  </>
                )}
              </Button>
              {(itemData.assignees?.length ?? 0) > 0 && (
                <Button
                  type="text"
                  size="small"
                  style={{
                    borderRadius: 6,
                    padding: '0 6px',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onAssigneesChange([]);
                  }}
                >
                  <IconX size={15} color={'#838383'} />
                </Button>
              )}
            </Space>
          </Popover>
        }
      />

      {/* Due Date */}
      <ActivityContentItem
        startContent={
          <>
            <IconCalendar size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Hạn
            </span>
          </>
        }
        endContent={
          <>
            <Popover>
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {!itemData.endTime
                  ? 'Trống'
                  : new Date(itemData.endTime).toLocaleDateString('vi-VN')}
              </Button>
            </Popover>

            {Boolean(itemData.endTime) && (
              <Button
                type="text"
                size="small"
                style={{
                  borderRadius: 6,
                  padding: '0 6px',
                }}
              >
                <IconX size={15} color={'#838383'} />
              </Button>
            )}
          </>
        }
      />

      {/* Priority */}
      <ActivityContentItem
        startContent={
          <>
            <IconFlag size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Ưu tiên
            </span>
          </>
        }
        endContent={
          <Popover
            placement="bottomLeft"
            content={
              <PriorityContent
                priority={mapToActivityPriorityFilter(itemData.priority)}
                onChangePriority={onPriorityChange}
              />
            }
            arrow={false}
            trigger={['click']}
            styles={{
              body: { padding: '8px 0', width: 185 },
            }}
          >
            <Space
              style={{ flex: 1, height: '100%', justifyContent: 'space-between' }}
              styles={{
                item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            >
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                icon={
                  !itemData.priority ? null : (
                    <IconFlagFilled size={14} color={getActivityPriorityColor(itemData.priority)} />
                  )
                }
              >
                {!itemData.priority ? 'Trống' : getPriorityLabel(itemData.priority)}
              </Button>

              {itemData.priority && (
                <Button
                  type="text"
                  size="small"
                  style={{
                    borderRadius: 6,
                    padding: '0 6px',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onPriorityChange(null);
                  }}
                >
                  <IconX size={15} color={'#838383'} />
                </Button>
              )}
            </Space>
          </Popover>
        }
      />

      {/* Estimate Time */}
      <ActivityContentItem
        startContent={
          <>
            <IconHourglassEmpty size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Ước lượng
            </span>
          </>
        }
        endContent={
          <Popover
            placement="bottomLeft"
            content={
              <EstimateContent
                estimateTime={itemData.estimateTime}
                onEstimateChange={onEstimateChange}
              />
            }
            arrow={false}
            trigger={['click']}
            styles={{
              body: { padding: '8px 0', width: 280 },
            }}
          >
            <Space
              style={{ flex: 1, height: '100%', justifyContent: 'space-between' }}
              styles={{
                item: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
            >
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {!itemData.estimateTime ? 'Trống' : formatMinutesToText(itemData.estimateTime || 0)}
              </Button>

              {Boolean(itemData.estimateTime) && (
                <Button
                  type="text"
                  size="small"
                  style={{
                    borderRadius: 6,
                    padding: '0 6px',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onEstimateChange('0');
                  }}
                >
                  <IconX size={15} color={'#838383'} />
                </Button>
              )}
            </Space>
          </Popover>
        }
      />

      {itemData.type === ActivityType.EVENT && (
        <ActivityContentItem
          startContent={
            <>
              <IconHourglassEmpty size={14} />
              <span
                style={{
                  userSelect: 'none',
                }}
              >
                Vị trí
              </span>
            </>
          }
          endContent={
            <Popover
              placement="bottomLeft"
              content={
                <EstimateContent
                  estimateTime={itemData.estimateTime}
                  onEstimateChange={onEstimateChange}
                />
              }
              arrow={false}
              trigger={['click']}
              styles={{
                body: { padding: '8px 0', width: 280 },
              }}
            >
              <Space
                style={{ flex: 1, height: '100%', justifyContent: 'space-between' }}
                styles={{
                  item: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
              >
                <Button
                  type="text"
                  size="small"
                  style={{
                    padding: '6px',
                    color: '#8c8c8c',
                    background: 'transparent',
                    borderRadius: 7,
                    fontSize: 14,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {!itemData.estimateTime
                    ? 'Trống'
                    : formatMinutesToText(itemData.estimateTime || 0)}
                </Button>

                {Boolean(itemData.estimateTime) && (
                  <Button
                    type="text"
                    size="small"
                    style={{
                      borderRadius: 6,
                      padding: '0 6px',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onEstimateChange('0');
                    }}
                  >
                    <IconX size={15} color={'#838383'} />
                  </Button>
                )}
              </Space>
            </Popover>
          }
        />
      )}
    </div>
  );
};

export default ActivityMainContent;
