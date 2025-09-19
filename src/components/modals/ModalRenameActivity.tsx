import { Modal, Input, message } from 'antd';
import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { ActivityService } from '@/services/api/activity';

const ModalRenameActivity = () => {
  const { data, isOpen, type, closeModal } = useModal();
  const { activity, updateLocalActivity } = data || {};
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (activity) {
      setNewName(activity.name);
    }
  }, [activity]);

  const handleOk = async () => {
    if (!newName.trim()) {
      message.error('Tên hoạt động không được để trống');
      return;
    }

    try {
      // OPTIMISTIC UPDATE: Cập nhật tên trong local state ngay lập tức
      if (updateLocalActivity) {
        updateLocalActivity(activity.id, { name: newName.trim() });
      }
      
      // API call trong background
      await ActivityService.updateActivity(activity.id, { name: newName.trim() } as any);
      
      closeModal();
    } catch (error) {
      // Rollback: Khôi phục tên cũ nếu API thất bại
      if (updateLocalActivity) {
        updateLocalActivity(activity.id, { name: activity.name });
      }
      message.error('Đổi tên thất bại');
    }
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
