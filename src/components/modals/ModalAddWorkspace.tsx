import { WorkspaceVisibility } from '@/common/enum/workspace';
import { ICreateWorkspacePayload } from '@/common/interfaces/workspaces';
import { IWorkspace } from '@/common/types';
import { IUser } from '@/common/types/users';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useCustomMutation, useList } from '@refinedev/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { Avatar, Button, Form, Input, Modal, Select, Space, Switch, Typography } from 'antd';
import { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import React, { useCallback, useMemo, useState } from 'react';

type OptionSelect = BaseOptionType | DefaultOptionType;

const ModalAddWorkspace: React.FC = () => {
  const { type, isOpen, closeModal } = useModal();
  const { user: currentUser } = useAuth();
  const isModalOpen = type === 'ModalAddWorkspace' && isOpen;
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<ICreateWorkspacePayload>({
    name: '',
    description: '',
    visibility: WorkspaceVisibility.PUBLIC,
    members: [],
    avatar: undefined,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

  const { refreshWorkspaces, switchWorkspace } = useWorkspaces();
  const { mutate: createWorkspace, isPending: isPendingCreate } = useCustomMutation<IWorkspace>();
  const { data: usersData, isLoading: isLoadingUsers } = useList<IUser>({
    resource: 'users/all',
    config: { pagination: { mode: 'off' } },
    queryOptions: { enabled: isModalOpen },
  });

  const users = useMemo(() => {
    if (isLoadingUsers || !usersData) return [] as OptionSelect[];

    return usersData.data
      .filter(u => u.id !== currentUser?.id)
      .map(u => {
        return {
          label: (
            <div>
              <Avatar size={24} style={{ background: getColorFromName(u?.name) }}>
                <Typography.Text style={{ color: '#fff', fontWeight: 500, fontSize: 11 }}>
                  {getInitials(u?.name)}
                </Typography.Text>
              </Avatar>
              <span style={{ marginLeft: 8 }}>{u.name}</span>
            </div>
          ),
          value: u.id,
        };
      }) as OptionSelect[];
  }, [isLoadingUsers, usersData, currentUser]);

  const handleSubmit = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('visibility', formData.visibility);

    if (formData.avatar) {
      formDataToSend.append('avatar', formData.avatar);
    }

    if (Array.isArray(formData.members)) {
      formData.members.forEach((id, idx) => {
        formDataToSend.append(`members[${idx}]`, id);
      });
    }

    createWorkspace(
      {
        url: 'workspaces',
        method: 'post',
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        values: formDataToSend,
      },
      {
        onSuccess: data => {
          closeModal();
          form.resetFields();
          setFormData({
            name: '',
            description: '',
            visibility: WorkspaceVisibility.PUBLIC,
            members: [],
            avatar: undefined,
          });
          setAvatarPreview(undefined);
          refreshWorkspaces();
          switchWorkspace(data.data.id);
        },
      },
    );
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
    }));
    form.setFieldValue('name', name);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    setFormData(prev => ({
      ...prev,
      description,
    }));
    form.setFieldValue('description', description);
  }, []);

  const handleTogglePrivate = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      visibility: checked ? WorkspaceVisibility.PRIVATE : WorkspaceVisibility.PUBLIC,
    }));
    form.setFieldValue(
      'visibility',
      checked ? WorkspaceVisibility.PRIVATE : WorkspaceVisibility.PUBLIC,
    );
  }, []);

  const handleInviteMembersChange = useCallback((members: string[]) => {
    setFormData(prev => ({
      ...prev,
      members,
    }));

    form.setFieldValue('members', members);
  }, []);

  return (
    <Modal
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          <Typography.Text
            style={{ fontSize: 22, fontWeight: 600, color: '#000000ff', letterSpacing: 0.1 }}
          >
            Tạo Workspace mới
          </Typography.Text>

          <Button
            type="text"
            onClick={closeModal}
            style={{
              borderRadius: 7,
              color: '#555',
              alignSelf: 'flex-start',
            }}
            icon={<IconX size={14} stroke={1.5} />}
            size="small"
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
          />
        </div>
      }
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={500}
      styles={{
        content: {
          padding: 18,
        },
      }}
      closeIcon={null}
      centered
      destroyOnHidden
    >
      <div style={{ marginBottom: 24, color: '#555', fontSize: 14, fontWeight: 400 }}>
        Tạo Space cho các nhóm làm việc, phòng ban hoặc các dự án riêng.
      </div>

      <Form layout="vertical" form={form} initialValues={formData} onFinish={handleSubmit}>
        <Form.Item
          label={<span style={{ fontWeight: 600, fontSize: 15 }}>Tên Workspace</span>}
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
          style={{ marginBottom: 18 }}
          required
          name="name"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <Avatar
                size={36}
                src={avatarPreview}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: avatarPreview ? undefined : getColorFromName(formData.name),
                }}
                onClick={() => document.getElementById('workspace-avatar-input')?.click()}
              >
                {!avatarPreview && (
                  <>{formData.name?.[0]?.toUpperCase() || <IconUpload size={16} />}</>
                )}
              </Avatar>
              <input
                id="workspace-avatar-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];

                  console.log('file', file);

                  // if (file) {
                  //   setAvatarPreview(URL.createObjectURL(file));
                  //   setFormData(prev => ({ ...prev, avatar: file }));
                  //   form.setFieldValue('avatar', file);
                  // }
                }}
              />
            </div>
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
              value={formData.name}
              onChange={handleNameChange}
            />
          </div>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600, fontSize: 15 }}>Mô tả</span>}
          name="description"
          rules={[
            {
              required: true,
              message: (
                <span style={{ display: 'inline-block' }}>Vui lòng nhập mô tả cho workspace</span>
              ),
            },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="Nhập mô tả cho Space (không bắt buộc)"
            style={{
              fontSize: 14,
              fontWeight: 400,
              minHeight: 36,
              borderRadius: 8,
              background: '#fff',
              border: '1px solid #e0e0e0',
            }}
            value={formData.description}
            onChange={handleDescriptionChange}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 24 }} name="visibility">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f5f5f5',
              padding: '8px 12px',
              borderRadius: 8,
            }}
          >
            <Space direction="vertical" size={1}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Tạo Space riêng tư</span>
              <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>
                Chỉ bạn và các thành viên được mời mới có quyền truy cập.
              </span>
            </Space>
            <Switch
              size="small"
              checked={formData.visibility === WorkspaceVisibility.PRIVATE}
              onChange={handleTogglePrivate}
            />
          </div>
        </Form.Item>

        {formData.visibility === WorkspaceVisibility.PRIVATE && (
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 15 }}>Mời thành viên</span>}
            name="members"
            style={{ marginTop: 12 }}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Nhập email thành viên để mời"
              value={formData.members}
              onChange={handleInviteMembersChange}
              options={users}
              size="large"
            />
          </Form.Item>
        )}
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button
          type="primary"
          onClick={form.submit}
          loading={isPendingCreate}
          style={{
            minWidth: 120,
            fontWeight: 500,
            fontSize: 15,
            borderRadius: 8,
          }}
        >
          Tạo Space
        </Button>
      </div>
    </Modal>
  );
};

export default ModalAddWorkspace;
