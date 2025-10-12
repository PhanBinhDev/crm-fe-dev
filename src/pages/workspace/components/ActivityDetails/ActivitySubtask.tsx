import { ActivityType } from '@/common/enum/activity';
import { StageGroup } from '@/common/enum/stage';
import { ActivityPriorityLevel, IActivity, IStage } from '@/common/types';
import { IAssignee } from '@/common/types/assignee';
import ActivityTypeContent from '@/components/shared/ActivityTypeContent';
import AssigneeContent from '@/components/shared/AssigneeContent';
import LocationContent from '@/components/shared/LocationContent';
import PriorityContent from '@/components/shared/PriorityContent';
import StatusContent from '@/components/shared/StatusContent';
import UserCountContent from '@/components/shared/UserCountContent';
import ActivitySubtaskSkeleton from '@/components/skeletons/ActivitySubtaskSkeleton';
import InlineEditText from '@/components/ui/InlineEditText';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import {
  getActivityPriorityColor,
  getActivityPriorityLabel,
  getActivityTypeLabel,
  getColorFromName,
  getColumnLabel,
  getColumnWidth,
  getInitials,
} from '@/utils/activity';
import { useCreate, useInvalidate, useList, useUpdate } from '@refinedev/core';
import {
  IconBox,
  IconCalendarStats,
  IconChalkboardTeacher,
  IconCheck,
  IconCircleDashed,
  IconCornerDownLeft,
  IconDots,
  IconFlag,
  IconFlagFilled,
  IconMapPin,
  IconMapPinFilled,
  IconPencil,
  IconPlus,
  IconSchool,
  IconSquareRoundedX,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Input,
  Popover,
  Progress,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

interface ActivitySubtaskProps {
  activity: IActivity;
  onSelectSubtask?: (activityId: IActivity) => void;
}

const ActivitySubtask = ({ activity, onSelectSubtask }: ActivitySubtaskProps) => {
  const [value, setValue] = useState('');
  const [columns, setColumns] = useState({
    stage: true,
    name: true,
    type: true,
    assignees: false,
    startDate: false,
    dueDate: false,
    priority: true,
    location: false,
    description: false,
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const isTablet = useMediaQuery('(max-width: 991px)');
  const [formData, setFormData] = useState<Partial<IActivity>>({});
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const [subActivities, setSubActivities] = useState<IActivity[]>([]);
  const [hoveredHeader, setHoveredHeader] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState<string | null>(null);

  const { currentWorkspace } = useWorkspaceStore();
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  const visibleColumns = useMemo(() => {
    return Object.keys(columns).filter(key => columns[key as keyof typeof columns]);
  }, [columns]);

  const totalMinWidth = useMemo(() => {
    return visibleColumns.reduce((sum, key) => sum + getColumnWidth(key), 0);
  }, [visibleColumns]);

  const onReset = () => {
    setValue('');
    setFormData({});
  };

  const { data: stagesData, isLoading: isLoadingStages } = useList<IStage>({
    resource: 'stages',
    filters: [
      {
        field: 'workspaceId',
        operator: 'eq',
        value: currentWorkspace?.id || activity?.workspaceId,
      },
    ],
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!(currentWorkspace?.id || activity?.workspaceId),
    },
  });

  const {
    data: subActivitiesData,
    isLoading: isLoadingSubActivities,
    refetch: refetchSubtask,
  } = useList<IActivity>({
    resource: `activities/${activity.id}/sub-activities`,
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!activity.id,
      retry: false,
    },
  });

  const { mutate: updateActivity } = useUpdate<IActivity>({
    mutationOptions: {
      retry: false,
    },
    mutationMode: 'optimistic',
    invalidates: [],
  });

  useEffect(() => {
    if (!subActivitiesData?.data || isLoadingSubActivities) return;
    setSubActivities(subActivitiesData.data);
  }, [subActivitiesData, isLoadingSubActivities]);

  const stages = useMemo(() => {
    if (!stagesData?.data || isLoadingStages) return [] as IStage[];

    return stagesData.data;
  }, [stagesData, isLoadingStages]);

  const defaultTodoStage = useMemo(() => {
    const find = stages.filter(stage => stage.stageGroup === StageGroup.NOT_STARTED);

    return find.length > 0 ? find[0].id : undefined;
  }, [stages]);

  const { mutate: createSubtask, isPending: isCreating } = useCreate<IActivity>({
    resource: 'activities',
    values: {
      parentId: activity.id,
      workspaceId: currentWorkspace?.id || activity?.workspaceId,
      type: formData.type || activity.type,
      stageId: formData.stageId || defaultTodoStage,
      name: value,
      ...formData,
    },
    mutationOptions: {
      retry: false,
      onSuccess: () => {
        invalidate({ resource: 'activities', invalidates: ['list'] });
        refetchSubtask();
        onReset();
      },
    },
  });

  const { subTasks, doneCount, totalCount, percent } = useMemo(() => {
    const doneCount = subActivities?.filter((t: IActivity) => t?.stage?.isCompleted).length;
    const totalCount = subActivities?.length;
    const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    return { subTasks: subActivities, doneCount, totalCount, percent };
  }, [subActivities]);

  useEffect(() => {
    const headerEl = headerScrollRef.current;

    if (!headerEl) return;

    const allContentEls = document.querySelectorAll('[data-content-scroll="true"]');

    const syncFromContent = (e: Event) => {
      const scrollLeft = (e.target as HTMLElement).scrollLeft;
      headerEl.scrollLeft = scrollLeft;
      allContentEls.forEach(el => {
        if (el !== e.target) {
          (el as HTMLElement).scrollLeft = scrollLeft;
        }
      });
    };

    const syncFromHeader = () => {
      const scrollLeft = headerEl.scrollLeft;
      allContentEls.forEach(el => {
        (el as HTMLElement).scrollLeft = scrollLeft;
      });
    };

    allContentEls.forEach(el => {
      el.addEventListener('scroll', syncFromContent);
    });
    headerEl.addEventListener('scroll', syncFromHeader);

    return () => {
      allContentEls.forEach(el => {
        el.removeEventListener('scroll', syncFromContent);
      });
      headerEl.removeEventListener('scroll', syncFromHeader);
    };
  }, [subTasks]);

  const onCancel = () => {
    setIsAddingTask(false);
    setValue('');
  };

  const handleCreate = () => {
    if (!value.trim() || (!formData.stageId && !defaultTodoStage)) return;

    createSubtask();
  };

  const handleOnStageChange = useCallback(
    (stage: IStage, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act => (act.id === activityId ? { ...act, stageId: stage.id, stage } : act)),
      );

      updateActivity(
        {
          resource: 'activities',
          id: activityId,
          values: { stageId: stage.id, stage },
          mutationMode: 'optimistic',
        },
        {
          onSuccess: () => {
            console.log('invalidate progress');
            queryClient.invalidateQueries({
              queryKey: ['activity-progress', activity.id],
            });
            refetchSubtask();
          },
        },
      );
    },
    [updateActivity, setSubActivities],
  );

  const handleOnPriorityChange = useCallback(
    (priority: ActivityPriorityLevel | null, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act =>
          act.id === activityId ? { ...act, priority: priority?.value || null } : act,
        ),
      );

      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { priority: priority?.value || null },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity],
  );

  const handleOnActivityTypeClick = useCallback(
    (type: ActivityType, activityId: string) => {
      setSubActivities(prev => prev.map(act => (act.id === activityId ? { ...act, type } : act)));

      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { type },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  const handleOnNameChange = useCallback(
    (name: string, activityId: string) => {
      setSubActivities(prev => prev.map(act => (act.id === activityId ? { ...act, name } : act)));
      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { name },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  const handleOnDescriptionChange = useCallback(
    (description: string, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act => (act.id === activityId ? { ...act, description } : act)),
      );
      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { description },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  const handleOnStartDateChange = useCallback(
    (startTime: Date | null, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act => (act.id === activityId ? { ...act, startTime } : act)),
      );

      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { startTime },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  const handleOnEndDateChange = useCallback(
    (endTime: Date | null, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act => (act.id === activityId ? { ...act, endTime } : act)),
      );

      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { endTime },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  const debouncedUpdateActivity = useMemo(
    () =>
      debounce((activityId: string, newAssignees: IAssignee[]) => {
        updateActivity({
          resource: 'activities',
          id: activityId,
          values: { assignees: newAssignees.map(a => ({ userId: a.user.id })) },
          mutationMode: 'optimistic',
        });
      }, 500),
    [updateActivity],
  );

  // const handleOnAssigneeChange = useCallback(
  //   (user: IUser, activityId: string) => {
  //     setSubActivities(prev =>
  //       prev.map(act => {
  //         if (act.id !== activityId) return act;
  //         const exist = act.assignees?.some(a => a.user.id === user.id);
  //         let newAssignees: IAssignee[];
  //         if (exist) {
  //           newAssignees = act.assignees!.filter(a => a.user.id !== user.id);
  //         } else {
  //           newAssignees = [
  //             ...(act.assignees || []),
  //             {
  //               user,
  //               id: uuidv4(),
  //               role: AssigneeRole.COLLABORATOR,
  //               activityId: act.id,
  //               createdAt: new Date().toISOString(),
  //               updatedAt: new Date().toISOString(),
  //               userId: user.id,
  //               status: AssignmentStatus.PENDING,
  //             },
  //           ];
  //         }
  //         // Lưu vào state tạm để debounce
  //         setPendingAssignees(prev => ({ ...prev, [activityId]: newAssignees }));
  //         // Gọi debounce update
  //         debouncedUpdateActivity(activityId, newAssignees);
  //         return { ...act, assignees: newAssignees };
  //       }),
  //     );
  //   },
  //   [debouncedUpdateActivity, setSubActivities],
  // );

  const handleOnLocationChange = useCallback(
    (location: string, activityId: string) => {
      setSubActivities(prev =>
        prev.map(act => (act.id === activityId ? { ...act, location } : act)),
      );
      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { location },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity, setSubActivities],
  );

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={12}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={() => setHoveredHeader(true)}
        onMouseLeave={() => setHoveredHeader(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography.Text style={{ fontSize: 18, fontWeight: 600, flexShrink: 0, margin: 2 }}>
            Hoạt động phụ:
          </Typography.Text>

          {subTasks.length > 0 && (
            <Progress
              percent={percent}
              size={'small'}
              strokeColor={'#6ad3bc'}
              format={() => (
                <span style={{ fontSize: 12, color: '#838383' }}>
                  {doneCount}/{totalCount}
                </span>
              )}
              strokeWidth={8}
              style={{
                borderRadius: 8,
                minWidth: 80,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                marginTop: '4px',
              }}
            />
          )}
        </div>
        {hoveredHeader && (
          <Button
            type="text"
            onClick={() => setIsAddingTask(true)}
            icon={<IconPlus size={14} color="#838383" />}
            style={{
              borderRadius: 8,
            }}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          />
        )}
      </div>

      {isLoadingSubActivities ? (
        <ActivitySubtaskSkeleton />
      ) : (
        <>
          {!subTasks.length && !isAddingTask ? (
            <Button
              type="text"
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                color: '#838383',
                fontWeight: 500,
                fontSize: 14,
                height: 42,
              }}
              size="large"
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              onClick={() => setIsAddingTask(true)}
              icon={<IconPlus size={14} color="#838383" />}
            >
              Thêm hoạt động phụ
            </Button>
          ) : (
            <div
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                color: '#838383',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {subTasks.length > 0 && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 8,
                      paddingBottom: 8,
                      width: '100%',
                      gap: 8,
                    }}
                  >
                    {/* Column Headers với scroll */}
                    <div
                      ref={headerScrollRef}
                      style={{
                        flex: 1,
                        overflow: 'auto',
                        minWidth: 0,
                      }}
                    >
                      <div style={{ display: 'flex', minWidth: totalMinWidth }}>
                        {visibleColumns.map(key => {
                          const width = getColumnWidth(key);
                          const label = getColumnLabel(key);

                          return (
                            <div
                              key={key}
                              style={{
                                minWidth: width,
                                width: width,
                                flex: `0 0 ${width}px`,
                                fontWeight: 600,
                                fontSize: key === 'stage' ? 16 : 13,
                                padding: `0 ${key === 'stage' ? 4 : 8}px`,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {key === 'stage' ? (
                                <Tooltip title="Giai đoạn" placement="top">
                                  <IconCircleDashed size={16} stroke={3} color="#838383" />
                                </Tooltip>
                              ) : (
                                label
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column management button - cố định */}
                    <div style={{ flexShrink: 0 }}>
                      <Popover
                        placement="leftBottom"
                        trigger={['click']}
                        arrow={false}
                        content={
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                            }}
                          >
                            <div style={{ padding: 8 }}>
                              <Button
                                type="text"
                                icon={<IconPlus size={16} />}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  color: '#646464',
                                  padding: '0 8px',
                                  borderRadius: 7,
                                  fontWeight: 500,
                                  gap: 6,
                                }}
                                styles={{
                                  icon: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  },
                                }}
                                onClick={() => {
                                  setIsAddingTask(true);
                                }}
                              >
                                Thêm hoạt động phụ
                              </Button>
                            </div>

                            <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 12px' }}>
                              <Typography.Title level={5} style={{ margin: '0 0 8px 0' }}>
                                Hiển thị cột
                              </Typography.Title>
                              {Object.keys(columns).map(key => {
                                const label = getColumnLabel(key);

                                if (['stage', 'name'].includes(key)) {
                                  return null;
                                }

                                return (
                                  <div
                                    key={key}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      margin: '4px 0',
                                    }}
                                  >
                                    <Checkbox
                                      checked={columns[key as keyof typeof columns]}
                                      disabled={key === 'name'}
                                      onChange={e => {
                                        setColumns(prev => ({
                                          ...prev,
                                          [key]: e.target.checked,
                                        }));
                                      }}
                                    />
                                    <span style={{ marginLeft: 8 }}>{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        }
                        styles={{
                          body: { padding: 0, width: 200 },
                        }}
                      >
                        <Button
                          size="small"
                          type="text"
                          style={{
                            color: '#646464',
                            borderColor: '#f0f0f0',
                            padding: '0 6px',
                            borderRadius: 7,
                          }}
                          icon={<IconDots size={14} />}
                        />
                      </Popover>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      borderTop: '1px solid #f0f0f0',
                      maxHeight: 400,
                    }}
                  >
                    {subTasks.map(sub => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: 8,
                          paddingBottom: 8,
                          width: '100%',
                          gap: 8,
                        }}
                      >
                        <div
                          data-content-scroll="true"
                          style={{
                            flex: 1,
                            overflow: 'auto',
                            minWidth: 0,
                          }}
                        >
                          <div style={{ display: 'flex', minWidth: totalMinWidth }}>
                            {visibleColumns.map(key => {
                              const width = getColumnWidth(key);
                              let content = null;

                              switch (key) {
                                case 'name':
                                  content = (
                                    <InlineEditText
                                      value={sub.name || ''}
                                      onSave={newValue => handleOnNameChange(newValue, sub.id)}
                                      placeholder="Chưa có tên"
                                      minWidth={0}
                                    />
                                  );
                                  break;
                                case 'type':
                                  content = (
                                    <Popover
                                      placement="topRight"
                                      trigger={['click']}
                                      arrow={false}
                                      content={
                                        <ActivityTypeContent
                                          selectedType={sub.type}
                                          onActivityTypeClick={(type: ActivityType) =>
                                            handleOnActivityTypeClick(type, sub.id)
                                          }
                                        />
                                      }
                                      styles={{
                                        body: {
                                          padding: '8px 0 0',
                                          width: 200,
                                        },
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        type="text"
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: 7,
                                          justifyContent: 'flex-start',
                                          minWidth: 95,
                                          color: '#333',
                                          fontWeight: 600,
                                          gap: 4,
                                        }}
                                        icon={
                                          sub.type === ActivityType.TASK ? (
                                            <IconCircleDashed size={14} color="#333" stroke={2.5} />
                                          ) : (
                                            <IconCalendarStats size={14} color="#333" stroke={2} />
                                          )
                                        }
                                      >
                                        {getActivityTypeLabel(sub.type)}
                                      </Button>
                                    </Popover>
                                  );
                                  break;
                                case 'stage':
                                  content = (
                                    <Popover
                                      placement="rightBottom"
                                      trigger={['click']}
                                      content={
                                        <StatusContent
                                          currentStage={sub.stage}
                                          onChangeStage={(stage: IStage) =>
                                            handleOnStageChange(stage, sub.id)
                                          }
                                          stages={stages}
                                        />
                                      }
                                      styles={{
                                        body: { padding: 0 },
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        type="text"
                                        style={{
                                          padding: 4,
                                          borderRadius: 8,
                                        }}
                                        styles={{
                                          icon: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          },
                                        }}
                                      >
                                        <IconCircleDashed
                                          size={16}
                                          stroke={3}
                                          color={sub.stage?.color || '#838383'}
                                        />
                                      </Button>
                                    </Popover>
                                  );
                                  break;
                                case 'assignees':
                                  content = (
                                    <Popover
                                      arrow={false}
                                      placement="topRight"
                                      trigger={['click']}
                                      content={<div>Hello</div>}
                                      styles={{
                                        body: { padding: 0, width: 250 },
                                      }}
                                    >
                                      <Button
                                        style={{
                                          paddingLeft: 8,
                                          color: '#333',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          borderRadius: 7,
                                          minWidth: 90,
                                          justifyContent: 'flex-start',
                                          fontSize: 13,
                                          gap: 4,
                                        }}
                                        type="text"
                                        size="small"
                                      >
                                        <IconUsers size={14} />
                                        <span>0 người</span>
                                      </Button>
                                    </Popover>
                                  );
                                  break;
                                case 'startDate':
                                  content = (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Tooltip
                                        title={
                                          sub.startTime
                                            ? dayjs(sub.startTime).format('DD/MM/YYYY HH:mm')
                                            : ''
                                        }
                                      >
                                        <Typography.Text
                                          style={{ paddingLeft: 8, fontWeight: 600, color: '#222' }}
                                        >
                                          {sub.startTime ? (
                                            dayjs(sub.startTime).format('DD/MM/YYYY')
                                          ) : (
                                            <span
                                              style={{
                                                paddingLeft: 8,
                                                color: '#bbb',
                                                fontStyle: 'italic',
                                                fontWeight: 400,
                                                fontSize: 13,
                                              }}
                                            >
                                              Chưa đặt
                                            </span>
                                          )}
                                        </Typography.Text>
                                      </Tooltip>
                                      <Popover
                                        trigger={['click']}
                                        placement="topRight"
                                        arrow={false}
                                        content={
                                          <DatePicker
                                            value={sub.startTime ? dayjs(sub.startTime) : null}
                                            onChange={date => {
                                              handleOnStartDateChange(
                                                date ? date.toDate() : null,
                                                sub.id,
                                              );
                                            }}
                                            format="DD/MM/YYYY HH:mm"
                                            allowClear
                                            variant="borderless"
                                            disabledDate={current =>
                                              sub.endTime
                                                ? current && current > dayjs(sub.endTime)
                                                : false
                                            }
                                          />
                                        }
                                        styles={{
                                          body: { padding: 8 },
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          type="text"
                                          icon={
                                            <IconCalendarStats size={14} color="#333" stroke={2} />
                                          }
                                          style={{ marginLeft: 2, borderRadius: 7 }}
                                          styles={{
                                            icon: {
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            },
                                          }}
                                        />
                                      </Popover>
                                    </div>
                                  );
                                  break;
                                case 'dueDate':
                                  content = (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Tooltip
                                        title={
                                          sub.endTime
                                            ? dayjs(sub.endTime).format('DD/MM/YYYY HH:mm')
                                            : ''
                                        }
                                      >
                                        <Typography.Text style={{ paddingLeft: 8 }}>
                                          {sub.endTime ? (
                                            dayjs(sub.endTime).format('DD/MM/YYYY')
                                          ) : (
                                            <span
                                              style={{
                                                color: '#bbb',
                                                fontStyle: 'italic',
                                                fontSize: 13,
                                              }}
                                            >
                                              Chưa đặt
                                            </span>
                                          )}
                                        </Typography.Text>
                                      </Tooltip>
                                      <Popover
                                        trigger={['click']}
                                        placement="topRight"
                                        arrow={false}
                                        content={
                                          <DatePicker
                                            value={sub.endTime ? dayjs(sub.endTime) : null}
                                            onChange={date => {
                                              handleOnEndDateChange(
                                                date ? date.toDate() : null,
                                                sub.id,
                                              );
                                            }}
                                            format="DD/MM/YYYY HH:mm"
                                            showTime={{}}
                                            allowClear
                                            variant="borderless"
                                            disabledDate={current =>
                                              sub.startTime
                                                ? current && current < dayjs(sub.startTime)
                                                : false
                                            }
                                          />
                                        }
                                        styles={{
                                          body: { padding: 8 },
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          type="text"
                                          icon={
                                            <IconCalendarStats size={14} color="#333" stroke={2} />
                                          }
                                          style={{ marginLeft: 2, borderRadius: 7 }}
                                          styles={{
                                            icon: {
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            },
                                          }}
                                        />
                                      </Popover>
                                    </div>
                                  );
                                  break;
                                case 'priority':
                                  content = (
                                    <Popover
                                      placement="topRight"
                                      trigger={['click']}
                                      arrow={false}
                                      content={
                                        <PriorityContent
                                          priority={
                                            sub.priority
                                              ? {
                                                  color: getActivityPriorityColor(sub.priority),
                                                  label: getActivityPriorityLabel(sub.priority),
                                                  value: sub.priority,
                                                }
                                              : null
                                          }
                                          onChangePriority={priority =>
                                            handleOnPriorityChange(priority, sub.id)
                                          }
                                        />
                                      }
                                      styles={{
                                        body: { padding: '8px 0', width: 180 },
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        type="text"
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: 7,
                                          minWidth: 100,
                                          justifyContent: 'flex-start',
                                          color: '#333',
                                          fontWeight: 600,
                                          gap: 4,
                                        }}
                                        icon={
                                          sub.priority ? (
                                            <IconFlagFilled
                                              size={14}
                                              color={getActivityPriorityColor(sub.priority)}
                                            />
                                          ) : (
                                            <IconFlag size={14} color="#333" />
                                          )
                                        }
                                        styles={{
                                          icon: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          },
                                        }}
                                      >
                                        {sub.priority
                                          ? getActivityPriorityLabel(sub.priority)
                                          : 'Độ ưu tiên'}
                                      </Button>
                                    </Popover>
                                  );
                                  break;
                                case 'location':
                                  content = (
                                    <Popover
                                      placement="topRight"
                                      trigger={['click']}
                                      arrow={false}
                                      content={
                                        <LocationContent
                                          location={sub.location}
                                          onLocationChange={location =>
                                            handleOnLocationChange(location, sub.id)
                                          }
                                        />
                                      }
                                      styles={{
                                        body: { padding: '8px 0', width: 220 },
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        type="text"
                                        style={{
                                          padding: '2px 6px',
                                          borderRadius: 7,
                                          minWidth: 70,
                                          justifyContent: 'flex-start',
                                          color: '#333',
                                          fontWeight: 600,
                                          gap: 4,
                                        }}
                                        icon={<IconMapPin size={14} color="#333" />}
                                      >
                                        {sub.location || 'Vị trí'}
                                      </Button>
                                    </Popover>
                                  );
                                  break;
                                case 'description':
                                  content = (
                                    <InlineEditText
                                      value={sub.description || ''}
                                      onSave={newValue =>
                                        handleOnDescriptionChange(newValue, sub.id)
                                      }
                                      placeholder="Chưa có mô tả"
                                      minWidth={0}
                                    />
                                  );
                                  break;
                                default:
                                  content = '-';
                              }

                              return (
                                <div
                                  key={key}
                                  style={{
                                    minWidth: width,
                                    width: width,
                                    flex: `0 0 ${width}px`,
                                    fontWeight: 600,
                                    fontSize: key === 'stage' ? 16 : 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#838383',
                                  }}
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          <Popover
                            placement="leftBottom"
                            trigger={['click']}
                            styles={{
                              body: { padding: 8 },
                            }}
                            arrow={false}
                            content={
                              <div style={{ width: 160 }}>
                                <Button
                                  type="text"
                                  icon={<IconPencil size={16} />}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    justifyContent: 'flex-start',
                                    color: '#646464',
                                    padding: '0 8px',
                                  }}
                                  styles={{
                                    icon: {
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    },
                                  }}
                                  onClick={() => onSelectSubtask?.(sub)}
                                >
                                  Chỉnh sửa
                                </Button>
                                <Button
                                  type="text"
                                  icon={<IconSquareRoundedX size={16} />}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    justifyContent: 'flex-start',
                                    color: '#ff4d4f',
                                    padding: '0 8px',
                                  }}
                                  styles={{
                                    icon: {
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    },
                                  }}
                                >
                                  Xóa
                                </Button>
                              </div>
                            }
                          >
                            <Button
                              size="small"
                              type="text"
                              style={{
                                color: '#646464',
                                padding: '0 6px',
                                borderRadius: 7,
                                border: '1px solid #f0f0f0',
                              }}
                              icon={<IconDots size={14} />}
                            />
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {isAddingTask && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    overflowX: 'auto',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: 8,
                    borderTop: subTasks.length > 0 ? '1px solid #f0f0f0' : undefined,
                  }}
                >
                  <Space
                    styles={{
                      item: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                    style={{
                      gap: 0,
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      background: 'white',
                    }}
                  >
                    <Popover
                      placement="rightBottom"
                      trigger={['click']}
                      content={
                        <StatusContent
                          currentStage={formData.stage || null}
                          onChangeStage={(stage: IStage) => {
                            setFormData(prev => ({ ...prev, stageId: stage.id, stage }));
                          }}
                          stages={stages}
                        />
                      }
                      styles={{
                        body: { padding: 0 },
                      }}
                    >
                      <Button
                        size="small"
                        type="text"
                        style={{
                          padding: 4,
                          borderRadius: 8,
                        }}
                        styles={{
                          icon: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        }}
                      >
                        <IconCircleDashed
                          size={16}
                          stroke={3}
                          color={formData?.stage?.color || '#838383'}
                        />
                      </Button>
                    </Popover>

                    <Input
                      style={{
                        width: 250,
                        color: '#333',
                        fontWeight: 600,
                      }}
                      size="small"
                      variant="borderless"
                      placeholder="Nhập tên hoạt động phụ..."
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      onPressEnter={handleCreate}
                      autoFocus
                      disabled={isCreating}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: -12,
                        width: 24,
                        height: '100%',
                        pointerEvents: 'none',
                        background:
                          'linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0))',
                        backdropFilter: 'blur(4px)',
                        zIndex: 3,
                      }}
                    />
                  </Space>

                  {/* Action buttons */}
                  <Space
                    styles={{
                      item: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    }}
                    style={{
                      marginLeft: 'auto',
                    }}
                  >
                    {isTablet ? (
                      <Popover
                        placement="topRight"
                        trigger={['click']}
                        styles={{
                          body: { padding: 0, width: 250 },
                        }}
                        arrow={false}
                        content={
                          <Space
                            style={{
                              padding: 8,
                              width: '100%',
                            }}
                            styles={{
                              item: {
                                width: '100%',
                              },
                            }}
                          >
                            <Typography
                              style={{
                                padding: '3px 12px 0',
                                fontWeight: 600,
                              }}
                            >
                              Tùy chỉnh
                            </Typography>
                          </Space>
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          style={{
                            gap: 4,
                            color: '#646464',
                            borderColor: '#f0f0f0',
                            fontWeight: 500,
                            padding: '0 6px',
                            borderRadius: 7,
                          }}
                          icon={<IconDots size={14} stroke={2.5} />}
                          onClick={() => setIsAddingTask(true)}
                        />
                      </Popover>
                    ) : (
                      <>
                        <Popover
                          placement="topRight"
                          trigger={['click']}
                          styles={{ body: { padding: '8px 0 0', width: 200 } }}
                          content={
                            <ActivityTypeContent
                              selectedType={formData.type || null}
                              onActivityTypeClick={(type: ActivityType) => {
                                setFormData(prev => ({ ...prev, type }));
                              }}
                            />
                          }
                          open={typePopoverOpen === 'type'}
                          onOpenChange={open => {
                            setTypePopoverOpen(open ? 'type' : null);
                          }}
                          arrow={false}
                        >
                          <Tooltip
                            title={!formData.type ? 'Chọn loại hoạt động' : undefined}
                            placement="bottom"
                            open={typePopoverOpen !== 'type' ? undefined : false}
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{
                                gap: 4,
                                color: '#646464',
                                borderColor: '#f0f0f0',
                                fontWeight: 500,
                                padding: '0 6px',
                                borderRadius: 7,
                              }}
                              icon={<IconBox size={14} stroke={2.5} />}
                            >
                              {formData.type && getActivityTypeLabel(formData.type)}
                            </Button>
                          </Tooltip>
                        </Popover>

                        <Popover
                          placement="topRight"
                          trigger={['click']}
                          arrow={false}
                          content={
                            <AssigneeContent
                              currentAssignees={formData.assignees || []}
                              onChangeAssignees={(assignees: IAssignee[]) =>
                                setFormData(prev => ({ ...prev, assignees }))
                              }
                            />
                          }
                          open={typePopoverOpen === 'assignee'}
                          onOpenChange={open => {
                            setTypePopoverOpen(open ? 'assignee' : null);
                          }}
                          styles={{
                            body: {
                              padding: 0,
                            },
                          }}
                        >
                          <Tooltip
                            title={!formData.assignees ? 'Chọn người thực hiện' : undefined}
                            placement="bottom"
                            open={typePopoverOpen !== 'assignee' ? undefined : false}
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{
                                gap: 4,
                                color: '#646464',
                                borderColor: '#f0f0f0',
                                fontWeight: 500,
                                padding: '0 6px',
                                borderRadius: 7,
                              }}
                              icon={<IconUsers size={14} stroke={2.5} />}
                            >
                              {formData.assignees && formData.assignees.length > 0 ? (
                                <>
                                  {formData.assignees && formData.assignees.length > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      {formData.assignees.slice(0, 2).map((assignee, index) => (
                                        <Tooltip
                                          key={assignee.id}
                                          title={assignee.user.name}
                                          placement="top"
                                        >
                                          <Avatar
                                            size="small"
                                            src={assignee.user.avatar}
                                            style={{
                                              width: 20,
                                              height: 20,
                                              fontSize: 11,
                                              backgroundColor: getColorFromName(assignee.user.name),
                                              marginLeft: index > 0 ? -6 : 0,
                                              border: '2px solid white',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            {getInitials(assignee.user.name)}
                                          </Avatar>
                                        </Tooltip>
                                      ))}
                                      {formData.assignees.length > 2 && (
                                        <Avatar
                                          size="small"
                                          style={{
                                            width: 20,
                                            height: 20,
                                            fontSize: 10,
                                            backgroundColor: '#f0f0f0',
                                            color: '#838383',
                                            marginLeft: -6,
                                            border: '2px solid white',
                                            fontWeight: 600,
                                          }}
                                        >
                                          +{formData.assignees.length - 2}
                                        </Avatar>
                                      )}
                                    </div>
                                  ) : null}
                                </>
                              ) : null}
                            </Button>
                          </Tooltip>
                        </Popover>

                        <Popover
                          placement="topRight"
                          trigger={['click']}
                          arrow={false}
                          content={<div>Hello</div>}
                          open={typePopoverOpen === 'dueDate'}
                          onOpenChange={open => {
                            setTypePopoverOpen(open ? 'dueDate' : null);
                          }}
                        >
                          <Tooltip
                            title="Thiết lập thời hạn"
                            placement="bottom"
                            open={typePopoverOpen !== 'dueDate' ? undefined : false}
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{
                                gap: 4,
                                color: '#646464',
                                borderColor: '#f0f0f0',
                                fontWeight: 500,
                                padding: '0 6px',
                                borderRadius: 7,
                              }}
                              icon={<IconCalendarStats size={14} stroke={2.5} />}
                            />
                          </Tooltip>
                        </Popover>

                        <Popover
                          placement="topRight"
                          trigger={['click']}
                          arrow={false}
                          styles={{
                            body: { padding: '8px 0', width: 180 },
                          }}
                          content={
                            <PriorityContent
                              priority={
                                formData.priority
                                  ? {
                                      color: getActivityPriorityColor(formData.priority),
                                      label: getActivityPriorityLabel(formData.priority),
                                      value: formData.priority,
                                    }
                                  : null
                              }
                              onChangePriority={priority => {
                                setFormData(prev => ({ ...prev, priority: priority?.value }));
                              }}
                            />
                          }
                          open={typePopoverOpen === 'priority'}
                          onOpenChange={open => {
                            setTypePopoverOpen(open ? 'priority' : null);
                          }}
                        >
                          <Tooltip
                            title={`Độ ưu tiên${formData.priority ? `: ${getActivityPriorityLabel(formData.priority)}` : ''}`}
                            placement="bottom"
                            open={typePopoverOpen !== 'priority' ? undefined : false}
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{
                                gap: 4,
                                color: '#646464',
                                borderColor: '#f0f0f0',
                                fontWeight: 500,
                                padding: '0 6px',
                                borderRadius: 7,
                              }}
                              icon={
                                formData.priority ? (
                                  <IconFlagFilled
                                    size={14}
                                    stroke={2.5}
                                    color={getActivityPriorityColor(formData.priority)}
                                  />
                                ) : (
                                  <IconFlag size={14} stroke={2.5} />
                                )
                              }
                            />
                          </Tooltip>
                        </Popover>
                        {formData.type === ActivityType.EVENT && (
                          <>
                            <Popover
                              placement="topRight"
                              trigger={['click']}
                              arrow={false}
                              content={
                                <LocationContent
                                  location={formData.location}
                                  onLocationChange={location => {
                                    setFormData(prev => ({ ...prev, location }));
                                    setTypePopoverOpen(null);
                                  }}
                                />
                              }
                              open={typePopoverOpen === 'location'}
                              onOpenChange={open => {
                                setTypePopoverOpen(open ? 'location' : null);
                              }}
                              styles={{
                                body: { padding: '8px 0', width: 220 },
                              }}
                            >
                              <Tooltip
                                title="Vị trí tổ chức"
                                placement="bottom"
                                open={typePopoverOpen !== 'location' ? undefined : false}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  style={{
                                    gap: 4,
                                    color: '#646464',
                                    borderColor: '#f0f0f0',
                                    fontWeight: 500,
                                    padding: '0 6px',
                                    borderRadius: 7,
                                  }}
                                  icon={
                                    formData.location ? (
                                      <IconMapPinFilled size={14} stroke={2.5} />
                                    ) : (
                                      <IconMapPin size={14} stroke={2.5} />
                                    )
                                  }
                                >
                                  {formData.location || 'Vị trí'}
                                </Button>
                              </Tooltip>
                            </Popover>

                            <Popover
                              placement="topRight"
                              trigger={['click']}
                              arrow={false}
                              content={
                                <UserCountContent
                                  count={formData.instructorCount || 0}
                                  title="Số lượng giảng viên ước tính"
                                  onCountChange={count => {
                                    setFormData(prev => ({ ...prev, instructorCount: count }));
                                    setTypePopoverOpen(null);
                                  }}
                                />
                              }
                              open={typePopoverOpen === 'instructorCount'}
                              onOpenChange={open => {
                                setTypePopoverOpen(open ? 'instructorCount' : null);
                              }}
                              styles={{
                                body: { padding: '8px 0', width: 240 },
                              }}
                            >
                              <Tooltip
                                title={`Giảng viên ước tính${formData.instructorCount ? `: ${formData.instructorCount} giảng viên` : ''}`}
                                placement="bottom"
                                open={typePopoverOpen !== 'instructorCount' ? undefined : false}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  style={{
                                    gap: 4,
                                    color: '#646464',
                                    borderColor: '#f0f0f0',
                                    fontWeight: 500,
                                    padding: '0 6px',
                                    borderRadius: 7,
                                  }}
                                  icon={<IconChalkboardTeacher size={14} stroke={2.5} />}
                                >
                                  {formData.instructorCount}
                                </Button>
                              </Tooltip>
                            </Popover>

                            <Popover
                              placement="topRight"
                              trigger={['click']}
                              arrow={false}
                              content={
                                <UserCountContent
                                  count={formData.studentCount || 0}
                                  title="Số lượng sinh viên ước tính"
                                  onCountChange={count => {
                                    setFormData(prev => ({ ...prev, studentCount: count }));
                                    setTypePopoverOpen(null);
                                  }}
                                />
                              }
                              open={typePopoverOpen === 'studentCount'}
                              onOpenChange={open => {
                                setTypePopoverOpen(open ? 'studentCount' : null);
                              }}
                              styles={{ body: { padding: '8px 0', width: 240 } }}
                            >
                              <Tooltip
                                title={`Sinh viên ước tính${formData.studentCount ? `: ${formData.studentCount} sinh viên` : ''}`}
                                placement="bottom"
                                open={typePopoverOpen !== 'studentCount' ? undefined : false}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  style={{
                                    gap: 4,
                                    color: '#646464',
                                    borderColor: '#f0f0f0',
                                    fontWeight: 500,
                                    padding: '0 6px',
                                    borderRadius: 7,
                                  }}
                                  icon={<IconSchool size={14} stroke={2.5} />}
                                >
                                  {formData.studentCount}
                                </Button>
                              </Tooltip>
                            </Popover>

                            <Tooltip
                              title={`Sự kiện ${formData.mandatory ? 'bắt buộc' : 'không bắt buộc'}`}
                              placement="bottom"
                            >
                              <Button
                                type="text"
                                size="small"
                                style={{
                                  gap: 4,
                                  borderColor: '#f0f0f0',
                                  fontWeight: 500,
                                  padding: '0 6px',
                                  borderRadius: 7,
                                }}
                                icon={
                                  formData.mandatory ? (
                                    <IconCheck size={14} stroke={2.5} color="#1890ff" />
                                  ) : (
                                    <IconX size={14} stroke={2.5} />
                                  )
                                }
                                onClick={() =>
                                  setFormData(prev => ({ ...prev, mandatory: !prev.mandatory }))
                                }
                              />
                            </Tooltip>
                          </>
                        )}
                      </>
                    )}
                  </Space>

                  <div
                    style={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      justifyContent: 'flex-end',
                      paddingLeft: 4,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: -16,
                        top: 0,
                        width: 16,
                        height: '100%',
                        pointerEvents: 'none',
                        background:
                          'linear-gradient(to left, rgba(255,255,255,0.85), rgba(255,255,255,0))',
                        zIndex: 3,
                      }}
                    />
                    <Tooltip title={isTablet ? 'Hủy' : ''} placement="top">
                      <Button
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
                          borderRadius: 7,
                        }}
                        type="text"
                        size="small"
                        onClick={onCancel}
                      >
                        {isTablet ? <IconX size={14} stroke={2.5} /> : 'Hủy'}
                      </Button>
                    </Tooltip>
                    <Tooltip title={isTablet ? 'Lưu' : ''} placement="top">
                      <Button
                        style={{
                          gap: 4,
                          backgroundColor: !value.trim() || isCreating ? '#77bdff' : '#1890ff',
                          color: '#fff',
                          borderRadius: 7,
                        }}
                        onMouseEnter={e => {
                          if (!value.trim() || isCreating) return;
                          e.currentTarget.style.backgroundColor = '#40a9ff';
                        }}
                        onMouseLeave={e => {
                          if (!value.trim() || isCreating) return;
                          e.currentTarget.style.backgroundColor = '#1890ff';
                        }}
                        size="small"
                        icon={<IconCornerDownLeft size={14} stroke={3} />}
                        iconPosition="end"
                        type="text"
                        loading={isCreating}
                        disabled={!value.trim() || isCreating}
                        onClick={handleCreate}
                      >
                        {isTablet || isCreating ? '' : 'Lưu'}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Space>
  );
};

export default ActivitySubtask;
