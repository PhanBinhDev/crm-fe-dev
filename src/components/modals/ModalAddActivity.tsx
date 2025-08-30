import { useModal } from '@/hooks/useModal';
import { Modal } from 'antd';

const ModalAddActivity = () => {
  const { isOpen, type, data, closeModal } = useModal();

  const isOpenModal = isOpen && type === 'ModalAddActivity';

  const { stageId } = data ?? {};

  return (
    <Modal
      title="Thêm hoạt động"
      open={isOpenModal}
      onCancel={closeModal}
      onOk={() => {}}
      destroyOnHidden
      width={700}
    >
      Hello {stageId}
    </Modal>
  );
};

export default ModalAddActivity;
