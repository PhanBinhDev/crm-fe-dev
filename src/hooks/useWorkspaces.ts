import { WorkspaceContext } from '@/contexts/workspaces';
import { useContext } from 'react';

export const useWorkspaces = () => useContext(WorkspaceContext);
