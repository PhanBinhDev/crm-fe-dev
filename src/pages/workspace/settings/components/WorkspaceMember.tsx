import { useList } from '@refinedev/core';
import { IconMailPlus, IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Select, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MemberRowActions } from './MemberRowAction';

interface Member {
  user: {
    name: string;
    email: string;
    phone: string;
    major: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

const WorkspaceMember = () => {
  const [form] = Form.useForm();
  const [filterRole, setFilterRole] = useState<string>('');
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading } = useList<Member>({
    resource: `workspaces/${workspaceId}/members`,
  });

  const members = (data?.data ?? []).map((m, index) => ({
    // key: m.id,
    index: index + 1,
    name: m.user.name,
    email: m.user.email,
    role: m.user.role,
    status: m.user.isActive ? 'Accepted' : 'Pending',
    // invitedBy: m.user.createdBy ?? '—',
    invitedAt: new Date(m.user.createdAt).toLocaleDateString(),
  }));

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return counts;
  }, [members]);

  const options = [
    { label: `All Member (${members.length})`, value: '' },
    ...Object.keys(roleCounts).map(role => ({
      label: `${role} (${roleCounts[role]})`,
      value: role,
    })),
  ];

  const filteredMembers = filterRole ? members.filter(m => m.role === filterRole) : members;

  const columns = [
    { title: 'STT', dataIndex: 'index', key: 'index', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'Accepted' ? (
          <Tag color="green">Accepted</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    { title: 'Invited By', dataIndex: 'invitedBy', key: 'invitedBy' },
    { title: 'Invited At', dataIndex: 'invitedAt', key: 'invitedAt' },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => <MemberRowActions user={record} role={record.role} />,
    },
  ];

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
        style={{ width: '20%', marginBottom: 10 }}
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
