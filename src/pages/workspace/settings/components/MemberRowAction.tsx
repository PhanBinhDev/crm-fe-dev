import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useCustomMutation, useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import {
  IconBrightnessAuto,
  IconDots,
  IconLogout,
  IconTransfer,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Dropdown, MenuProps, message, Modal } from 'antd';
import { FC } from 'react';

interface MemberRowActionsProps {
  member: ExtendedMember;
}
interface ExtendedMember extends IMember {
  name?: string;
  workspaceId: string;
  currentUserRole?: string;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ member }) => {
  const { currentWorkspace } = useWorkspaces();
  const currentWorkspaceId = currentWorkspace?.id;
  const { user } = useAuth();
  const invalidate = useInvalidate();
  const { mutate: deleteMember } = useDelete();
  const { mutate: updateMember } = useUpdate();
  const { mutate: customRequest } = useCustomMutation();
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

  const handleTransferOwnership = (newOwnerId: string) => {
    Modal.confirm({
      title: 'Xác nhận chuyển quyền sở hữu',
      content: `Bạn có chắc chắn muốn chuyển quyền sở hữu workspace này cho ${
        member.name || 'thành viên này'
      } không?`,
      okText: 'Chuyển quyền',
      cancelText: 'Huỷ',
      onOk: () => {
        const hide = message.loading('Đang chuyển quyền sở hữu...', 0);
        customRequest(
          {
            url: `/workspaces/${member.workspaceId}/transfer-ownership`,
            method: 'patch',
            values: { newOwnerId },
          },
          {
            onSuccess: () => {
              hide();
              invalidate({
                resource: `workspaces/${member.workspaceId}/members`,
                invalidates: ['list', 'detail', 'many'],
              });
              message.success('Chuyển quyền sở hữu thành công');
            },
            onError: () => {
              hide();
              message.error('Chuyển quyền sở hữu thất bại');
            },
          },
        );
      },
    });
  };
  const handleLeaveWorkspace = () => {
    // rời khỏi workspace đang gặp vấn đề về BE đợi BE check
    Modal.confirm({
      title: 'Rời khỏi workspace',
      content: 'Bạn có chắc muốn rời khỏi workspace này không?',
      okText: 'Rời khỏi',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => {
        const hide = message.loading('Đang rời khỏi workspace...', 0);
        customRequest(
          {
            url: `/workspaces/${member.workspaceId}/leave`,
            method: 'post',
            values: {},
            meta: { custom: true },
          },
          {
            onSuccess: () => {
              hide();
              setTimeout(() => (window.location.href = '/'), 800);
            },
            onError: error => {
              hide();
              console.error(error);
            },
          },
        );
      },
    });
  };

  const isCurrentOwner = member.currentUserRole === MemberRole.OWNER;
  const isCurrentAdmin = member.currentUserRole === MemberRole.ADMIN;
  const isCurrentMember = member.currentUserRole === MemberRole.MEMBER;
  const isOwnerRow = member.role === MemberRole.OWNER;
  const isMemberRow = member.role === MemberRole.MEMBER;
  const isCurrentUserRow = member.id === user?.id;
  const menuItems: MenuProps['items'] = [];
  if (isCurrentOwner && !isOwnerRow) {
    menuItems.push({
      key: `transfer-${member.id}`,
      icon: <IconTransfer color="#52c41a" size={18} />,
      label: 'Chuyển quyền sở hữu',
      onClick: () => handleTransferOwnership(member.id),
    });
    menuItems.push({
      key: `role-${member.id}`,
      icon: <IconBrightnessAuto color="#1890ff" size={18} />,
      label: member.role === MemberRole.MEMBER ? 'Đặt vai trò Admin' : 'Đặt vai trò Thành viên',
      onClick: () =>
        handleChangeRoleMember(
          member.id,
          member.role === MemberRole.MEMBER ? MemberRole.ADMIN : MemberRole.MEMBER,
        ),
    });
    if (!isCurrentUserRow) {
      menuItems.push({
        key: `delete-${member.id}`,
        icon: <IconTrash color="#ff4d4f" size={18} />,
        label: 'Xoá thành viên',
        onClick: () => handleDeleteMember(member.id),
      });
    }
  }
  if (isCurrentAdmin) {
    if (isMemberRow && !isCurrentUserRow) {
      menuItems.push({
        key: `delete-${member.id}`,
        icon: <IconTrash color="#ff4d4f" size={18} />,
        label: 'Xoá thành viên',
        onClick: () => handleDeleteMember(member.id),
      });
    }
    if (isCurrentUserRow) {
      menuItems.push({
        key: `leave-${member.id}`,
        icon: <IconLogout color="#fa8c16" size={18} />,
        label: 'Rời khỏi Workspace',
        onClick: handleLeaveWorkspace,
      });
    }
  }
  if (isCurrentMember && isCurrentUserRow) {
    menuItems.push({
      key: `leave-${member.id}`,
      icon: <IconLogout color="#fa8c16" size={18} />,
      label: 'Rời khỏi Workspace',
      onClick: handleLeaveWorkspace,
    });
  }

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="text" icon={<IconDots size={18} />} />
      </Dropdown>
    </>
  );
};
