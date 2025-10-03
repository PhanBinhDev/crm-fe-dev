import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { createWorkspace } from '@/services/api/workspace';
import { useList } from '@refinedev/core';
import { Button, Form, Input, message, Modal, Select, Switch } from 'antd';
import React, { useState } from 'react';
import { UserRole } from '../../common/enum/user';
import { IUser } from '../../common/types/users';
import AvatarUpload from '../shared/AvatarUpload';

const ModalAddWorkspace: React.FC = () => {
  const { type, isOpen, closeModal } = useModal();
  const isModalOpen = type === 'ModalAddWorkspace' && isOpen;
  const { refreshWorkspaces } = useWorkspaces();

  const { data: usersData } = useList({
    resource: 'users/all',
    config: { pagination: { mode: 'off' } },
    queryOptions: { enabled: isModalOpen },
  });
  const [form] = Form.useForm();
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<IUser[]>([]);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: any = {
        name: values.name,
        description: values.description || '',
        visibility: isPrivate ? 'private' : 'public',
      };

      if (inviteMembers.length > 0) {
        payload.members = inviteMembers.map(m => m.email);
      }

      // Chỉ thêm avatar nếu có
      if (avatarData) {
        payload.avatar = avatarData;
      }

      console.log('Creating workspace with payload:', payload);

      const result = await createWorkspace(payload);
      console.log('Workspace creation result:', result);

      message.success('Tạo workspace thành công!');
      refreshWorkspaces();
      form.resetFields();
      setInviteMembers([]);
      setIsPrivate(false);
      setAvatarData(null);
      closeModal();
    } catch (err) {
      console.error('Workspace creation error:', err);
      message.error('Tạo workspace thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivate = (checked: boolean) => {
    setIsPrivate(checked);
    form.setFieldsValue({ isPrivate: checked });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <span style={{ fontSize: 23, fontWeight: 600, color: '#000000ff', letterSpacing: 0.1 }}>
            Tạo Workspace mới
          </span>
        </div>
      }
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={600}
      centered
      destroyOnHidden
    >
      <div style={{ marginBottom: 24, color: '#555', fontSize: 14, fontWeight: 400 }}>
        Tạo Space cho các nhóm làm việc, phòng ban hoặc các dự án riêng.
      </div>

      <Form layout="vertical" form={form} initialValues={{ permission: 'full' }}>
        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              <span style={{ color: 'red' }}></span> Tên Workspace
            </span>
          }
          style={{ marginBottom: 24 }}
          required
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <AvatarUpload value={avatarData} onChange={setAvatarData} size={36} />
            </div>
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: (
                    <span style={{ display: 'inline-block', marginLeft: 50 }}>
                      Vui lòng nhập tên Space
                    </span>
                  ),
                },
              ]}
              style={{ marginBottom: 0, width: '100%' }}
              noStyle
            >
              <Input
                placeholder="VD: Marketing, Kỹ thuật, Nhân sự"
                style={{
                  height: 36,
                  fontSize: 14,
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  fontWeight: 400,
                }}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              Mô tả <span style={{ fontWeight: 400, fontSize: 14 }}>( tùy chọn )</span>
            </span>
          }
          name="description"
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea
            rows={2}
            placeholder="Nhập mô tả cho Space (không bắt buộc)"
            style={{
              fontSize: 14,
              fontWeight: 400,
              height: 36,
              minHeight: 36,
              borderRadius: 8,
              background: '#fff',
              border: '1px solid #e0e0e0',
            }}
          />
        </Form.Item>

        {/* {!isPrivate && (
          <Form.Item style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                Phân quyền mặc định
                <Tooltip
                  title={
                    <div>
                      <p>
                        <strong>Toàn quyền sửa</strong>
                        <br />
                        Có thể tạo và chỉnh sửa các thực thể trong Space này. Chủ sở hữu và quản trị
                        viên có thể quản lý cài đặt Space.
                      </p>
                      <p>
                        <strong>Chỉnh sửa</strong>
                        <br />
                        Có thể tạo và chỉnh sửa các thực thể trong Space này. Không thể quản lý cài
                        đặt Space hoặc xóa các thực thể.
                      </p>
                      <p>
                        <strong>Bình luận</strong>
                        <br />
                        Có thể bình luận về các thực thể trong Space này. Không thể quản lý cài đặt
                        Space hoặc chỉnh sửa các thực thể.
                      </p>
                      <p>
                        <strong>Chỉ xem</strong>
                        <br />
                        Chỉ đọc. Không thể chỉnh sửa hoặc bình luận về các thực thể trong Space này
                        ngoài Chat. Có thể cộng tác trong Chat.
                      </p>
                    </div>
                  }
                >
                  <InfoCircleOutlined style={{ marginLeft: 4, color: '#8c8c8c' }} />
                </Tooltip>
              </span>
              <Form.Item name="permission" noStyle>
                <Select
                  style={{ width: 180, fontSize: 14, fontWeight: 400 }}
                  options={[
                    { value: 'full', label: 'Toàn quyền sửa' },
                    { value: 'edit', label: 'Chỉnh sửa' },
                    { value: 'comment', label: 'Bình luận' },
                    { value: 'view', label: 'Chỉ xem' },
                  ]}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )} */}

        <Form.Item style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Tạo Space riêng tư</span>
              <br />
              <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>
                Chỉ bạn và các thành viên được mời mới có quyền truy cập.
              </span>
            </div>
            <Switch checked={isPrivate} onChange={handleTogglePrivate} />
          </div>
        </Form.Item>

        {isPrivate && (
          <Form.Item label="Chia sẻ chỉ với:" name="inviteMembers" style={{ marginTop: 12 }}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Nhập email thành viên để mời"
              value={inviteMembers.map(m => m.email)}
              onChange={emails => {
                const newMembers = emails.map(email => ({
                  id: email,
                  email: email,
                  name: '',
                  username: '',
                  phone: '',
                  role: UserRole.CNBM,
                  dateOfBirth: '',
                  avatar: '',
                  major: '',
                  isActive: true,
                  assignedActivities: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }));
                setInviteMembers(newMembers);
              }}
              options={
                Array.isArray(usersData?.data)
                  ? (usersData.data as IUser[]).map(u => ({
                      value: u.email,
                      label: u.email,
                    }))
                  : []
              }
            />
          </Form.Item>
        )}
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          style={{
            minWidth: 120,
            background: '#1890ff',
            borderColor: '#1890ff',
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          Tiếp tục
        </Button>
      </div>
    </Modal>
  );
};

export default ModalAddWorkspace;
