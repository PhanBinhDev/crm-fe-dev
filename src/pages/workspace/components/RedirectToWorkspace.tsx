import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Navigate } from 'react-router-dom';

const RedirectToWorkspace = () => {
  const { currentWorkspace, isLoading, workspaces } = useWorkspaces();

  // Show loading state while fetching workspaces
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If there's a current workspace, redirect to it
  if (currentWorkspace) {
    return <Navigate to={`/workspaces/${currentWorkspace.id}`} replace />;
  }

  // If we have workspaces but no current one, redirect to the first one
  if (workspaces.length > 0) {
    return <Navigate to={`/workspaces/${workspaces[0].id}`} replace />;
  }

  // If no workspaces are available
  return <div>No workspaces found. Please create one first.</div>;
};

export default RedirectToWorkspace;
