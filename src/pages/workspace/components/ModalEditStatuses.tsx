import { StageSettings } from '@/pages/workspaces/components/settings/stages/StageSettings';
import { Modal } from 'antd';

interface ModalEditStatusesProps {
  open: boolean;
  onCancel: () => void;
}

const ModalEditStatuses = ({ open, onCancel }: ModalEditStatusesProps) => {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={550} destroyOnHidden>
      <StageSettings />
    </Modal>
  );
};

export default ModalEditStatuses;
