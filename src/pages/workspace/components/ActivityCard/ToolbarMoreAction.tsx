import { IActivity } from '@/common/types';
import { IconCopy, IconPlus, IconTrash, IconPencil, IconDots } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, Tooltip, Modal, message } from 'antd';
import { useState } from 'react';
import { useInvalidate } from '@refinedev/core';
import { useModal } from '@/hooks/useModal';
import { ActivityService } from '@/services/api/activity';
import { useKanbanContext } from '@/contexts/kanban/KanbanContext';

interface ToolbarMoreActionProps {
  activity: IActivity;
}

const ToolbarMoreAction = ({ activity }: ToolbarMoreActionProps) => {
  const [open, setOpen] = useState(false);

  const invalidate = useInvalidate();
  const { openModal } = useModal();
  
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


  const handleDuplicate = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await ActivityService.duplicateActivity(activity.id);
      invalidate({
        resource: 'activities',
        invalidates: ['list', 'detail', 'many'],
      });
      
      // Invalidate stages để refresh kanban columns
      invalidate({
        resource: 'stages',
        invalidates: ['list'],
      });
      setOpen(false);
    } catch (error) {
      message.error('Nhân bản thất bại');
    }
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
      onOk: async () => {
        try {
          await ActivityService.deleteActivity(activity.id);
          invalidate({
            resource: 'activities',
            invalidates: ['list', 'detail', 'many'],
          });
          
          // Invalidate stages để refresh kanban columns
          invalidate({
            resource: 'stages',
            invalidates: ['list'],
          });
        } catch (error) {
          message.error('Xóa thất bại');
        }
      },
    });
    setOpen(false);
  };

  const handleCreateSubtask = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      // Lấy thông tin activity hiện tại để tạo subtask
      const parentActivity = await ActivityService.getActivity(activity.id);
      
      // Tạo subtask với parentId
      const subtaskData = {
        name: `Subtask của ${activity.name}`,
        type: parentActivity.data.type,
        stageId: parentActivity.data.stageId,
        parentId: activity.id,
        description: `Hoạt động phụ của: ${activity.name}`,
      };
      
      await ActivityService.createActivity(subtaskData);
      invalidate({
        resource: 'activities',
        invalidates: ['list', 'detail', 'many'],
      });
      
      // Invalidate stages để refresh kanban columns
      invalidate({
        resource: 'stages',
        invalidates: ['list'],
      });
      setOpen(false);
    } catch (error) {
      message.error('Tạo hoạt động phụ thất bại');
    }
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
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Dropdown>
      </div>

    </>
  );
};

export default ToolbarMoreAction;
