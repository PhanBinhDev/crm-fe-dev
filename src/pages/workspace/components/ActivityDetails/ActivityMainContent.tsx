import { ActivityType } from '@/common/enum/activity';
import { ActivityPriorityLevel, IActivity, ICategory, IStage } from '@/common/types';
import { IAssignee } from '@/common/types/assignee';
import ActivityCategoryContent from '@/components/shared/ActivityCategoryContent';
import AssigneeContent from '@/components/shared/AssigneeContent';
import EstimateContent from '@/components/shared/EstimateContent';
import LocationContent from '@/components/shared/LocationContent';
import PriorityContent from '@/components/shared/PriorityContent';
import StatusContent from '@/components/shared/StatusContent';
import UserCountContent from '@/components/shared/UserCountContent';
import { getPriorityLabel, mapToActivityPriorityFilter } from '@/constants';
import { getActivityPriorityColor } from '@/utils/activity';
import { formatMinutesToText } from '@/utils/formatter';
import { getNextStage } from '@/utils/stage';
import { parseTimeEstimate } from '@/utils/times';
import { useList } from '@refinedev/core';
import {
  IconCalendar,
  IconCaretRightFilled,
  IconChalkboardTeacher,
  IconCheck,
  IconFlag,
  IconFlagFilled,
  IconHourglassEmpty,
  IconLocation,
  IconPlaystationCircle,
  IconProgress,
  IconSchool,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Avatar, Button, DatePicker, Popover, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { memo, useCallback, useMemo } from 'react';
import ActivityContentItem from './ActivityContentItem';

interface ActivityMainContentProps {
  isContentNarrow: boolean;
  itemData: IActivity;
  onUpdate: any;
  setFormData: React.Dispatch<React.SetStateAction<Partial<IActivity>>>;
}

const ActivityMainContent = ({
  isContentNarrow,
  itemData,
  onUpdate,
  setFormData,
}: ActivityMainContentProps) => {
  const { data: stagesData, isLoading: isLoadingStages } = useList<IStage>({
    resource: 'stages',
    filters: [
      {
        field: 'workspaceId',
        operator: 'eq',
        value: itemData?.workspaceId,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: { enabled: !!itemData?.workspaceId },
  });

  const stages = useMemo(() => {
    if (!stagesData?.data || isLoadingStages) return [] as IStage[];

    return stagesData.data;
  }, [stagesData, isLoadingStages]);

  const onStageChange = useCallback(
    (stage: IStage) => {
      const updates = {
        stage,
        stageId: stage.id,
      };

      setFormData(updates);
      onUpdate({
        values: updates,
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

      setFormData({
        assignees,
      });

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
      const update = {
        priority: priority?.value || null,
      };

      setFormData(update);
      onUpdate({
        values: update,
      });
    },
    [setFormData, onUpdate],
  );

  const onEstimateChange = useCallback(
    (estimate: string) => {
      const { minutes: estimateTime } = parseTimeEstimate(estimate) || {};

      const update = {
        estimateTime,
      };

      setFormData(update);
      onUpdate({
        values: update,
      });
    },
    [setFormData, onUpdate],
  );

  const onLocationChange = useCallback(
    (location: string | undefined) => {
      const updates = {
        location,
      };

      setFormData(updates);
      onUpdate({
        values: updates,
      });
    },
    [setFormData, onUpdate],
  );

  const onCategoryChange = useCallback(
    (category: ICategory | undefined) => {
      const updates = {
        category,
        categoryId: category ? category.id : undefined,
      };

      setFormData(updates);
      onUpdate({
        values: updates,
      });
    },
    [setFormData, onUpdate],
  );

  const onInstructorCountChange = useCallback(
    (count: number | undefined) => {
      const updates = {
        instructorCount: count,
      };

      setFormData(updates);
      onUpdate({
        values: updates,
      });
    },
    [setFormData, onUpdate],
  );

  const onStudentCountChange = useCallback(
    (count: number | undefined) => {
      const updates = {
        studentCount: count,
      };

      setFormData(updates);
      onUpdate({
        values: updates,
      });
    },
    [setFormData, onUpdate],
  );

  const onDueDateChange = useCallback(
    (date: dayjs.Dayjs | null) => {
      const value = date ? date.toDate() : undefined;
      const update = {
        endTime: value,
      };

      setFormData(update);
      onUpdate({
        values: update,
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
          <Popover
            placement="bottomLeft"
            content={
              <DatePicker
                value={itemData.endTime ? dayjs(itemData.endTime) : null}
                onChange={onDueDateChange}
                format="DD/MM/YYYY"
                allowClear
                style={{ width: 200 }}
                variant="borderless"
              />
            }
            arrow={false}
            trigger={['click']}
          >
            <Space style={{ flex: 1, height: '100%', justifyContent: 'space-between' }}>
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

              {Boolean(itemData.endTime) && (
                <Button
                  type="text"
                  size="small"
                  style={{
                    borderRadius: 6,
                    padding: '0 6px',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onDueDateChange(null);
                  }}
                >
                  <IconX size={15} color={'#838383'} />
                </Button>
              )}
            </Space>
          </Popover>
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
        <>
          <ActivityContentItem
            startContent={
              <>
                <IconLocation size={14} />
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
                  <LocationContent
                    location={itemData.location}
                    onLocationChange={onLocationChange}
                  />
                }
                arrow={false}
                trigger={['click']}
                styles={{
                  body: { padding: '8px 0', width: 220 },
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
                  <Tooltip
                    title={
                      itemData?.location && itemData.location.length > 20 ? itemData.location : ''
                    }
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
                      {!itemData.location
                        ? 'Trống'
                        : itemData.location.length > 20
                          ? `${itemData.location.slice(0, 20)}...`
                          : itemData.location}
                    </Button>
                  </Tooltip>

                  {Boolean(itemData.location) && (
                    <Button
                      type="text"
                      size="small"
                      style={{
                        borderRadius: 6,
                        padding: '0 6px',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onLocationChange(undefined);
                      }}
                    >
                      <IconX size={15} color={'#838383'} />
                    </Button>
                  )}
                </Space>
              </Popover>
            }
          />

          <ActivityContentItem
            startContent={
              <>
                <IconProgress size={14} />
                <span
                  style={{
                    userSelect: 'none',
                  }}
                >
                  Loại hoạt động
                </span>
              </>
            }
            endContent={
              <Popover
                placement="bottomLeft"
                content={
                  <ActivityCategoryContent
                    category={itemData.category}
                    onCategoryChange={onCategoryChange}
                  />
                }
                arrow={false}
                trigger={['click']}
                styles={{
                  body: { padding: '8px 0', width: 220 },
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
                    {!itemData.category ? 'Trống' : itemData.category.name}
                  </Button>

                  {Boolean(itemData.category) && (
                    <Button
                      type="text"
                      size="small"
                      style={{
                        borderRadius: 6,
                        padding: '0 6px',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onCategoryChange(undefined);
                      }}
                    >
                      <IconX size={15} color={'#838383'} />
                    </Button>
                  )}
                </Space>
              </Popover>
            }
          />

          <ActivityContentItem
            startContent={
              <>
                <IconChalkboardTeacher size={14} />
                <span
                  style={{
                    userSelect: 'none',
                  }}
                >
                  Giảng viên
                </span>
              </>
            }
            endContent={
              <Popover
                placement="bottomLeft"
                content={
                  <UserCountContent
                    title="giảng viên tham gia"
                    count={itemData.instructorCount}
                    onCountChange={onInstructorCountChange}
                  />
                }
                arrow={false}
                trigger={['click']}
                styles={{
                  body: { padding: '8px 0', width: 240 },
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
                    {!itemData.instructorCount
                      ? 'Trống'
                      : `${itemData.instructorCount ?? 0} giảng viên`}
                  </Button>

                  {Boolean(itemData.instructorCount) && (
                    <Button
                      type="text"
                      size="small"
                      style={{
                        borderRadius: 6,
                        padding: '0 6px',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onInstructorCountChange(0);
                      }}
                    >
                      <IconX size={15} color={'#838383'} />
                    </Button>
                  )}
                </Space>
              </Popover>
            }
          />

          <ActivityContentItem
            startContent={
              <>
                <IconSchool size={14} />
                <span
                  style={{
                    userSelect: 'none',
                  }}
                >
                  Học sinh
                </span>
              </>
            }
            endContent={
              <Popover
                placement="bottomLeft"
                content={
                  <UserCountContent
                    title="học sinh tham gia"
                    count={itemData.studentCount}
                    onCountChange={onStudentCountChange}
                  />
                }
                arrow={false}
                trigger={['click']}
                styles={{
                  body: { padding: '8px 0', width: 240 },
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
                    {!itemData.studentCount ? 'Trống' : `${itemData.studentCount} học sinh`}
                  </Button>

                  {Boolean(itemData.studentCount) && (
                    <Button
                      type="text"
                      size="small"
                      style={{
                        borderRadius: 6,
                        padding: '0 6px',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onStudentCountChange(0);
                      }}
                    >
                      <IconX size={15} color={'#838383'} />
                    </Button>
                  )}
                </Space>
              </Popover>
            }
          />
        </>
      )}
    </div>
  );
};

export default memo(ActivityMainContent);
