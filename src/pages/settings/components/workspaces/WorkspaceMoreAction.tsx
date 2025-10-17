import { IMember, IWorkspace } from '@/common/types';
import { useList } from '@refinedev/core';
import { IconDotsVertical } from '@tabler/icons-react';
import { Button } from 'antd';
interface IWorkspaceMoreActionProps {
  workspace: IWorkspace;
}

const WorkspaceMoreAction = ({ workspace }: IWorkspaceMoreActionProps) => {
  const { data: members } = useList<IMember>({
    resource: `workspaces/${workspace.id}/members`,
  });

  return (
    <Button
      type="text"
      icon={<IconDotsVertical size={14} color="#333" />}
      style={{
        borderRadius: 8,
      }}
      styles={{
        icon: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    />
  );
};

export default WorkspaceMoreAction;
