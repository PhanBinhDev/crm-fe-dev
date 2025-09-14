import { IWorkspace } from '@/common/types';
import { useList } from '@refinedev/core';
import { useEffect } from 'react';
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
