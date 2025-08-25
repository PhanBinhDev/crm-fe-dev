import { useWorkspaces } from '@/hooks/useWorkspaces';

const workspaceOptions = [
  { label: 'Workspace 1', value: 'workspace-1' },
  { label: 'Workspace 2', value: 'workspace-2' },
  { label: 'Workspace 3', value: 'workspace-3' },
];

const KanbanWorkspaces = () => {
  const { workspaceId } = useWorkspaces();

  return (
    <div>
      {workspaceId && (
        <div>
          <h3>Bạn đang ở: {workspaceOptions.find(w => w.value === workspaceId)?.label}</h3>
          {/* Hiển thị Kanban của workspace */}
        </div>
      )}
    </div>
  );
};

export default KanbanWorkspaces;
