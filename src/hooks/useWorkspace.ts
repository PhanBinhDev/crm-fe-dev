import { WorkspaceContext } from '@/contexts/workspace';
import { useContext } from 'react';

export const useWorkspace = () => useContext(WorkspaceContext);
