import { useModal } from '@/hooks/useModal';
import { useCustomMutation } from '@refinedev/core';
import { IconCopy, IconKey, IconLink, IconMail, IconQrcode, IconSend2 } from '@tabler/icons-react';
import { Button, Input, List, message, Modal, QRCode } from 'antd';
import { useState } from 'react';

const WorkspaceShareModal = () => {
  const { isOpen, type, data, closeModal } = useModal();
  const isOpenModal = isOpen && type === 'WorkspaceShareModal';
  const [showQR, setShowQR] = useState(false);

  const inviteCode = data?.inviteCode || '000000';
  const inviteLink = 'http://';
  const [email, setEmail] = useState('');

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Đã sao chép vào clipboard');
    } catch {
      message.error('Không thể sao chép');
    }
  };

  const { mutate: inviteMember } = useCustomMutation();

  const handleInviteEmail = () => {
    if (!email.trim()) {
      message.warning('Vui lòng nhập email');
      return;
    }

    inviteMember(
      {
        url: `/workspaces/${data?.workspaceId.id}/invite`,
        method: 'post',
        values: {
          email,
        },
      },
      {
        onSuccess: () => {
          message.success(`Đã gửi lời mời đến ${email}`);
          setEmail('');
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
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Nhập email thành viên..."
          style={{ width: '100%' }}
          onPressEnter={handleInviteEmail}
          suffix={
            <IconSend2
              size={16}
              color="#767676ff"
              onClick={handleInviteEmail}
              style={{ cursor: 'pointer' }}
            />
          }
        />
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
