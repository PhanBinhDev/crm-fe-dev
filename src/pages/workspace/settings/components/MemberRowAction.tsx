import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import { IconBrightnessAuto, IconDots, IconTrash } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, message, Modal } from 'antd';
import { FC } from 'react';

interface MemberRowActionsProps {
  member: IMember;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ member }) => {
  const { currentWorkspace } = useWorkspaces();
  const currentWorkspaceId = currentWorkspace?.id;

  const invalidate = useInvalidate();
  const { mutate: deleteMember, isLoading } = useDelete();
  const { mutate: updateMember } = useUpdate();
  const handleDeleteMember = (id: string) => {
    const hideLoading = message.loading('Đang xoá thành viên...', 0);
    deleteMember(
      {
        resource: `workspaces/${currentWorkspaceId}/members`,
        id: id,
      },
      {
        onSuccess: () => {
          hideLoading();
          invalidate({
            resource: `workspaces/${currentWorkspaceId}/members`,
            invalidates: ['list', 'detail', 'many'],
          });
          message.success('Xóa thành công');
        },
        onError: () => {
          hideLoading();
          message.error('Xóa thất bại');
        },
      },
    );
  };

  console.log(member);

  const handleChangeRoleMember = (id: string, role: MemberRole) => {
    const hideLoading = message.loading('Đang cập nhật vai trò thành viên...', 0);
    updateMember(
      {
        resource: `workspaces/${currentWorkspaceId}/members/${id}/role`,
        id: '',
        values: { role },
        meta: { custom: true },
      },
      {
        onSuccess: () => {
          hideLoading();
          invalidate({
            resource: `workspaces/${currentWorkspaceId}/members`,
            invalidates: ['list', 'detail', 'many'],
          });
          message.success('Cập nhật vai trò thành công');
        },
        onError: () => {
          hideLoading();
          message.error('Cập nhật vai trò thất bại');
        },
      },
    );
  };

  const menuItems: MenuProps['items'] = [
    {
      key: `admin-${member.id}`,
      icon: <IconBrightnessAuto color="#1890ff" size={18} />,
      label: member.role === MemberRole.MEMBER ? 'Đặt vai trò Admin' : 'Đặt vai trò là thành viên',
      onClick: () => {
        handleChangeRoleMember(
          member.id,
          member.role === MemberRole.MEMBER ? MemberRole.ADMIN : MemberRole.MEMBER,
        );
      },
    },
    {
      key: `delete-${member.id}`,
      icon: <IconTrash color="#ff4d4f" size={18} />,
      label: 'Xoá thành viên',
      onClick: () => {
        Modal.confirm({
          title: 'Xác nhận xoá thành viên',
          content: `Bạn có chắc chắn muốn xoá thành viên này khỏi không gian làm việc không?`,
          okText: 'Xoá',
          okType: 'danger',
          cancelText: 'Huỷ',
          okButtonProps: { loading: isLoading },
          onOk() {
            console.log(' hello');
            handleDeleteMember(member.id);
          },
        });
      },
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="text" icon={<IconDots size={18} />} />
      </Dropdown>
    </>
  );
};
