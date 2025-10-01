import { MemberRole } from '@/common/enum/workspace';
import { IMember } from '@/common/types';
import { IconBrightnessAuto, IconDots, IconTrash } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps } from 'antd';
import { FC } from 'react';

interface MemberRowActionsProps {
  member: IMember;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ member }) => {
  console.log('member', member);
  const menuItems: MenuProps['items'] = [
    {
      key: `admin-${member.id}`,
      icon: <IconBrightnessAuto color="#1890ff" size={18} />,
      label: member.role === MemberRole.MEMBER ? 'Đặt vai trò Admin' : 'Đặt vai trò là thành viên',
      onClick: () => {
        console.log(`Change role of member ${member.id}`);
      },
    },
    {
      key: `delete-${member.id}`,
      icon: <IconTrash color="#ff4d4f" size={18} />,
      label: 'Xoá thành viên',
      onClick: () => {
        console.log(member.id);
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
