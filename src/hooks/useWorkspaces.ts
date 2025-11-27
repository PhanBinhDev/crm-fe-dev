import { IWorkspace } from '@/common/types';
import { useCustomMutation, useInvalidate, useList } from '@refinedev/core';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create } from 'zustand';
import { useAuth } from './useAuth';

interface WorkspaceState {
  workspaces: IWorkspace[];
  currentWorkspace: IWorkspace | null;
  isLoading: boolean;
  switchWorkspace: (id: string) => void;
  setWorkspaces: (workspaces: IWorkspace[]) => void;
  setCurrentWorkspace: (workspace: IWorkspace | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>(set => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  switchWorkspace: (id: string) => {
    set(state => {
      const workspace = state.workspaces.find(w => w.id === id);
      if (workspace) {
        localStorage.setItem('lastWorkspaceId', id);
        return { ...state, currentWorkspace: workspace };
      }
      return state;
    });
  },
  setWorkspaces: (workspaces: IWorkspace[]) => set({ workspaces }),
  setCurrentWorkspace: (workspace: IWorkspace | null) => set({ currentWorkspace: workspace }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const useWorkspaces = () => {
  const {
    workspaces,
    currentWorkspace,
    isLoading,
    switchWorkspace,
    setWorkspaces,
    setCurrentWorkspace,
    setLoading,
  } = useWorkspaceStore();
  const navigate = useNavigate();
  const params = useParams();
  const workspaceIdFromUrl = params.workspaceId;

  const { user: identity } = useAuth();

  const {
    data,
    isLoading: fetchLoading,
    refetch,
  } = useList<IWorkspace>({
    resource: 'workspaces',
    pagination: {
      mode: 'off',
    },
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  // Refresh workspaces
  const refreshWorkspaces = () => {
    refetch();
  };

  const handleSwitchWorkspace = (id: string) => {
    switchWorkspace(id);
    navigate(`/workspaces/${id}`);
  };

  useEffect(() => {
    setLoading(fetchLoading);

    if (data?.data) {
      setWorkspaces(data.data);
    }
  }, [data, fetchLoading, setLoading, setWorkspaces]);

  useEffect(() => {
    if (!isLoading && workspaces.length > 0) {
      if (workspaceIdFromUrl) {
        const workspace = workspaces.find(w => w.id === workspaceIdFromUrl);
        if (workspace) {
          setCurrentWorkspace(workspace);
          localStorage.setItem('lastWorkspaceId', workspaceIdFromUrl);
          return;
        }
      }

      const lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
      if (lastWorkspaceId) {
        const workspace = workspaces.find(w => w.id === lastWorkspaceId);
        if (workspace) {
          setCurrentWorkspace(workspace);
          return;
        }
      }

      if (workspaces[0]) {
        setCurrentWorkspace(workspaces[0]);
        localStorage.setItem('lastWorkspaceId', workspaces[0].id);
      }
    }
  }, [workspaces, isLoading, workspaceIdFromUrl, setCurrentWorkspace]);

  return {
    workspaces,
    currentWorkspace,
    isLoading,
    switchWorkspace: handleSwitchWorkspace,
    refreshWorkspaces,
  };
};

export const useInvitationHandlers = () => {
  const invalidate = useInvalidate();
  const { mutate: acceptInvitation } = useCustomMutation();
  const { mutate: rejectInvitation } = useCustomMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [hiddenWorkspaceIds, setHiddenWorkspaceIds] = useState<Set<string>>(new Set());

  const handleRejectInvitation = (workspaceId: string) => {
    setHiddenWorkspaceIds(prev => new Set(prev).add(workspaceId));
    setRejectingId(workspaceId);

    rejectInvitation(
      {
        method: 'post',
        url: `workspaces/${workspaceId}/reject-invitation`,
        values: {},
      },
      {
        onSuccess: () => {
          message.success('Đã từ chối lời mời');
          invalidate({ resource: 'workspaces/invitations', invalidates: ['list'] });
        },
        onError: error => {
          message.error('Không thể từ chối lời mời');
          console.log({
            workspaceId,
            status: error?.response?.status,
            data: error?.response?.data,
            url: `workspaces/${workspaceId}/reject-invitation`,
          });
          setHiddenWorkspaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(workspaceId);
            return newSet;
          });
        },
        onSettled: () => {
          setRejectingId(null);
        },
      },
    );
  };

  const handleAcceptInvitation = (workspaceId: string) => {
    setHiddenWorkspaceIds(prev => new Set(prev).add(workspaceId));
    setLoadingId(workspaceId);

    acceptInvitation(
      {
        method: 'post',
        url: `workspaces/${workspaceId}/accept-invitation`,
        values: {},
      },
      {
        onSuccess: () => {
          message.success('Đã chấp nhận lời mời');

          invalidate({ resource: 'workspaces/invitations', invalidates: ['list'] });
          invalidate({ resource: 'workspaces', invalidates: ['list'] });
        },
        onError: () => {
          message.error('Không thể chấp nhận lời mời');
          setHiddenWorkspaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(workspaceId);
            return newSet;
          });
        },
        onSettled: () => {
          setLoadingId(null);
        },
      },
    );
  };

  return {
    handleAcceptInvitation,
    handleRejectInvitation,
    loadingId,
    rejectingId,
    hiddenWorkspaceIds,
    setHiddenWorkspaceIds,
  };
};
