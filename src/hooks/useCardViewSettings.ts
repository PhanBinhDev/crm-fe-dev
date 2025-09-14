import { useCustomMutation, useOne } from '@refinedev/core';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWorkspaceStore } from './useWorkspaces';

export type CardField =
  | 'name'
  | 'description'
  | 'status'
  | 'priority'
  | 'assignees'
  | 'dateCreated'
  | 'dateUpdated'
  | 'dueDate'
  | 'dateClosed'
  | 'tags'
  | 'taskId'
  | 'taskType'
  | 'progress'
  | 'location'
  | 'estimateTime'
  | 'attachments'
  | 'checklist'
  | 'comments'
  | 'mandatory'
  | 'category';

export interface FieldGroups {
  shown: CardField[];
  popular: CardField[];
  hidden: CardField[];
}

export type CardSize = 'small' | 'medium' | 'large';

export interface CardViewSettings {
  cardSize: CardSize;
  stackFields: boolean;
  showEmptyFields: boolean;
  fields: FieldGroups;
  maxVisibleAssignees: number;
  cardBackground: 'white' | 'colored' | 'statusBased';
  additionalSettings?: Record<string, any>;
}

// State mặc định
const defaultSettings: CardViewSettings = {
  cardSize: 'medium',
  stackFields: false,
  showEmptyFields: false,
  fields: {
    shown: ['name'],
    popular: ['description', 'status'],
    hidden: [
      'assignees',
      'dateClosed',
      'dateUpdated',
      'dueDate',
      'priority',
      'tags',
      'taskId',
      'taskType',
      'progress',
      'location',
      'estimateTime',
      'attachments',
      'checklist',
      'comments',
      'mandatory',
      'category',
    ],
  },
  maxVisibleAssignees: 3,
  cardBackground: 'white',
};

interface CardViewSettingsStore {
  // Lưu settings theo workspaceId
  settingsByWorkspace: Record<string, CardViewSettings>;
  // Cập nhật settings cho một workspace
  updateSettings: (workspaceId: string, newSettings: Partial<CardViewSettings>) => void;
  // Di chuyển field giữa các nhóm
  moveField: (
    workspaceId: string,
    field: CardField,
    from: keyof FieldGroups,
    to: keyof FieldGroups,
  ) => void;
  // Reset settings cho một workspace
  resetSettings: (workspaceId: string) => void;
}

export const useCardViewSettingsStore = create<CardViewSettingsStore>()(
  persist(
    set => ({
      settingsByWorkspace: {},
      updateSettings: (workspaceId, newSettings) =>
        set(state => {
          const currentSettings = state.settingsByWorkspace[workspaceId] || { ...defaultSettings };
          return {
            settingsByWorkspace: {
              ...state.settingsByWorkspace,
              [workspaceId]: { ...currentSettings, ...newSettings },
            },
          };
        }),
      moveField: (workspaceId, field, from, to) =>
        set(state => {
          const currentSettings = state.settingsByWorkspace[workspaceId] || { ...defaultSettings };
          const newFields = { ...currentSettings.fields };

          // Xóa field khỏi nhóm cũ
          newFields[from] = newFields[from].filter(f => f !== field);
          // Thêm field vào nhóm mới
          newFields[to] = [...newFields[to], field];

          return {
            settingsByWorkspace: {
              ...state.settingsByWorkspace,
              [workspaceId]: {
                ...currentSettings,
                fields: newFields,
              },
            },
          };
        }),
      resetSettings: workspaceId =>
        set(state => ({
          settingsByWorkspace: {
            ...state.settingsByWorkspace,
            [workspaceId]: { ...defaultSettings },
          },
        })),
    }),
    {
      name: 'card-view-settings',
      partialize: state => ({ settingsByWorkspace: state.settingsByWorkspace }),
    },
  ),
);

// Custom hook để sử dụng trong components
export const useCardViewSettings = () => {
  // Lấy workspace hiện tại từ Zustand store
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;

  // Lấy settings của workspace hiện tại từ store
  const {
    settingsByWorkspace,
    updateSettings: storeUpdateSettings,
    moveField: storeMoveField,
    resetSettings: storeResetSettings,
  } = useCardViewSettingsStore();

  // Settings hiện tại hoặc mặc định nếu chưa có
  const settings = workspaceId
    ? settingsByWorkspace[workspaceId] || defaultSettings
    : defaultSettings;

  // Mutation để cập nhật settings lên server
  const { mutate } = useCustomMutation();

  // Fetch settings từ API khi component mount với workspaceId
  const { refetch } = useOne({
    resource: 'workspaces',
    id: workspaceId || '',
    queryOptions: {
      enabled: !!workspaceId,
      onSuccess: data => {
        if (data.data?.cardViewSettings) {
          storeUpdateSettings(workspaceId!, data.data.cardViewSettings);
        }
      },
    },
    meta: {
      fields: ['cardViewSettings'],
    },
  });

  // Refetch khi workspace thay đổi
  useEffect(() => {
    if (workspaceId) {
      refetch();
    }
  }, [workspaceId, refetch]);

  // Sync settings với server
  const syncSettings = useCallback(
    (newSettings: Partial<CardViewSettings> = {}) => {
      if (!workspaceId) return;

      const currentSettings = settingsByWorkspace[workspaceId] || defaultSettings;
      const updatedSettings = { ...currentSettings, ...newSettings };

      mutate({
        url: `/workspaces/${workspaceId}/card-view-settings`,
        method: 'put',
        values: updatedSettings,
      });
    },
    [workspaceId, settingsByWorkspace, mutate],
  );

  // Cập nhật settings và sync với server
  const updateSettings = useCallback(
    (newSettings: Partial<CardViewSettings>) => {
      if (!workspaceId) return;

      storeUpdateSettings(workspaceId, newSettings);
      syncSettings(newSettings);
    },
    [workspaceId, storeUpdateSettings, syncSettings],
  );

  // Di chuyển field giữa các nhóm và sync với server
  const moveField = useCallback(
    (field: CardField, from: keyof FieldGroups, to: keyof FieldGroups) => {
      if (!workspaceId) return;

      storeMoveField(workspaceId, field, from, to);
      syncSettings();
    },
    [workspaceId, storeMoveField, syncSettings],
  );

  // Reset settings và sync với server
  const resetSettings = useCallback(() => {
    if (!workspaceId) return;

    storeResetSettings(workspaceId);
    syncSettings(defaultSettings);
  }, [workspaceId, storeResetSettings, syncSettings]);

  return {
    settings,
    updateSettings,
    moveField,
    resetSettings,
    workspaceId,
  };
};
