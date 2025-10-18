import { IMember } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useCustomMutation, useList } from '@refinedev/core';
import { IconArrowsExchange, IconSearch } from '@tabler/icons-react';
import { Avatar, Input, List, Modal, Tooltip, message } from 'antd';
import { useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

const WorkspaceTransferOwnerModal = () => {
  const { user } = useAuth();
  const { isOpen, type, data, closeModal } = useModal();
  const isOpenModal = isOpen && type === 'WorkspaceTransferOwnerModal';
  const workspaceId = data?.workspaceId;

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 400);
  const { mutate } = useCustomMutation();

  const {
    data: membersResponse,
    isLoading,
    refetch,
  } = useList<IMember>({
    resource: workspaceId ? `workspaces/${workspaceId}/members` : '',
    filters: debouncedSearch
      ? [
          {
            field: 'q',
            operator: 'contains',
            value: debouncedSearch,
          },
        ]
      : [],
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: Boolean(workspaceId),
      retry: false,
    },
  });

  const [localMembers, setLocalMembers] = useState<IMember[]>([]);

  const members = useMemo(() => {
    const raw = membersResponse as any;
    let parsed: IMember[] = [];
    if (Array.isArray(raw?.data?.data)) parsed = raw.data.data;
    else if (Array.isArray(raw?.data)) parsed = raw.data;
    else if (Array.isArray(raw)) parsed = raw;
    if (parsed.length > 0 && localMembers.length === 0) setLocalMembers(parsed);
    return localMembers.length > 0 ? localMembers : parsed;
  }, [membersResponse, localMembers]);

  const handleTransfer = (member: IMember) => {
    if (member.user.id === user?.id) {
      message.warning('Bạn đang là chủ sở hữu hiện tại');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận chuyển quyền sở hữu',
      content: `Bạn có chắc muốn chuyển quyền sở hữu cho ${member.user.name}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        mutate(
          {
            url: `/workspaces/${workspaceId}/transfer-owner`,
            method: 'post',
            values: { newOwnerId: member.user.id },
          },
          {
            onSuccess: () => {
              message.success(`Đã chuyển quyền sở hữu cho ${member.user.name}`);
              setLocalMembers(prev =>
                prev.map(m => {
                  if (m.user.id === member.user.id)
                    return { ...m, role: 'owner' as IMember['role'] };
                  if (m.user.id === user?.id) return { ...m, role: 'member' as IMember['role'] };
                  return m;
                }),
              );
              refetch();

              closeModal();
            },
            onError: (error: any) => {
              message.error(error?.message || 'Chuyển quyền sở hữu thất bại');
            },
          },
        );
      },
    });
  };

  return (
    <Modal
      title="Chuyển quyền sở hữu Workspace"
      open={isOpenModal}
      onCancel={closeModal}
      footer={null}
      centered
      width={520}
      destroyOnClose
    >
      <Input
        placeholder="Tìm kiếm thành viên..."
        prefix={<IconSearch size={14} color="#888" />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
          }}
        >
          <Spinner size={26} />
        </div>
      ) : members.length === 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
            color: '#888',
          }}
        >
          Không có thành viên nào
        </div>
      ) : (
        <List
          dataSource={members.filter((m: IMember) => m.role !== 'owner' && m.user.id !== user?.id)}
          style={{ maxHeight: 360, overflowY: 'auto' }}
          renderItem={(member: IMember) => {
            const isOwner = member.role === 'owner';
            const isCurrentUser = member.user.id === user?.id;

            return (
              <List.Item
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar
                    src={member.user.avatar}
                    style={{
                      backgroundColor: getColorFromName(member.user.name),
                    }}
                  >
                    {getInitials(member.user.name)}
                  </Avatar>

                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {member.user.name}{' '}
                      {isOwner && (
                        <span style={{ color: '#1677ff', fontSize: 12 }}>(Chủ sở hữu)</span>
                      )}
                      {isCurrentUser && <span style={{ color: '#999', fontSize: 12 }}>(Bạn)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{member.user.email}</div>
                  </div>
                </div>

                {!isOwner && !isCurrentUser && (
                  <Tooltip title="Chuyển quyền sở hữu">
                    <IconArrowsExchange
                      size={18}
                      color="#1677ff"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTransfer(member)}
                    />
                  </Tooltip>
                )}
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
};

export default WorkspaceTransferOwnerModal;
