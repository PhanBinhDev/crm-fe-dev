import { createContext, useState } from 'react';

type WorkspaceStore = {
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
};

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
