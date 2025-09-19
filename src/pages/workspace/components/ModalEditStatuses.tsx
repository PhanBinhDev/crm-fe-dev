import { Modal } from "antd";
import { StageSettings } from "@/pages/workspaces/components/settings/stages/StageSettings";

interface ModalEditStatusesProps {
  open: boolean;
  onCancel: () => void;
}

const ModalEditStatuses = ({ open, onCancel }: ModalEditStatusesProps) => {
  return (
    <Modal
    //   title="Chỉnh sửa trạng thái"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={550}
      destroyOnClose
    >
      <StageSettings />
    </Modal>
  );
};

export default ModalEditStatuses;
