import { IActivity } from '@/common/types';
import { IconCopy, IconPlus, IconTrash, IconPencil, IconDots } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, Tooltip, Modal } from 'antd';
import { useState } from 'react';
import { useModal } from '@/hooks/useModal';
import { useKanbanContext } from '@/contexts/kanban/KanbanContext';
import { useActivityActions } from '@/hooks/useActivityActions';

interface ToolbarMoreActionProps {
  activity: IActivity;
}

const ToolbarMoreAction = ({ activity }: ToolbarMoreActionProps) => {
  const [open, setOpen] = useState(false);

  const { openModal } = useModal();
  const { duplicateActivity, removeActivity, createSubtask } = useActivityActions();
  
  // Chỉ sử dụng context cho rename (optimistic update)
  let updateLocalActivity: any = null;
  try {
    const context = useKanbanContext();
    updateLocalActivity = context?.updateLocalActivity;
  } catch (error) {
    // Context không available, không làm gì
  }

  const handleRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
    // Sử dụng openModal để mở modal rename với callback
    const modalData: any = { activity };
    if (updateLocalActivity) {
      modalData.updateLocalActivity = updateLocalActivity;
    }
    openModal('ModalRenameActivity', modalData);
  };


  const handleDuplicate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
  
    duplicateActivity(activity);
    setOpen(false);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa hoạt động "${activity.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      maskClosable: true,
      onOk: () => {
        removeActivity(activity);
      },
    });
    setOpen(false);
  };

  const handleCreateSubtask = (e?: React.MouseEvent) => {
    e?.stopPropagation(); 
    createSubtask(activity);
    setOpen(false);
  };

  const items: MenuProps['items'] = [
    {
      key: 'subtask',
      label: 'Tạo hoạt động phụ',
      icon: <IconPlus size={16} style={{ verticalAlign: 'middle' }} />,
      onClick: () => handleCreateSubtask(),
    },
    {
      key: 'rename',
      label: 'Đổi tên',
      icon: <IconPencil size={16} style={{ verticalAlign: 'middle' }} />,
      onClick: () => handleRename(),
    },
    {
      key: 'duplicate',
      label: 'Nhân bản',
      icon: <IconCopy size={16} style={{ verticalAlign: 'middle' }} />,
      onClick: () => handleDuplicate(),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <IconTrash size={16} style={{ verticalAlign: 'middle' }} />,
      onClick: () => handleDelete(),
      danger: true,
    },
  ];

  return (
    <>
      <div
        onMouseDown={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          open={open}
          onOpenChange={setOpen}
          placement="bottomLeft"
          arrow={false}
        >
          <Tooltip title="Thao tác khác">
            <Button
              size="small"
              type="text"
              icon={<IconDots size={14} />}
              styles={{
                icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
              }}
              onClick={e => e.stopPropagation()}
            />
          </Tooltip>
        </Dropdown>
      </div>
    </>
  );
};

export default ToolbarMoreAction;
