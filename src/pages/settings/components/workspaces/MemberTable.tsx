import { MemberRole } from '@/common/enum/workspace';
import type { IMember } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import { paginationConfigOptions } from '@/config/pagination';
import { useAuth } from '@/hooks/useAuth';
import { getWorkspaceRoleLabel } from '@/utils/workspace';
import { Space, Table, Tag, Typography, type TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { FC } from 'react';
import { MemberRowActions } from './MemberRowAction';

interface MemberTableProps {
  tableProps: TableProps<any>;
  onPageSizeChange?: (size: number) => void;
}

export const MemberTable: FC<MemberTableProps> = ({ tableProps, onPageSizeChange }) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);
  const currentUser = useAuth();

  const columns: ColumnType<IMember>[] = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'stt',
      align: 'center',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'user.name',
      sorter: true,
      render: (_: string, record: IMember) => {
        return (
          <Space align="center">
            <CustomAvatar name={record.user.name} src={record.user.avatar} size={30} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text strong style={{ color: '#222' }}>
                {record.user?.name}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.user?.email}
              </Typography.Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      sorter: false,
      width: 120,
      render: (_: string, record: IMember) => {
        const role = record.role;
        const color =
          role === MemberRole.OWNER ? 'gold' : role === MemberRole.ADMIN ? 'blue' : 'default';
        return (
          <Tag color={color} style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {getWorkspaceRoleLabel(role) || '-'}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 200,
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY') || '-',
    },
    {
      key: 'actions',
      width: 50,
      align: 'center',

      title: 'Hành động',
      fixed: 'right',
      render: (_: any, record: IMember) => {
        const currentMember = (tableProps.dataSource as IMember[] | undefined)?.find(
          m => m.user?.id === currentUser?.user?.id,
        );

        if (currentMember?.role === MemberRole.OWNER) {
          if (record.role !== MemberRole.OWNER) return <MemberRowActions member={record} />;
          return null;
        }

        if (record.role === MemberRole.OWNER) return null;

        const currentIsAdmin = currentMember?.role === MemberRole.ADMIN;

        if (currentIsAdmin) {
          if (record.user.id === currentUser?.user?.id) return <MemberRowActions member={record} />;
          if (record.role !== MemberRole.ADMIN) return <MemberRowActions member={record} />;
          return null;
        }

        if (record.user.id === currentUser?.user?.id && record.role === MemberRole.MEMBER)
          return <MemberRowActions member={record} />;

        return null;
      },
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      rowKey="id"
      scroll={{
        x: 1000,
        y: 300,
      }}
      pagination={paginationConfig}
      bordered
      style={{
        height: '100%',
      }}
      rowHoverable={false}
      size="small"
      footer={() => `Tổng số thành viên: ${tableProps.dataSource?.length}`}
    />
  );
};
