import { MemberRole } from '@/common/enum/workspace';
import type { IMember } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import { paginationConfigOptions } from '@/config/pagination';
import { getWorkspaceRoleLabel } from '@/utils/workspace';
import { Space, Table, Typography, type TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { FC } from 'react';
import MemberRowAction from './MemberRowAction';

interface MemberTableProps {
  tableProps: TableProps<any>;
  currentMemberUser: IMember;
  tab: 'active' | 'invited';
  onPageSizeChange?: (size: number) => void;
}

export const MemberTable: FC<MemberTableProps> = ({
  tableProps,
  currentMemberUser,
  onPageSizeChange,
  tab,
}) => {
  const paginationConfig = paginationConfigOptions(tableProps, onPageSizeChange);

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
      dataIndex: 'name',
      sorter: true,
      render: (_: string, record: IMember) => {
        return (
          <Space align="center">
            <CustomAvatar name={record.user.name} src={record.user.avatar} size={30} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text strong style={{ color: '#222' }}>
                {record.user?.name || '-'}
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
      align: 'center',
      render: (_: string, record: IMember) => {
        const role = record.role;
        type Variant = { bg: string; color: string; ring?: string | undefined };
        const variants: Partial<Record<MemberRole, Variant>> & { default: Variant } = {
          [MemberRole.OWNER]: {
            bg: '#e6fff3',
            color: '#1f9d66',
            ring: '0 0 0 1px rgba(31,157,102,0.08)',
          },
          [MemberRole.ADMIN]: {
            bg: '#e6f7ff',
            color: '#165ed8',
            ring: '0 0 0 1px rgba(22,94,216,0.06)',
          },
          default: { bg: '#f5f5f6', color: '#666666', ring: undefined },
        };
        const v = variants[role] ?? variants.default;

        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 10px',
              background: v.bg,
              color: v.color,
              borderRadius: 7,
              fontWeight: 700,
              fontSize: 12,
              minWidth: 64,
              boxShadow: v.ring,
              textTransform: 'capitalize',
            }}
          >
            {getWorkspaceRoleLabel(role) || '-'}
          </div>
        );
      },
    },
    {
      title: tab === 'active' ? 'Ngày tham gia' : 'Ngày mời',
      dataIndex: 'createdAt',
      width: 200,
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY') || '-',
    },
    {
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_: any, record: IMember) => (
        <MemberRowAction member={record} currentMemberUser={currentMemberUser} tab={tab} />
      ),
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
    />
  );
};
