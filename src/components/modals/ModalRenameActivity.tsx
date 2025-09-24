import { Modal, Input, message } from 'antd';
import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { useActivityActions } from '@/hooks/useActivityActions';

const ModalRenameActivity = () => {
  const { data, isOpen, type, closeModal } = useModal();
  const { activity, updateLocalActivity } = data || {};
  const [newName, setNewName] = useState('');
  const { renameActivity } = useActivityActions();

  useEffect(() => {
    if (activity) {
      setNewName(activity.name);
    }
  }, [activity]);

  const handleOk = () => {
    if (!newName.trim()) {
      message.error('Tên hoạt động không được để trống');
      return;
    }

    renameActivity(activity, newName.trim(), updateLocalActivity);
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  if (!activity || !isOpen || type !== 'ModalRenameActivity') return null;

  return (
    <Modal
      title="Đổi tên hoạt động"
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Hủy"
      maskClosable={true}
      destroyOnClose
    >
      <Input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Nhập tên mới cho hoạt động"
        onPressEnter={handleOk}
        autoFocus
      />
    </Modal>
  );
};

export default ModalRenameActivity;
