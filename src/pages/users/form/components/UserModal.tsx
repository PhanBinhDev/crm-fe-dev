import { useModal } from '@/hooks/useModal';
import { Modal } from 'antd';

const UserModal = () => {
  const { isOpen, type, closeModal } = useModal();

  const isOpenModal = type === 'ModalUserForm' && isOpen;

  return <Modal open={isOpenModal} destroyOnHidden onCancel={closeModal}></Modal>;
};

export default UserModal;
