import { FormAddActivityPayload, IActivity } from '@/common/types/activities';
import { useCreate, useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import { message } from 'antd';
import { useCallback } from 'react';
import { useWorkspaces } from './useWorkspaces';

export const useActivityActions = () => {
  const invalidate = useInvalidate();
  const { currentWorkspace } = useWorkspaces();

  const { mutate: createActivity, isPending: isCreating } = useCreate();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdate();
  const { mutate: deleteActivity, isPending: isDeleting } = useDelete();

  const markComplete = useCallback(
    async (
      activity: IActivity,
      stages: any[] = [],
      updateLocalActivity?: (id: string, data: any) => void,
    ) => {
      try {
        // Tìm stage có stageGroup = 'done' (ưu tiên) hoặc stage có position cao nhất
        const sortedStages = [...stages].sort((a, b) => (a.position || 0) - (b.position || 0));
        const completedStage =
          sortedStages.find(stage => stage.stageGroup === 'done') ||
          sortedStages.find(stage => stage.title?.toUpperCase() === 'COMPLETE') ||
          sortedStages.find(stage => stage.title?.toUpperCase() === 'DONE') ||
          sortedStages[sortedStages.length - 1];

        // OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
        if (updateLocalActivity && completedStage) {
          updateLocalActivity(activity.id, {
            stageId: completedStage.id,
            status: 'completed',
          });
        }

        updateActivity(
          {
            resource: 'activities',
            id: activity.id,
            values: {
              stageId: completedStage?.id,
              status: 'completed',
            },
          },
          {
            onSuccess: () => {
              invalidate({
                resource: 'activities',
                invalidates: ['list', 'detail', 'many'],
              });
              invalidate({
                resource: 'stages',
                invalidates: ['list'],
              });
            },
            onError: () => {
              // Rollback optimistic update nếu API thất bại
              if (updateLocalActivity) {
                updateLocalActivity(activity.id, {
                  stageId: activity.stageId,
                  status: activity.status,
                });
              }
            },
          },
        );
      } catch (error) {
        // Silent error handling
      }
    },
    [updateActivity, invalidate],
  );

  const duplicateActivity = useCallback(
    async (activity: IActivity) => {
      try {
        console.log('duplicateActivity called with:', activity.id, activity.name);

        if (!currentWorkspace?.id) {
          console.error('No current workspace found');
          return;
        }

        const { id, createdAt, updatedAt, assignees, files, ...activityData } = activity;
        const duplicateData: FormAddActivityPayload = {
          ...activityData,
          name: `${activity.name} (Copy)`,
          workspaceId: currentWorkspace.id,
          priority: activityData.priority || undefined, // Convert null to undefined
          startTime: activityData.startTime || undefined, // Convert null to undefined
          endTime: activityData.endTime || undefined, // Convert null to undefined
          assignees:
            assignees?.map(assignee => ({
              userId: assignee.userId,
            })) || [],
          attachments: undefined,
        };

        console.log('duplicateData:', duplicateData);

        createActivity(
          {
            resource: 'activities',
            values: duplicateData,
          },
          {
            onSuccess: data => {
              console.log('Duplicate success:', data);
              invalidate({
                resource: 'activities',
                invalidates: ['list', 'detail', 'many'],
              });
              invalidate({
                resource: 'stages',
                invalidates: ['list'],
              });
            },
            onError: error => {
              console.error('Duplicate activity error:', error);
            },
          },
        );
      } catch (error) {
        console.error('Duplicate activity error:', error);
      }
    },
    [createActivity, invalidate, currentWorkspace],
  );

  const removeActivity = useCallback(
    async (activity: IActivity) => {
      deleteActivity(
        {
          resource: 'activities',
          id: activity.id,
        },
        {
          onSuccess: () => {
            invalidate({
              resource: 'activities',
              invalidates: ['list', 'detail', 'many'],
            });
            invalidate({
              resource: 'stages',
              invalidates: ['list'],
            });
            message.success('Xóa thành công');
          },
          onError: () => {
            message.error('Xóa thất bại');
          },
        },
      );
    },
    [deleteActivity, invalidate],
  );

  const createSubtask = useCallback(
    async (activity: IActivity) => {
      try {
        console.log('createSubtask called with:', activity.id, activity.name);

        if (!currentWorkspace?.id) {
          console.error('No current workspace found');
          return;
        }

        const subtaskData = {
          parentId: activity.id,
          name: `Subtask của ${activity.name}`,
          workspaceId: currentWorkspace.id,
          stageId: activity.stageId || activity.stage?.id,
          type: 'task' as const,
        };

        console.log('subtaskData:', subtaskData);

        createActivity(
          {
            resource: 'activities',
            values: subtaskData,
          },
          {
            onSuccess: data => {
              console.log('Create subtask success:', data);
              invalidate({
                resource: 'activities',
                invalidates: ['list', 'detail', 'many'],
              });
              invalidate({
                resource: 'stages',
                invalidates: ['list'],
              });
            },
            onError: error => {
              console.error('Create subtask error:', error);
            },
          },
        );
      } catch (error) {
        console.error('Create subtask error:', error);
      }
    },
    [createActivity, invalidate, currentWorkspace],
  );

  const renameActivity = useCallback(
    async (
      activity: IActivity,
      newName: string,
      updateLocalActivity?: (id: string, data: any) => void,
    ) => {
      if (updateLocalActivity) {
        updateLocalActivity(activity.id, { name: newName.trim() });
      }

      updateActivity(
        {
          resource: 'activities',
          id: activity.id,
          values: { name: newName.trim() },
        },
        {
          onSuccess: () => {
            invalidate({
              resource: 'activities',
              invalidates: ['list', 'detail', 'many'],
            });
            message.success('Đổi tên thành công');
          },
          onError: () => {
            // Rollback: Khôi phục tên cũ nếu API thất bại
            if (updateLocalActivity) {
              updateLocalActivity(activity.id, { name: activity.name });
            }
            message.error('Đổi tên thất bại');
          },
        },
      );
    },
    [updateActivity, invalidate],
  );

  return {
    markComplete,
    duplicateActivity,
    removeActivity,
    createSubtask,
    renameActivity,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
