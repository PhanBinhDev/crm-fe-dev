import { useModal } from '@/hooks/useModal';
import ModalAddActivity from './ModalAddActivity';
import ModalAddWorkspace from './ModalAddWorkspace';
import ModalEditActivity from './ModalEditActivity';
import ModalInviteMember from './ModalInviteMember';
import ModalRenameActivity from './ModalRenameActivity';
import WorkspaceShareModal from './WorkspaceShareModal';

const Modals = () => {
  const { isOpen, type } = useModal();

  const openModalEditActivity = isOpen && type === 'ModalEditActivity';

  if (!isOpen) return null;

  return (
    <>
      <ModalAddWorkspace />
      <ModalAddActivity />
      {openModalEditActivity && <ModalEditActivity />}
      <ModalRenameActivity />
      <WorkspaceShareModal />
    </>
  );
};

const ModalsDelays = () => {
  return (
    <>
      <ModalInviteMember />
    </>
  );
};

export { Modals, ModalsDelays };
