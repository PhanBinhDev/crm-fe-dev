import { useUpdate } from '@refinedev/core';
import { Input, Modal } from 'antd';
import { ColorPicker } from '../shared/ColorPicker';

interface ModalEditColumnProps {
  open: boolean;
  stageId: string;
  editTitle: string;
  color: string;
  isDirty: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  setEditTitle: (v: string) => void;
  setColor: (v: string) => void;
}

const ModalEditColumn = ({
  open,
  stageId,
  editTitle,
  color,
  isDirty,
  onCancel,
  onSuccess,
  setEditTitle,
  setColor,
}: ModalEditColumnProps) => {
  const { mutate: updateStage, isPending } = useUpdate();

  const handleOk = () => {
    updateStage(
      {
        resource: 'stages',
        id: stageId,
        values: { title: editTitle, color },
        mutationMode: 'optimistic',
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      width={380}
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>Chỉnh sửa cột</span>}
      onCancel={onCancel}
      onOk={handleOk}
      styles={{
        body: { padding: '10px 0' },
      }}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      centered
      confirmLoading={isPending}
      okButtonProps={{ disabled: !isDirty }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontWeight: 500,
              marginBottom: 6,
              display: 'block',
              fontSize: 13,
              color: '#888',
            }}
          >
            Tên cột
          </label>
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Nhập tên cột mới"
            maxLength={40}
            style={{
              fontSize: 14,
              borderRadius: 6,
              padding: '4px 8px',
            }}
            onPressEnter={handleOk}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label
            style={{
              fontWeight: 500,
              marginBottom: 6,
              fontSize: 13,
              color: '#888',
            }}
          >
            Màu sắc
          </label>
          <ColorPicker value={color} onChange={setColor} size={32} radius={6} showRealColor />
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditColumn;
