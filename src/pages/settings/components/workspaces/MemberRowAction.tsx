import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import {
  IconDots,
  IconMailOff,
  IconShield,
  IconUser,
  IconUserCheck,
  IconUserMinus,
  IconUserX,
} from '@tabler/icons-react';
import { Button, Popover, Space } from 'antd';
import { useMemo } from 'react';

interface MemberRowActionProps {
  member: IMember;
  currentMemberUser: IMember;
  tab: 'active' | 'invited';
}

const MemberRowAction = ({ member, currentMemberUser, tab }: MemberRowActionProps) => {
  const menu = useMemo(() => {
    const items = [];
    const isCurrentUser = member.user.id === currentMemberUser?.user?.id;
    const currentRole = currentMemberUser?.role;
    const memberRole = member.role;

    if (tab === 'invited') {
      console.log('Current Role:', currentRole, 'Member Role:', memberRole);
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
          onClick: () => {},
        });
      }

      if (currentRole === MemberRole.OWNER && memberRole === MemberRole.ADMIN) {
        items.push({
          key: 'demote',
          label: 'Hạ cấp thành viên',
          icon: <IconUser size={16} />,
          onClick: () => {},
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
          onClick: () => {},
        });
      }

      if (isCurrentUser && memberRole !== MemberRole.OWNER) {
        items.push({
          key: 'leave',
          label: 'Rời workspace',
          icon: <IconUserMinus size={16} />,
          danger: true,
          onClick: () => {},
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
      />
    </Popover>
  );
};

export default MemberRowAction;
