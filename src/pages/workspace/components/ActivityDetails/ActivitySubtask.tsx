import { ActivityType } from '@/common/enum/activity';
import { StageGroup } from '@/common/enum/stage';
import { IActivity, IStage } from '@/common/types';
import StatusContent from '@/components/shared/StatusContent';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import { getActivityTypeLabel, getColumnLabel, getColumnWidth } from '@/utils/activity';
import { useCreate, useInvalidate, useList, useUpdate } from '@refinedev/core';
import {
  IconBox,
  IconCalendarStats,
  IconChalkboardTeacher,
  IconCircleDashed,
  IconCornerDownLeft,
  IconDots,
  IconFlag,
  IconLocation,
  IconPencil,
  IconPlus,
  IconProgress,
  IconSchool,
  IconSquareRoundedX,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Input,
  Popover,
  Progress,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
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
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [subActivities, setSubActivities] = useState<IActivity[]>([]);

  useEffect(() => {
    const headerEl = headerScrollRef.current;
    const contentEl = contentScrollRef.current;

    if (!headerEl || !contentEl) return;

    const syncHeaderScroll = () => {
      headerEl.scrollLeft = contentEl.scrollLeft;
    };

    const syncContentScroll = () => {
      contentEl.scrollLeft = headerEl.scrollLeft;
    };

    contentEl.addEventListener('scroll', syncHeaderScroll);
    headerEl.addEventListener('scroll', syncContentScroll);

    return () => {
      contentEl.removeEventListener('scroll', syncHeaderScroll);
      headerEl.removeEventListener('scroll', syncContentScroll);
    };
  }, []);

  const { currentWorkspace } = useWorkspaceStore();
  const invalidate = useInvalidate();

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
      onSuccess: () => {
        refetchSubtask();
        invalidate({
          resource: 'activities',
          invalidates: ['detail', 'list'],
          id: activity.id,
        });
      },
    },
    mutationMode: 'optimistic',
  });

  useMemo(() => {
    if (!subActivitiesData?.data || isLoadingSubActivities) return [] as IActivity[];

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

      updateActivity({
        resource: 'activities',
        id: activityId,
        values: { stageId: stage.id, stage },
        mutationMode: 'optimistic',
      });
    },
    [updateActivity],
  );

  return (
    <Space direction="vertical" style={{ width: '100%', textAlign: 'start' }} size={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      </div>

      {isLoadingSubActivities ? (
        <div
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
          }}
        >
          {/* Header row skeleton */}
          <div
            ref={headerScrollRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: 8,
              marginBottom: 8,
              padding: 8,
              overflowX: 'auto',
            }}
          >
            <Skeleton.Button
              active
              style={{
                width: 24,
                height: 24,
                minWidth: 0,
                marginRight: 8,
                borderRadius: 4,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 180,
                minWidth: 0,
                height: 24,
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 150,
                minWidth: 0,
                height: 24,
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <Skeleton.Input
              active
              style={{
                width: 150,
                minWidth: 0,
                height: 24,
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <div style={{ flex: 1 }} />
            <Skeleton.Button
              active
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                minWidth: 0,
              }}
            />
          </div>

          {/* Task rows skeleton */}
          <div ref={contentScrollRef} style={{ overflowY: 'auto', maxHeight: 300 }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 8,
                }}
              >
                <Skeleton.Button
                  active
                  style={{
                    width: 24,
                    height: 24,
                    marginRight: 8,
                    minWidth: 0,
                    borderRadius: 4,
                  }}
                />
                <Skeleton.Input
                  active
                  style={{
                    width: 180,
                    borderRadius: 4,
                    height: 24,
                    marginRight: 8,
                  }}
                />
                <Skeleton.Input
                  active
                  style={{
                    width: 150,
                    borderRadius: 4,
                    height: 24,
                    marginRight: 8,
                    minWidth: 0,
                  }}
                />
                <Skeleton.Input
                  active
                  style={{
                    width: 150,
                    borderRadius: 4,
                    height: 24,
                    marginRight: 8,
                    minWidth: 0,
                  }}
                />
                <div style={{ flex: 1 }} />
                <Skeleton.Button
                  active
                  style={{
                    width: 24,
                    height: 24,
                    marginLeft: 8,
                    borderRadius: 4,
                    minWidth: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 8,
                    paddingBottom: 8,
                    width: '100%',
                    gap: 8,
                  }}
                >
                  {/* Column Headers với scroll */}
                  <div ref={headerScrollRef} style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
                    <div style={{ display: 'flex', minWidth: totalMinWidth }}>
                      {visibleColumns.map(key => {
                        const width = getColumnWidth(key);
                        const label = getColumnLabel(key);

                        return (
                          <div
                            key={key}
                            style={{
                              minWidth: width,
                              flex: visibleColumns.length === 1 ? 1 : `0 0 ${width}px`,
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
                                style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}
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
              )}

              {isAddingTask && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
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
                          }}
                          icon={<IconDots size={14} stroke={2.5} />}
                          onClick={() => setIsAddingTask(true)}
                        />
                      </Popover>
                    ) : (
                      <>
                        <Tooltip title="Chọn loại hoạt động" placement="top">
                          <Button
                            type="text"
                            size="small"
                            style={{
                              gap: 4,
                              color: '#646464',
                              borderColor: '#f0f0f0',
                              fontWeight: 500,
                              padding: '0 6px',
                            }}
                            icon={<IconBox size={14} stroke={2.5} />}
                          />
                        </Tooltip>

                        <Tooltip title="Chọn người thực hiện" placement="top">
                          <Button
                            type="text"
                            size="small"
                            style={{
                              gap: 4,
                              color: '#646464',
                              borderColor: '#f0f0f0',
                              fontWeight: 500,
                              padding: '0 6px',
                            }}
                            icon={<IconUsers size={14} stroke={2.5} />}
                          />
                        </Tooltip>

                        <Tooltip title="Thiết lập thời hạn" placement="top">
                          <Button
                            type="text"
                            size="small"
                            style={{
                              gap: 4,
                              color: '#646464',
                              borderColor: '#f0f0f0',
                              fontWeight: 500,
                              padding: '0 6px',
                            }}
                            icon={<IconCalendarStats size={14} stroke={2.5} />}
                          />
                        </Tooltip>

                        <Tooltip title="Độ ưu tiên" placement="top">
                          <Button
                            type="text"
                            size="small"
                            style={{
                              gap: 4,
                              color: '#646464',
                              borderColor: '#f0f0f0',
                              fontWeight: 500,
                              padding: '0 6px',
                            }}
                            icon={<IconFlag size={14} stroke={2.5} />}
                          />
                        </Tooltip>
                        {formData.type === ActivityType.EVENT && (
                          <>
                            <Tooltip title="Vị trí tổ chức" placement="top">
                              <Button
                                type="text"
                                size="small"
                                style={{
                                  gap: 4,
                                  color: '#646464',
                                  borderColor: '#f0f0f0',
                                  fontWeight: 500,
                                  padding: '0 6px',
                                }}
                                icon={<IconLocation size={14} stroke={2.5} />}
                              />
                            </Tooltip>

                            <Tooltip title="Loại sự kiện" placement="top">
                              <Button
                                type="text"
                                size="small"
                                style={{
                                  gap: 4,
                                  color: '#646464',
                                  borderColor: '#f0f0f0',
                                  fontWeight: 500,
                                  padding: '0 6px',
                                }}
                                icon={<IconProgress size={14} stroke={2.5} />}
                              />
                            </Tooltip>

                            <Tooltip title="Số lượng giảng viên ước tính" placement="top">
                              <Button
                                type="text"
                                size="small"
                                style={{
                                  gap: 4,
                                  color: '#646464',
                                  borderColor: '#f0f0f0',
                                  fontWeight: 500,
                                  padding: '0 6px',
                                }}
                                icon={<IconChalkboardTeacher size={14} stroke={2.5} />}
                              />
                            </Tooltip>

                            <Tooltip title="Số lượng sinh viên ước tính" placement="top">
                              <Button
                                type="text"
                                size="small"
                                style={{
                                  gap: 4,
                                  color: '#646464',
                                  borderColor: '#f0f0f0',
                                  fontWeight: 500,
                                  padding: '0 6px',
                                }}
                                icon={<IconSchool size={14} stroke={2.5} />}
                              />
                            </Tooltip>
                          </>
                        )}
                      </>
                    )}

                    <Tooltip title={isTablet ? 'Hủy' : ''} placement="top">
                      <Button
                        style={{
                          gap: 4,
                          color: '#646464',
                          borderColor: '#f0f0f0',
                          fontWeight: 500,
                          padding: '0 6px',
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
                          backgroundColor: '#1890ff',
                          color: '#fff',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#40a9ff')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1890ff')}
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
                  </Space>
                </div>
              )}

              {subTasks.length > 0 && (
                <div
                  ref={contentScrollRef}
                  style={{
                    width: '100%',
                    borderTop: '1px solid #f0f0f0',
                    overflow: 'auto',
                    maxHeight: 400,
                  }}
                >
                  {subTasks.map(sub => (
                    <div
                      key={sub.id}
                      style={{
                        padding: 8,
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        minWidth: totalMinWidth,
                        position: 'relative',
                      }}
                    >
                      {visibleColumns.map(key => {
                        const width = getColumnWidth(key);
                        let content = null;

                        switch (key) {
                          case 'name':
                            content = sub.name;
                            break;
                          case 'type':
                            content = getActivityTypeLabel(sub.type);
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
                            content =
                              sub.assignees
                                ?.map(
                                  a => a.user.name.charAt(0).toUpperCase() + a.user.name.slice(1),
                                )
                                .join(', ') || '-';
                            break;
                          case 'startDate':
                            content = sub.startTime?.toISOString() || '-';
                            break;
                          case 'dueDate':
                            content = sub.endTime?.toISOString() || '-';
                            break;
                          case 'priority':
                            content = sub.priority || '-';
                            break;
                          case 'location':
                            content = sub.location || '-';
                            break;
                          case 'description':
                            content = sub.description || '-';
                            break;
                          default:
                            content = '-';
                        }

                        return (
                          <div
                            key={key}
                            style={{
                              minWidth: width,
                              flex: visibleColumns.length === 1 ? 1 : `0 0 ${width}px`,
                              padding: `0 ${key === 'stage' ? 0 : 8}px`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {content}
                          </div>
                        );
                      })}

                      <div
                        style={{
                          position: 'sticky',
                          right: 0,
                          marginLeft: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'white',
                          height: '100%',
                          zIndex: 5,
                          paddingRight: isTablet ? 8 : 0,
                        }}
                      >
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
              )}
            </div>
          )}
        </>
      )}
    </Space>
  );
};

export default ActivitySubtask;
