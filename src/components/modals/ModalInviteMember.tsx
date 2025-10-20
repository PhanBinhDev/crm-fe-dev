import { IMember, IUser } from '@/common/types';
import { getColorFromName } from '@/utils/activity';
import { useCreate, useList } from '@refinedev/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Avatar, Button, Form, Input, List, Modal, Space, Tooltip, message } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounceValue } from 'usehooks-ts';

interface ModalInviteMemberProps {
  setOpenModal: (open: boolean) => void;
  openModal: boolean;
}

const ModalInviteMember = ({ setOpenModal, openModal }: ModalInviteMemberProps) => {
  const [form] = Form.useForm();
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search.trim(), 400);
  const [selectedUser, setSelectedUser] = useState<IUser[]>([]);

  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data } = useList<IMember>({
    resource: `workspaces/${workspaceId}/members`,
    queryOptions: {
      enabled: !!workspaceId,
    },
  });

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (data?.data ?? []).forEach(member => {
      map.set(member.user.id, member.user.name);
    });
    return map;
  }, [data]);

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

  const usersData = useMemo(() => {
    if (isLoadingUsers) return [];
    return users?.data ?? [];
  }, [isLoadingUsers, users]);

  const { mutate: inviteMember, isPending } = useCreate();

  const handleSubmit = () => {
    const userIds = selectedUser.map(u => u.id);
    inviteMember(
      {
        resource: `workspaces/${workspaceId}/invite`,
        values: { userIds },
      },
      {
        onSuccess: () => {
          message.success('Đã gửi lời mời thành công');
          form.resetFields();
          setOpenModal(false);
        },
        onError: () => {
          message.error('Có lỗi xảy ra, vui lòng thử lại');
        },
      },
    );
  };

  const handleSetSelectedUser = (user: IUser) => {
    if (members.find(m => m.id === user.id)) {
      message.warning('Người dùng đã là thành viên của workspace');
      return;
    }

    if (selectedUser.find(u => u.id === user.id))
      return setSelectedUser(prev => prev.filter(u => u.id !== user.id));

    setSelectedUser(prev => [...prev, user]);
  };

  console.log(selectedUser);

  return (
    <Modal
      title="Mời thành viên"
      open={openModal}
      onCancel={() => setOpenModal(false)}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="email" label="Email">
          <Input
            onChange={e => setSearch(e.target.value)}
            placeholder="Nhập email để tìm kiếm thành viên"
          />
        </Form.Item>

        {debouncedSearch && (
          <List
            dataSource={usersData}
            loading={isLoadingUsers}
            style={{
              zIndex: 1,
              maxHeight: 200,
              width: '100%',
              marginBottom: 20,
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
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
                    <Tooltip title={user.email}>
                      <Avatar
                        size={24}
                        src={user.avatar}
                        style={{
                          background: getColorFromName(user.name?.[0] ?? 'U'),
                          fontSize: 14,
                        }}
                      >
                        {user.name?.[0] ?? 'U'}
                      </Avatar>
                    </Tooltip>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        color: getColorFromName(user.name?.[0] ?? 'U'),
                      }}
                    >
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </div>
                  {isActive && <IconCheck size={16} color="#1890ff" />}
                </List.Item>
              );
            }}
          />
        )}
        {selectedUser.length > 0 && (
          <Space
            style={{
              width: '100%',
              padding: '10px 10px',
              marginBottom: '10px',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              gap: 5,
              background: '#fafafa',
            }}
          >
            {selectedUser.map(u => (
              <Space style={{ position: 'relative' }}>
                <Tooltip title={u.email}>
                  <Avatar
                    size={30}
                    src={u.avatar}
                    style={{
                      background: getColorFromName(u.name?.[0] ?? 'U'),
                      fontSize: 14,
                    }}
                  >
                    {u.name?.[0] ?? 'U'}
                  </Avatar>
                </Tooltip>
                <IconX
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: 0,
                    color: 'gray',
                    cursor: 'pointer',
                  }}
                  size={13}
                  onClick={() => setSelectedUser(prev => prev.filter(user => user.id !== u.id))}
                />
              </Space>
            ))}
          </Space>
        )}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button type="default" onClick={() => setOpenModal(false)} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            disabled={selectedUser.length > 0 ? false : true}
            htmlType="submit"
            loading={isPending}
            onClick={handleSubmit}
          >
            Gửi lời mời
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalInviteMember;
