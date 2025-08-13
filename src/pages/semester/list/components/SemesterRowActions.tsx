import { FC } from 'react';
import { Dropdown, Button, MenuProps } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ISemester } from '@/common/types/semester';


interface SemesterRowActionsProps {
  semester: ISemester;
}

export const SemesterRowActions: FC<SemesterRowActionsProps> = ({ semester }) => {
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = [
    // {
    //   key: 'view',
    //   icon: <EyeOutlined />,
    //   label: 'Xem chi tiết',
    //   onClick: () => navigate(`/semesters/show/${semester.id}`),
    // },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => navigate(`/semesters/edit/${semester.id}`),
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'delete',
    //   icon: <DeleteOutlined />,
    //   danger: true,
    //   label: 'Xóa kỳ học',
    //   onClick: () => {
    //     // TODO: Implement delete semester
    //     console.log('Delete semester:', semester.id);
    //   },
    // },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};
