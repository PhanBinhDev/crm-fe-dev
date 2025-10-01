import { MemberRole, MemberStatus } from '@/common/enum/workspace';
import { getWorkspaceRoleLabel } from '@/utils/workspace';
import { useGetIdentity, useList } from '@refinedev/core';
import { IconMailPlus, IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Select, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MemberRowActions } from './MemberRowAction';

interface Member {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: MemberRole;
  createdAt: string;
  status: MemberStatus;
}

const WorkspaceMember = () => {
  const [form] = Form.useForm();
  const [filterRole, setFilterRole] = useState<string>('');
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading } = useList<Member>({
    resource: `workspaces/${workspaceId}/members`,
  });

  const { data: identity } = useGetIdentity<{ id: string }>();

  const currentUserRole = (data?.data ?? []).find(m => m.user.id === identity?.id)?.role;

  const members = (data?.data ?? []).map((m, index) => ({
    index: index + 1,
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    status: m.status,
    // invitedBy: m.invitedBy,
    invitedAt: new Date(m.createdAt).toLocaleDateString(),
  }));

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return counts;
  }, [members]);

  const options = [
    { label: `Tất cả thành viên (${members.length})`, value: '' },
    ...(Object.keys(roleCounts) as MemberRole[]).map(role => ({
      label: `${getWorkspaceRoleLabel(role)} (${roleCounts[role]})`,
      value: role,
    })),
  ];

  const filteredMembers = filterRole ? members.filter(m => m.role === filterRole) : members;

  const baseColumns = [
    { title: 'STT', dataIndex: 'index', key: 'index', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (status: string) => {
        if (status === MemberRole.OWNER) return <p>Sở hữu</p>;
        if (status === MemberRole.MEMBER) return <p>Thành viên</p>;
        return <p>Admin</p>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === MemberStatus.ACTIVE) return <Tag color="green">Xác nhận</Tag>;
        if (status === MemberStatus.PENDING) return <Tag color="orange">Đang xử lý</Tag>;
        return <Tag color="red">Từ chối</Tag>;
      },
    },
    { title: 'Người mời', dataIndex: 'invitedBy', key: 'invitedBy' },
    { title: 'Ngày mời', dataIndex: 'invitedAt', key: 'invitedAt' },
  ];

  const columns =
    currentUserRole === 'owner'
      ? [
          ...baseColumns,
          {
            title: 'Thao tác',
            key: 'actions',
            width: 80,
            render: (_: any, record: any) =>
              record.role === 'owner' ? '' : <MemberRowActions member={record} />,
          },
        ]
      : baseColumns;

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: 10, fontSize: 25 }}>Quản lý thành viên</h2>

      <Form form={form} style={{ marginBottom: 10, width: '100%' }}>
        <Form.Item
          name="emails"
          rules={[{ required: true, message: 'Nhập email' }]}
          style={{ width: '100%', marginBottom: 0, position: 'relative' }}
        >
          <Input
            prefix={<IconMailPlus size={16} color="#bfbfbf" style={{ marginRight: 5 }} />}
            placeholder="Nhập email..."
            allowClear
            style={{ borderRadius: 8, padding: '10px 120px 10px 10px' }}
          />

          <Button
            type="primary"
            htmlType="submit"
            icon={<IconPlus size={15} />}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              zIndex: 10,
            }}
          >
            Thêm
          </Button>
        </Form.Item>
      </Form>

      <Select
        defaultValue=""
        style={{ marginBottom: 10 }}
        options={options}
        onChange={value => setFilterRole(value)}
      />

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={filteredMembers}
        pagination={false}
      />
    </div>
  );
};

export default WorkspaceMember;
