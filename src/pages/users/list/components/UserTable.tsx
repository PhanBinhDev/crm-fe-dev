import { FC } from 'react';
import { Table, Tag } from 'antd';
import type { IUser } from '@/common/types';
import { Avatar, type TableProps } from 'antd';
import { userRoleFilterOptions, userStatusColumnFilters } from '@/constants/user';
import { UserRole } from '@/common/enum/user';
import { ColumnType } from 'antd/lib/table';
import { paginationConfigOptions } from '@/config/pagination';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { UserRowActions } from './UserRowActions';

interface UserTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
  onUserUpdated?: () => void; // Callback to refresh user list
}

export const UserTable: FC<UserTableProps> = ({ tableProps, onPageSizeChange, onUserUpdated }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

  const columns: ColumnType<IUser>[] = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      render: (avatar: string, record: IUser) => (
        <Avatar src={avatar || AVATAR_PLACEHOLDER} size={40} onError={() => false}>
          {(record.name || 'U').charAt(0).toUpperCase()}
        </Avatar>
      ),
      width: 80,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      sorter: true,
      render: (_: string, record: IUser) => `${record.name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      filters: userRoleFilterOptions,
      render: (role: UserRole) => (
        <Tag color={role === 'TM' ? 'blue' : 'default'}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      filters: userStatusColumnFilters,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_: any, record: IUser) => (
        <UserRowActions user={record} onUserUpdated={onUserUpdated} />
      ),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      rowKey="id"
      scroll={{ x: 1000 }}
      pagination={paginationConfig}
    />
  );
};
