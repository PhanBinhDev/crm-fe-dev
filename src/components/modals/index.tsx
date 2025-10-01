import ModalAddActivity from './ModalAddActivity';
import ModalAddWorkspace from './ModalAddWorkspace';
import ModalEditActivity from './ModalEditActivity';
import ModalRenameActivity from './ModalRenameActivity';
import WorkspaceShareModal from './WorkspaceShareModal';

const Modals = () => {
  return (
    <>
      <ModalAddWorkspace />
      <ModalAddActivity />
      <ModalEditActivity />
      <ModalRenameActivity />
      <WorkspaceShareModal />
    </>
  );
};

export default Modals;
