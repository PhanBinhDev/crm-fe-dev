import ModalAddActivity from './ModalAddActivity';
import ModalAddWorkspace from './ModalAddWorkspace';
import ModalEditActivity from './ModalEditActivity';
import ModalRenameActivity from './ModalRenameActivity';

const Modals = () => {
  return (
    <>
      <ModalAddWorkspace />
      <ModalAddActivity />
      <ModalEditActivity />
      <ModalRenameActivity />
    </>
  );
};

export default Modals;
