import type { IUser } from '@/common/types';
import { paginationConfigOptions } from '@/config/pagination';
import { getUserRoleLabel } from '@/utils';
import { Badge, Table, type TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { FC } from 'react';
import { UserRowActions } from './UserRowActions';

interface UserTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
}

export const UserTable: FC<UserTableProps> = ({ tableProps, onPageSizeChange }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

  const columns: ColumnType<IUser>[] = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'stt',
      align: 'center',
      render: (_: any, __: any, index: number) => (
        <span
          style={{
            display: 'inline-block',
            minWidth: 40,
            maxWidth: 80,
            textAlign: 'center',
          }}
        >
          {index + 1}
        </span>
      ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      align: 'center',
      width: 180,
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Hoạt động' : 'Vô hiệu hoá'}
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
    },

    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      sorter: true,
      render: (_: string, record: IUser) => getUserRoleLabel(record.role) || '-',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major',
      render: (major: string) => major || '-',
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
