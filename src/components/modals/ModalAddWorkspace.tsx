import { useModal } from '@/hooks/useModal';
import { IconCopy, IconCopyCheckFilled, IconLink, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, message, Modal, Switch, Tooltip, Select, Avatar, Tag } from 'antd';
import { useMemo, useState } from 'react';
import SelectIcon from '@/components/shared/SelectIcon';
import { useCreate, useInvalidate, useList } from '@refinedev/core';
import { IUser } from '@/common/types';

const { Option } = Select;

const ModalAddWorkspace = () => {
  const { type, isOpen, closeModal } = useModal();

  const [form] = Form.useForm();
  const [copied, setCopied] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<IUser[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const { data: usersData, isLoading: usersLoading } = useList({
    resource: 'users/all',
    config: { pagination: { mode: 'off' } },
  });

  const invalidate = useInvalidate();

  const { mutate: createWorkspace, isPending: creating } = useCreate();

  const handleCopy = () => {
    if (copied) return;

    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    message.success('Đã sao chép link!');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFinish = (values: any) => {
    const finalValues = {
      ...values,
      inviteMembers: form.getFieldValue('visibility') === 'private' ? inviteMembers : [],
    };
    createWorkspace(
      {
        resource: 'workspaces',
        values: finalValues,
      },
      {
        onSuccess: () => {
          message.success('Tạo workspace thành công!');
          closeModal();
          form.resetFields();
          setInviteMembers([]);
          invalidate({
            resource: 'workspaces/mine',
            invalidates: ['list'],
          });
        },
        onError: (err: any) => {
          message.error(err?.message || 'Có lỗi xảy ra');
        },
      },
    );
  };

  const removeInviteMember = (id: string) => {
    setInviteMembers(inviteMembers.filter(member => member.id !== id));
  };

  const updateInviteMember = (id: string, field: keyof IUser, value: string) => {
    setInviteMembers(
      inviteMembers.map(member => (member.id === id ? { ...member, [field]: value } : member)),
    );
  };

  const isModalOpen = type === 'ModalAddWorkspace' && isOpen;
  const isPrivateWorkspace = visibility === 'private';

  const shareLink = useMemo(() => {
    const name = form.getFieldValue('name') || 'workspace';
    if (visibility === 'public') {
      return `https://crm.example.com/join/${encodeURIComponent(name)}`;
    }
    return `https://crm.example.com/invite/${encodeURIComponent(name)}`;
  }, [form.getFieldValue('name'), visibility]);

  return (
    <Modal
      open={isModalOpen}
      onCancel={closeModal}
      confirmLoading={creating}
      title="Thêm workspace mới"
      onOk={() => form.submit()}
      destroyOnHidden
      width={600}
      style={{
        top: 20,
        right: 'calc(-100% + 620px)',
        margin: 0,
      }}
      styles={{
        body: {
          maxHeight: '90vh',
        },
      }}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ icon: 'IconApps', visibility: 'public' }}
        onFinish={handleFinish}
      >
        <Form.Item label="Icon" name="icon">
          <SelectIcon />
        </Form.Item>
        <Form.Item
          label="Tên workspace"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên workspace' }]}
        >
          <Input placeholder="VD: Công ty A" />
        </Form.Item>

        <Form.Item name="visibility" style={{ marginBottom: 24, padding: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa',
              borderRadius: 8,
              padding: '12px 20px',
              border: '1px solid #f0f0f0',
            }}
          >
            <div style={{ flex: 1, paddingRight: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Visibility</div>
              <div style={{ color: '#888', fontSize: 12 }}>
                {visibility === 'public'
                  ? 'Workspace công khai: mọi thành viên đều có thể xem và tham gia.'
                  : 'Workspace riêng tư: chỉ những người được mời mới có thể truy cập.'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
              <Switch
                checked={visibility === 'public'}
                onChange={checked => {
                  const newVisibility = checked ? 'public' : 'private';
                  setVisibility(newVisibility);
                  form.setFieldsValue({ visibility: newVisibility });
                  if (checked) {
                    setInviteMembers([]);
                  }
                }}
              />
            </div>
          </div>
        </Form.Item>

        {/* Member Invitation Section - Only show for private workspaces */}
        {isPrivateWorkspace && (
          <Form.Item label="Mời thành viên" style={{ marginBottom: 24 }}>
            <div
              style={{
                background: '#fafafa',
                borderRadius: 8,
                padding: '16px',
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  Thêm thành viên vào workspace
                </div>
                <div style={{ color: '#888', fontSize: 12 }}>
                  Bạn sẽ là owner của workspace. Mời các thành viên khác với role admin hoặc member.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-start' }}>
                <Select
                  showSearch
                  placeholder="Tìm email thành viên"
                  style={{ flex: 1 }}
                  loading={usersLoading}
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
                    (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={
                    usersData?.data
                      ?.filter((u: any) => !inviteMembers.some(m => m.email === u.email))
                      .map((user: any) => ({
                        label: `${user.email} (${user.name || ''})`,
                        value: user.email,
                      })) || []
                  }
                  value={inviteMembers.map(m => m.email)}
                  onChange={(values: string[]) => {
                    const map = new Map(inviteMembers.map(m => [m.email, m]));
                    const next = values.map(
                      (email, idx) =>
                        map.get(email) ?? {
                          id: Date.now().toString() + idx,
                          email,
                          role: 'member',
                        },
                    );
                    setInviteMembers(next as typeof inviteMembers);
                  }}
                  mode="multiple"
                  maxTagCount={1}
                  maxTagPlaceholder={omittedValues => (
                    <span style={{ color: '#1890ff', fontWeight: 600 }}>
                      +{omittedValues.length}
                    </span>
                  )}
                  maxTagTextLength={20}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 190,
                  overflowY: 'auto',
                  marginBottom: 4,
                }}
              >
                {inviteMembers.length === 0 ? (
                  <div style={{ color: '#aaa', fontSize: 13 }}>
                    Chưa có thành viên nào được mời.
                  </div>
                ) : (
                  inviteMembers.map(member => (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: '#fff',
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <Avatar style={{ background: '#1890ff' }} src={member.avatar}>
                        {member.email ? member.email.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {member.email}
                        </div>
                        <div style={{ color: '#888', fontSize: 12 }}>Invited</div>
                      </div>

                      <Select
                        value={member.role}
                        onChange={value => updateInviteMember(member.id, 'role', value)}
                        style={{ width: 110 }}
                        size="small"
                      >
                        <Option value="admin">Admin</Option>
                        <Option value="member">Member</Option>
                      </Select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tooltip title="Xóa">
                          <Button
                            type="text"
                            danger
                            icon={<IconTrash size={16} />}
                            onClick={() => removeInviteMember(member.id)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item label="Share link" style={{ marginBottom: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: '6px 12px',
              gap: 8,
            }}
          >
            <IconLink size={18} color="#1890ff" />
            <Input
              value={shareLink}
              readOnly
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 500,
                color: '#555',
                boxShadow: 'none',
                paddingLeft: 0,
              }}
            />
            <Tooltip title="Sao chép link">
              <Button
                type="text"
                icon={
                  copied ? (
                    <IconCopyCheckFilled
                      size={18}
                      color="#52c41a"
                      style={{ transition: 'color 0.2s' }}
                    />
                  ) : (
                    <IconCopy size={18} color="#1890ff" />
                  )
                }
                onClick={handleCopy}
                style={{
                  color: copied ? '#52c41a' : '#1890ff',
                  fontWeight: 600,
                  marginLeft: 4,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
              />
            </Tooltip>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddWorkspace;
