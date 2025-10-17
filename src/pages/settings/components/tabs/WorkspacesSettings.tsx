import InvitationList from '@/pages/settings/components/workspaces/InvitationList';
import WorkspacesList from '@/pages/settings/components/workspaces/WorkspaceList';
import { useMediaQuery } from 'usehooks-ts';

const WorkspacesSettings = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        width: '100%',
        height: '100%',
        alignItems: 'flex-start',
        padding: 12,
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      <WorkspacesList />
      <InvitationList />
    </div>
  );
};

export default WorkspacesSettings;
