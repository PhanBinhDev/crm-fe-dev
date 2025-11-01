import { IUser } from '@/common/types';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useCreate, useList } from '@refinedev/core';
import {
  IconCheck,
  IconCopy,
  IconKey,
  IconLink,
  IconMail,
  IconQrcode,
  IconSend2,
} from '@tabler/icons-react';
import { Avatar, Button, Input, List, message, Modal, QRCode, Typography } from 'antd';
import { useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

const WorkspaceShareModal = () => {
  const { isOpen, type, data, closeModal } = useModal();
  const isOpenModal = isOpen && type === 'WorkspaceShareModal';
  const [showQR, setShowQR] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [debouncedSearch] = useDebounceValue(search.trim(), 400);
  const inputSearch = useRef<any>(null);
  const { user: currentUser } = useAuth();

  const inviteCode = data?.inviteCode || '000000';
  const inviteLink = 'http://';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Đã sao chép vào clipboard');
    } catch {
      message.error('Không thể sao chép');
    }
  };

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

  const { data: members } = useList({
    resource: `workspaces/${data?.workspaceId?.id}/members`,
    queryOptions: {
      enabled: !!data?.workspaceId?.id,
    },
  });

  const { data: pendingInvitations } = useList({
    resource: `workspaces/${data?.workspaceId?.id}/invitations`,
    queryOptions: {
      enabled: !!data?.workspaceId?.id,
    },
  });

  const { mutate: inviteMember } = useCreate();

  const handleSetSelectedUser = (user: IUser) => {
    const memberData = members?.data?.find((m: any) => m.user.id === user.id);
    if (memberData) {
      message.warning('Người dùng đã là thành viên của workspace');
      return;
    }

    const pendingInvitation = pendingInvitations?.data?.find(
      (inv: any) => inv.user?.id === user.id || inv.userId === user.id,
    );
    if (pendingInvitation) {
      message.warning('Người dùng đã được mời nhưng chưa chấp nhận lời mời');
      return;
    }

    setSelectedUser(user);
    setSearch('');
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
  };

  const handleInviteEmail = () => {
    if (!selectedUser) {
      message.warning('Vui lòng chọn người dùng để mời');
      return;
    }

    inviteMember(
      {
        resource: `workspaces/${data?.workspaceId?.id}/invite`,
        values: {
          userIds: [selectedUser.id],
        },
      },
      {
        onSuccess: () => {
          message.success(`Đã gửi lời mời đến ${selectedUser.email}`);
          setSelectedUser(null);
          setSearch('');
        },
        onError: (error: any) => {
          message.error(error?.message || 'Có lỗi xảy ra khi gửi lời mời');
        },
      },
    );
  };

  const items = [
    {
      key: 'email',
      icon: <IconMail />,
      label: 'Email',
      content: (
        <div style={{ position: 'relative', width: '100%' }}>
          <Input
            ref={inputSearch}
            value={selectedUser ? selectedUser.email : search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nhập email thành viên..."
            style={{ width: '100%' }}
            onPressEnter={handleInviteEmail}
            allowClear={!!selectedUser}
            onClear={handleRemoveUser}
            suffix={
              <IconSend2
                size={16}
                color="#767676ff"
                onClick={handleInviteEmail}
                style={{ cursor: 'pointer' }}
              />
            }
          />

          {debouncedSearch && !selectedUser && (
            <List
              dataSource={(users?.data || []).filter(user => user.id !== currentUser?.id)}
              loading={isLoadingUsers}
              style={{
                position: 'absolute',
                zIndex: 10,
                maxHeight: 200,
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                width: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginTop: 4,
              }}
              renderItem={(user: IUser) => {
                const isMember = members?.data?.find((m: any) => m.user.id === user.id);
                return (
                  <List.Item
                    key={user.id}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      background: isMember ? '#f0f7ff' : 'transparent',
                    }}
                    onClick={() => handleSetSelectedUser(user)}
                    onMouseEnter={e => {
                      if (!isMember) {
                        e.currentTarget.style.background = '#fafafa';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isMember) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <Avatar size={24} src={user.avatar} style={{ background: '#1890ff' }}>
                        {user.name?.[0] || 'U'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Typography.Text style={{ fontSize: 13 }}>{user.name}</Typography.Text>
                        <Typography.Text style={{ fontSize: 11, color: '#999', display: 'block' }}>
                          {user.email}
                        </Typography.Text>
                      </div>
                      {isMember && <IconCheck size={16} color="#1677ff" />}
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'code',
      icon: <IconKey />,
      label: 'Mã mời',
      content: (
        <Input
          value={inviteCode}
          readOnly
          style={{ width: '100%', fontWeight: 600 }}
          suffix={
            <IconCopy
              color="#767676ff"
              size={14}
              onClick={() => handleCopy(inviteCode)}
              style={{ cursor: 'pointer' }}
            />
          }
        />
      ),
    },
    {
      key: 'link',
      icon: <IconLink />,
      label: 'Link mời',
      content: (
        <Input
          value={inviteLink}
          readOnly
          style={{ width: '100%' }}
          suffix={
            <IconCopy
              color="#767676ff"
              size={14}
              onClick={() => handleCopy(inviteLink)}
              style={{ cursor: 'pointer' }}
            />
          }
        />
      ),
    },
    {
      key: 'qr',
      icon: <IconQrcode />,
      label: 'QR Code',
      content: (
        <Button
          type="text"
          style={{ border: '1px solid #dadadaff' }}
          onClick={() => setShowQR(!showQR)}
        >
          {showQR ? 'Ẩn QR Code' : 'Hiển thị QR Code'}
        </Button>
      ),
      extra: showQR ? (
        <div
          style={{
            marginTop: 12,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <QRCode value={inviteLink} size={160} />
          <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>Quét mã để tham gia nhanh</div>
        </div>
      ) : null,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <span
            style={{
              fontSize: 23,
              fontWeight: 600,
              color: '#000',
              letterSpacing: 0.1,
              textAlign: 'center',
              width: '100%',
            }}
          >
            Chia sẻ không gian làm việc
          </span>
        </div>
      }
      open={isOpenModal}
      onCancel={closeModal}
      footer={null}
      width={500}
      centered
      destroyOnHidden
    >
      <div style={{ marginBottom: 20, color: '#555', width: '100%', textAlign: 'center' }}>
        Mời thành viên tham gia bằng một trong các cách dưới đây:
      </div>

      <List
        dataSource={items}
        renderItem={item => (
          <List.Item style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              {item.icon}
              <span style={{ fontWeight: 600, minWidth: 80 }}>{item.label}:</span>
              <div style={{ width: '100%' }}>{item.content}</div>
            </div>
            {item.extra}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default WorkspaceShareModal;
