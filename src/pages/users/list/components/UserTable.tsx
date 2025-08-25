import { FC } from 'react';
import { Badge, Table, Tag, Tooltip } from 'antd';
import type { IUser } from '@/common/types';
import { Avatar, type TableProps } from 'antd';
import { userRoleFilterOptions, userStatusColumnFilters } from '@/constants/user';
import { UserRole } from '@/common/enum/user';
import { ColumnType } from 'antd/lib/table';
import { paginationConfigOptions } from '@/config/pagination';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { UserRowActions } from './UserRowActions';
import { getUserRoleColor, getUserRoleLabel } from '@/utils';

interface UserTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
}

export const UserTable: FC<UserTableProps> = ({ tableProps, onPageSizeChange }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

  const columns: ColumnType<IUser>[] = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      render: (avatar: string, record: IUser) => (
        <Tooltip title={getUserRoleLabel(record.role)}>
          <Avatar
            src={avatar || AVATAR_PLACEHOLDER}
            size={40}
            style={{ border: '1px solid #eee', background: '#f6f6f6' }}
          >
            {(record.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      ),
      width: 80,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      align: 'center',
      width: 120,
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
          style={{
            fontSize: 14,
            padding: '2px 8px',
            borderRadius: 8,
            background: isActive ? '#f6ffed' : '#fff1f0',
            color: isActive ? '#389e0d' : '#cf1322',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      sorter: true,
      render: (_: string, record: IUser) => (
        <div>
          <span>{record.name}</span>
          {record.isActive === false && (
            <Tag color="error" style={{ marginLeft: 8, fontSize: 10 }}>
              Không hoạt động
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major',
      render: (major: string) => major || '-',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      render: (date: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : '-'),
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
      render: (_: any, record: IUser) => <UserRowActions user={record} />,
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
