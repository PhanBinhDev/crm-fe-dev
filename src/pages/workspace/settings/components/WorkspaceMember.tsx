import { MemberRole, MemberStatus } from '@/common/enum/workspace';
import { IMember, IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { getWorkspaceRoleLabel } from '@/utils/workspace';
import { useCreate, useList } from '@refinedev/core';
import { IconCheck, IconMailPlus, IconPlus } from '@tabler/icons-react';
import type { InputRef } from 'antd';
import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  message,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';
import { MemberRowActions } from './MemberRowAction';

const WorkspaceMember = () => {
  const [filterRole, setFilterRole] = useState<string>('');
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading, refetch } = useList<IMember>({
    resource: `workspaces/${workspaceId}/members`,
  });

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search.trim(), 400);
  const [selectedUser, setSelectedUser] = useState<IUser[]>([]);

  const { data: users, isLoading: isLoadingUsers } = useList<IUser>({
    resource: 'users/all',
    filters: debouncedSearch
      ? [
          {
            field: 'q',
            operator: 'contains',
            value: debouncedSearch,
          },
        ]
      : [],
    pagination: { pageSize: 20 },
    queryOptions: {
      retry: false,
      enabled: !!debouncedSearch,
    },
  });

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (data?.data ?? []).forEach(member => {
      map.set(member.user.id, member.user.name);
    });
    return map;
  }, [data]);

  const usersData = useMemo(() => {
    if (isLoadingUsers) return [];
    return users?.data ?? [];
  }, [isLoadingUsers, users]);

  const { mutate: createMember, isPending: isCreating } = useCreate();

  const { user: identity } = useAuth();

  const currentUserRole = (data?.data ?? []).find(m => m.user.id === identity?.id)?.role;

  const members = (data?.data ?? []).map((m, index) => {
    const invitedByName = memberNameMap.get(m.createdBy) || m.createdBy;

    return {
      index: index + 1,
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      status: m.status,
      invitedBy: invitedByName,
      invitedAt: new Date(m.createdAt).toLocaleDateString(),
    };
  });

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
  const sortedMembers = useMemo(() => {
    const membersToSort = [...filteredMembers];

    membersToSort.sort((a, b) => {
      if (a.role === MemberRole.OWNER) return -1;
      if (b.role === MemberRole.OWNER) return 1;
      return 0;
    });

    return membersToSort;
  }, [filteredMembers]);

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
    // { title: 'Người mời', dataIndex: 'invitedBy', key: 'invitedBy' },
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
  const inputSearch = useRef<InputRef>(null);

  const handleAddMember = () => {
    if (selectedUser.length === 0) return;
    const userIds = selectedUser.map(u => u.id);
    console.log(userIds);
    // return;
    createMember(
      {
        resource: `workspaces/${workspaceId}/invite`,
        values: { userIds },
      },
      {
        onSuccess: () => {
          setSelectedUser([]);
          setSearch('');
          inputSearch.current?.input && (inputSearch.current.input.value = '');
          refetch();
          message.success('Thêm thành viên thành công');
        },
        onError: () => {
          message.error('Thêm thành viên thất bại, vui lòng thử lại');
        },
      },
    );
  };

  const handleSetSelectedUser = (user: IUser) => {
    if (selectedUser.find(u => u.id === user.id)) return;

    if (members.find(m => m.id === user.id)) {
      message.warning('Người dùng đã là thành viên của workspace');
      return;
    }

    setSelectedUser(prev => [...prev, user]);
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: 10, fontSize: 25 }}>Quản lý thành viên</h2>

      {selectedUser.length > 0 && (
        <Space
          style={{
            marginBottom: 10,
            width: '100%',
            justifyContent: 'space-between',
            background: '#fafafa',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Space>
            {selectedUser.map(user => (
              <Tag
                key={user.id}
                style={{ fontSize: 14, padding: '5px 10px', display: 'flex', alignItems: 'center' }}
                closable
                onClose={() => setSelectedUser(prev => prev.filter(u => u.id !== user.id))}
              >
                <Tooltip title={user.email}>{user.name}</Tooltip>
              </Tag>
            ))}
          </Space>
          <Button
            type="primary"
            icon={<IconPlus size={15} />}
            style={{
              height: 32,
              width: '80px',
              padding: '0 12px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              opacity: isCreating ? 0.6 : 1,
            }}
            onClick={() => {
              setSearch('');
              handleAddMember();
            }}
            disabled={isCreating}
          >
            {isCreating ? <Spin size="small" /> : 'Thêm'}
          </Button>
        </Space>
      )}

      <Form style={{ marginBottom: 10, width: '100%', height: '100%', position: 'relative' }}>
        <Form.Item name="usersId" style={{ width: '100%', marginBottom: 0 }}>
          <Input
            ref={inputSearch}
            prefix={<IconMailPlus size={16} color="#bfbfbf" />}
            placeholder="Tìm kiếm hoặc nhập email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 8, padding: '10px 10px 10px 10px' }}
          />
        </Form.Item>
        {debouncedSearch && (
          <List
            dataSource={usersData}
            loading={!!debouncedSearch && isLoadingUsers}
            style={{
              position: 'absolute',
              zIndex: 1,
              minHeight: 180,
              minWidth: 200,
              overflowY: 'auto',
              margin: '0 8px',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              top: '110%',
              left: 0,
              padding: 8,
            }}
            renderItem={(user: IUser) => {
              const isActive =
                selectedUser.some(u => u.id === user.id) || members.some(m => m.id === user.id);
              return (
                <List.Item
                  key={user.id}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderRadius: 8,
                    background: '#f6f6f6',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    border: isActive ? '1px solid #1890ff' : '1px solid transparent',
                  }}
                  onClick={() => handleSetSelectedUser(user)}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f0f0f0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f6f6f6';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Avatar
                      size={24}
                      src={user.avatar}
                      style={{ background: '#1890ff', fontSize: 14 }}
                    >
                      {user.name?.[0] ?? 'U'}
                    </Avatar>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        color: '#1890ff',
                      }}
                    >
                      {user.name}
                    </span>
                  </div>
                  {isActive && <IconCheck size={16} color="#1890ff" />}
                </List.Item>
              );
            }}
          />
        )}
      </Form>

      <Select
        defaultValue=""
        style={{ marginBottom: 10 }}
        options={options}
        onChange={value => setFilterRole(value)}
      />

      <Table loading={isLoading} columns={columns} dataSource={sortedMembers} pagination={false} />
    </div>
  );
};

export default WorkspaceMember;
