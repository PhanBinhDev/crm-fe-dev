import { IUser } from '@/common/types';
import { IconBrightnessAuto, IconDots, IconTrash } from '@tabler/icons-react';
import { Button, Dropdown, MenuProps } from 'antd';
import { FC } from 'react';

interface MemberRowActionsProps {
  member: IUser;
}

export const MemberRowActions: FC<MemberRowActionsProps> = ({ member }) => {
  console.log('member', member);
  const menuItems: MenuProps['items'] = [
    {
      key: `admin-${member.id}`,
      icon: <IconBrightnessAuto size={18} />,
      label: 'Đặt vai trò Admin',
      // onClick: () =>
    },
    {
      key: `delete-${member.id}`,
      icon: <IconTrash size={18} />,
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
