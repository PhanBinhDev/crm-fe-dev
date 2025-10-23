import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useCustomMutation, useDelete, useInvalidate, useUpdate } from '@refinedev/core';
import {
  IconDots,
  IconMailOff,
  IconShield,
  IconUser,
  IconUserCheck,
  IconUserMinus,
  IconUserX,
} from '@tabler/icons-react';
import { Button, message, Modal, Popover, Space } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

interface MemberRowActionProps {
  member: IMember;
  currentMemberUser: IMember;
  tab: 'active' | 'invited';
}

const MemberRowAction = ({ member, currentMemberUser, tab }: MemberRowActionProps) => {
  const { mutate: updateRoleMember } = useUpdate();
  const { mutate: leaveWorkspace } = useCustomMutation();
  const { mutate: deleteMember } = useDelete();

  const { workspaceId } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  // Api workspaces/wsId/members/me đang thiếu field user nên dùng tạm
  const currentUser = useAuth();

  const menu = useMemo(() => {
    const items = [];
    const isCurrentUser = member.user.id === currentUser?.user?.id;
    const currentRole = currentMemberUser?.role;
    const memberRole = member.role;

    if (tab === 'invited') {
      if (
        currentRole === MemberRole.OWNER ||
        (currentRole === MemberRole.ADMIN && memberRole !== MemberRole.ADMIN)
      ) {
        items.push({
          key: 'cancel-invite',
          label: 'Thu hồi lời mời',
          icon: <IconMailOff size={16} />,
          danger: true,
          onClick: () => handleCancelInvite(member),
        });

        items.push({
          key: 'resend-invite',
          label: 'Gửi lại lời mời',
          icon: <IconUserCheck size={16} />,
          onClick: () => handleResendInvite(member),
        });
      }
    } else {
      if (currentRole === MemberRole.OWNER && memberRole === MemberRole.MEMBER) {
        items.push({
          key: 'promote',
          label: 'Gán quản trị viên',
          icon: <IconShield size={16} />,
          onClick: () => handlePromoteOrDemoteMember('promote', member),
        });
      }

      if (currentRole === MemberRole.OWNER && memberRole === MemberRole.ADMIN) {
        items.push({
          key: 'demote',
          label: 'Hạ cấp thành viên',
          icon: <IconUser size={16} />,
          onClick: () => handlePromoteOrDemoteMember('demote', member),
        });
      }

      if (
        !isCurrentUser &&
        ((currentRole === MemberRole.OWNER && memberRole !== MemberRole.OWNER) ||
          (currentRole === MemberRole.ADMIN && memberRole === MemberRole.MEMBER))
      ) {
        items.push({
          key: 'remove',
          label: 'Xóa khỏi workspace',
          icon: <IconUserX size={16} />,
          danger: true,
          onClick: () => handleRemoveOrLeaveWS('remove', member),
        });
      }

      if (isCurrentUser && memberRole !== MemberRole.OWNER) {
        items.push({
          key: 'leave',
          label: 'Rời workspace',
          icon: <IconUserMinus size={16} />,
          danger: true,
          onClick: () => handleRemoveOrLeaveWS('leave', member),
        });
      }
    }

    return items;
  }, [member, currentMemberUser, tab]);

  const handleCancelInvite = (member: IMember) => {
    console.log('Cancel invitation for:', member);
  };

  const handleResendInvite = (member: IMember) => {
    console.log('Resend invitation to:', member);
  };

  const invalidate = useInvalidate();

  const handlePromoteOrDemoteMember = (type: string, member: IMember) => {
    setIsOpen(false);
    const msg = type === 'promote' ? 'Gán quản trị viên' : 'Hạ cấp thành viên';
    const hideLoading = message.loading(`Đang ${msg}...`, 0);

    updateRoleMember(
      {
        resource: `workspaces/${workspaceId}/members/${member.user.id}/role`,
        id: '',
        values: { role: type === 'promote' ? 'admin' : 'member' },
      },
      {
        onSuccess: () => {
          hideLoading();
          message.success(`${msg} thành công!`);
          invalidate({
            resource: `workspaces/${workspaceId}/members`,
            invalidates: ['list', 'many'],
          });
        },
        onError: () => {
          hideLoading();
          message.error(`${msg} thất bại. Vui lòng thử lại sau!`);
        },
      },
    );
  };
  const handleRemoveOrLeaveWS = (type: string, member: IMember) => {
    setIsOpen(false);
    const isRemove = type === 'remove';
    const msg = isRemove ? 'Xóa khỏi workspace' : 'Rời workspace';

    Modal.confirm({
      title: `Xác nhận ${isRemove ? 'xóa' : 'rời'}`,
      content: `Bạn có chắc chắn muốn ${isRemove ? 'xóa thành viên' : 'rời workspace'} này?`,
      onOk() {
        const hideLoading = message.loading(`Đang ${msg}...`, 0);
        if (isRemove) {
          deleteMember(
            {
              resource: `workspaces/${workspaceId}/members/${member.user.id}`,
              id: '',
              values: {},
            },
            {
              onSuccess: () => {
                hideLoading();
                message.success(`${msg} thành công!`);
                invalidate({
                  resource: `workspaces/${workspaceId}/members`,
                  invalidates: ['list', 'many'],
                });
              },
              onError: () => {
                hideLoading();
                message.error(`${msg} thất bại. Vui lòng thử lại sau!`);
              },
            },
          );
        } else {
          leaveWorkspace(
            {
              url: `/workspaces/${workspaceId}/leave`,
              method: 'post',
              values: {},
            },
            {
              onSuccess: () => {
                hideLoading();
                message.success(`${msg} thành công!`);
                invalidate({
                  resource: `workspaces/${workspaceId}/members`,
                  invalidates: ['list', 'many'],
                });
              },
              onError: () => {
                hideLoading();
                message.error(`${msg} thất bại. Vui lòng thử lại sau!`);
              },
            },
          );
        }
      },
    });
  };

  const content = (
    <Space
      styles={{
        item: {
          width: '100%',
        },
      }}
      style={{
        width: '100%',
        gap: 4,
      }}
      direction="vertical"
    >
      {menu.map(item => (
        <Button
          size="small"
          key={item.key}
          type="text"
          style={{
            width: '100%',
            height: 30,
            justifyContent: 'flex-start',
            borderRadius: 7,
          }}
          icon={item.icon}
          styles={{
            icon: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}
          onClick={item.onClick}
        >
          {item.label}
        </Button>
      ))}
    </Space>
  );

  if (!menu.length) return null;

  return (
    <Popover
      trigger={['click']}
      content={content}
      open={isOpen}
      arrow={false}
      placement="leftBottom"
      styles={{
        body: {
          padding: 8,
          width: 180,
          borderRadius: 10,
        },
      }}
    >
      <Button
        icon={<IconDots size={16} color="#333" />}
        type="text"
        style={{
          padding: '4px 12px',
        }}
        styles={{
          icon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
        onClick={() => setIsOpen(true)}
      />
    </Popover>
  );
};

export default MemberRowAction;
