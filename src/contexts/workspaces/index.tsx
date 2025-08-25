import { createContext, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WorkspaceStore = {
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    set => ({
      workspaceId: '',
      setWorkspaceId: (id: string) => set({ workspaceId: id }),
    }),
    {
      name: 'workspace-storage',
    },
  ),
);

export const WorkspaceContext = createContext<WorkspaceStore>({
  workspaceId: '',
  setWorkspaceId: (id: string) => {},
});

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [workspaceId, setWorkspaceId] = useState('');
  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
