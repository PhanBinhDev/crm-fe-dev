import { useWorkspace } from '@/hooks/useWorkspace';
import { Select } from 'antd';

export const WorkspaceSelector = ({
  workspaces,
}: {
  workspaces: { id: string; name: string }[];
}) => {
  const { workspaceId, setWorkspaceId } = useWorkspace();
  return (
    <Select
      value={workspaceId}
      onChange={setWorkspaceId}
      style={{ width: 200 }}
      options={workspaces.map(ws => ({ value: ws.id, label: ws.name }))}
      placeholder="Chọn workspace"
    />
  );
};
