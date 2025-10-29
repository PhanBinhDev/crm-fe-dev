import { MemberRole } from '@/common/enum/workspace';
import { IUser, IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useCreate, useList } from '@refinedev/core';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronUp,
  IconPlus,
  IconSend,
  IconShield,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import type { InputRef } from 'antd';
import {
  Avatar,
  Button,
  Drawer,
  Input,
  List,
  message,
  Popover,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useDebounceValue, useMediaQuery } from 'usehooks-ts';

type FormData = {
  role: MemberRole;
  selectedUsers: IUser[];
};

const ModalInviteMember = () => {
  const { isOpen, type, closeModal, openModal } = useModal();
  const [open, setOpen] = useState(false);
  const [selectWorkspace, setSelectWorkspace] = useState<IWorkspace | null>(null);
  const [step, setStep] = useState(1); // 1: Select role, 2: Select users
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOpenModal = isOpen && type === 'ModalInviteMember';

  const [formData, setFormData] = useState<FormData>({
    role: MemberRole.ADMIN,
    selectedUsers: [],
  });

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search.trim(), 400);
  const inputSearch = useRef<InputRef>(null);

  const { workspaces, isLoading, currentWorkspace } = useWorkspaces();

  // Get users search results
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
      enabled: !!debouncedSearch && step === 2,
    },
  });

  // Get current members of workspace
  const { data: members } = useList({
    resource: `workspaces/${selectWorkspace?.id}/members`,
    queryOptions: {
      enabled: !!selectWorkspace?.id && step === 2,
    },
  });

  const { mutate: inviteMember, isPending: isInviting } = useCreate();

  useEffect(() => {
    if (currentWorkspace && isOpenModal) {
      setSelectWorkspace(currentWorkspace);
    }
  }, [workspaces, currentWorkspace, isOpenModal]);

  useEffect(() => {
    if (!isOpenModal) {
      // Reset state when modal closes
      setStep(1);
      setFormData({ role: MemberRole.ADMIN, selectedUsers: [] });
      setSearch('');
    }
  }, [isOpenModal]);

  const handleRoleChange = (role: MemberRole) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  const handleProceed = () => {
    if (step === 1 && selectWorkspace) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSearch('');
      setFormData(prev => ({ ...prev, selectedUsers: [] }));
    }
  };

  const handleSetSelectedUser = (user: IUser) => {
    // Check if already selected
    if (formData.selectedUsers.find(u => u.id === user.id)) return;

    // Check if already a member
    if (members?.data?.find((m: any) => m.user.id === user.id)) {
      message.warning('Người dùng đã là thành viên của workspace');
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedUsers: [...prev.selectedUsers, user],
    }));
  };

  const handleRemoveUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(u => u.id !== userId),
    }));
  };

  const handleInvite = () => {
    if (!selectWorkspace || formData.selectedUsers.length === 0) return;

    const userIds = formData.selectedUsers.map(u => u.id);

    inviteMember(
      {
        resource: `workspaces/${selectWorkspace.id}/invite`,
        values: { userIds },
      },
      {
        onSuccess: () => {
          message.success('Gửi lời mời tới thành viên thành công');
          closeModal();
        },
        onError: () => {
          message.error('Gửi lời mời tới thành viên thất bại, vui lòng thử lại');
        },
      },
    );
  };

  const workspaceSelectContent = (
    <List style={{ width: '100%' }}>
      {isLoading ? (
        <div
          style={{
            height: 166,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spinner size={24} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {workspaces.map(workspace => (
            <div
              key={workspace.id}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => {
                setSelectWorkspace(workspace);
                setOpen(false);
              }}
            >
              <CustomAvatar
                size={24}
                name={workspace.name}
                src={workspace.avatar}
                style={{ fontSize: 12 }}
              />
              <Typography.Text>{workspace.name}</Typography.Text>
              {selectWorkspace?.id === workspace.id && (
                <IconCheck size={16} color="#838383" style={{ marginLeft: 'auto' }} />
              )}
            </div>
          ))}

          <Button
            type="text"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              borderRadius: 8,
              padding: '4px 10px',
              gap: 6,
              color: '#333',
            }}
            styles={{
              icon: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
            icon={<IconPlus size={16} color="#333" />}
            onClick={() => {
              setOpen(false);
              openModal('ModalAddWorkspace');
            }}
          >
            Tạo workspace
          </Button>
        </div>
      )}
    </List>
  );

  // Email validation
  const invalidEmails = formData.selectedUsers.filter(
    user => !user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
  );

  return (
    <Drawer
      closeIcon={null}
      open={isOpenModal}
      onClose={closeModal}
      destroyOnClose
      styles={{
        wrapper: {
          padding: 12,
          width: isMobile ? '100%' : 400,
          boxShadow: 'none',
        },
        body: {
          padding: 0,
        },
        content: {
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow:
            '-6px 0 16px 0 rgba(0, 0, 0, 0.08),-3px 0 6px -4px rgba(0, 0, 0, 0.12),-9px 0 28px 8px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Space
          align="center"
          style={{
            width: '100%',
            padding: '12px 10px 12px 15px',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            Mời thành viên
          </Typography.Title>

          <Button
            type="text"
            size="small"
            onClick={closeModal}
            icon={<IconX size="16" />}
            styles={{
              icon: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
            style={{
              padding: '4px',
              borderRadius: 8,
            }}
          />
        </Space>

        {/* Step 1: Select Workspace and Role */}
        {step === 1 && (
          <Space direction="vertical" style={{ padding: '12px 15px', flex: 1, gap: 15 }}>
            <div
              style={{
                position: 'relative',
                background: '#f1f1f1',
                padding: 12,
                borderRadius: 12,
                width: 124,
                margin: '0 auto',
              }}
            >
              <CustomAvatar
                size={100}
                name={selectWorkspace ? selectWorkspace.name : 'Workspace'}
                src={selectWorkspace ? selectWorkspace.avatar : undefined}
                style={{
                  transition: 'opacity 0.3s',
                  fontSize: 48,
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <Typography.Text
                style={{ color: '#666', fontSize: 13, marginBottom: 6, display: 'block' }}
              >
                Workspace
              </Typography.Text>
              <Popover
                content={workspaceSelectContent}
                trigger={['click']}
                placement="bottom"
                arrow={false}
                styles={{
                  body: {
                    padding: 8,
                    width: isMobile ? '100%' : 358,
                  },
                }}
                open={open}
                onOpenChange={setOpen}
              >
                <Button
                  type="text"
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    border: '1px solid #d9d9d9',
                  }}
                  icon={
                    <IconChevronUp
                      size={16}
                      style={{
                        transition: 'transform 0.3s',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  }
                  iconPosition="end"
                  styles={{
                    icon: {
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 'auto',
                    },
                  }}
                >
                  {selectWorkspace ? (
                    <>
                      <CustomAvatar
                        size={24}
                        name={selectWorkspace.name}
                        src={selectWorkspace.avatar}
                        style={{ fontSize: 12 }}
                      />
                      <span style={{ marginLeft: 8 }}>{selectWorkspace.name}</span>
                    </>
                  ) : (
                    'Chọn workspace'
                  )}
                </Button>
              </Popover>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography.Text style={{ color: '#666', fontSize: 13 }}>
                Chọn vai trò thành viên
              </Typography.Text>
              <Space direction="vertical" style={{ width: '100%', gap: 8 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: `2px solid ${formData.role === MemberRole.ADMIN ? '#1677ff' : '#e8e8e8'}`,
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    background: formData.role === MemberRole.ADMIN ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => handleRoleChange(MemberRole.ADMIN)}
                >
                  <div
                    style={{
                      border: `1px solid ${formData.role === MemberRole.ADMIN ? '#1677ff' : '#d9d9d9'}`,
                      padding: 8,
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                      width: 42,
                      height: 42,
                      background: '#fff',
                    }}
                  >
                    <IconShield size={24} color="#1677ff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong style={{ fontSize: 14, display: 'block' }}>
                      Quản trị viên
                    </Typography.Text>
                    <Typography.Text style={{ color: '#666', fontSize: 12 }}>
                      Có quyền quản lý đầy đủ và phân quyền người dùng trong workspace.
                    </Typography.Text>
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: `2px solid ${formData.role === MemberRole.MEMBER ? '#1677ff' : '#e8e8e8'}`,
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    background: formData.role === MemberRole.MEMBER ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => handleRoleChange(MemberRole.MEMBER)}
                >
                  <div
                    style={{
                      border: `1px solid ${formData.role === MemberRole.MEMBER ? '#1677ff' : '#d9d9d9'}`,
                      padding: 8,
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                      width: 42,
                      height: 42,
                      background: '#fff',
                    }}
                  >
                    <IconUser size={24} color="#1677ff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong style={{ fontSize: 14, display: 'block' }}>
                      Thành viên
                    </Typography.Text>
                    <Typography.Text style={{ color: '#666', fontSize: 12 }}>
                      Có quyền truy cập và sử dụng các tính năng trong workspace.
                    </Typography.Text>
                  </div>
                </div>
              </Space>
            </div>
          </Space>
        )}

        {/* Step 2: Select Users */}
        {step === 2 && (
          <div
            style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div>
              <Typography.Text
                style={{ color: '#666', fontSize: 13, marginBottom: 6, display: 'block' }}
              >
                Workspace
              </Typography.Text>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CustomAvatar
                  size={24}
                  name={selectWorkspace?.name || ''}
                  src={selectWorkspace?.avatar}
                  style={{ fontSize: 12 }}
                />
                <Typography.Text>{selectWorkspace?.name}</Typography.Text>
              </div>
            </div>

            <div>
              <Typography.Text
                style={{ color: '#666', fontSize: 13, marginBottom: 6, display: 'block' }}
              >
                Vai trò
              </Typography.Text>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {formData.role === MemberRole.ADMIN ? (
                  <>
                    <IconShield size={18} color="#1677ff" />
                    <Typography.Text>Quản trị viên</Typography.Text>
                  </>
                ) : (
                  <>
                    <IconUser size={18} color="#1677ff" />
                    <Typography.Text>Thành viên</Typography.Text>
                  </>
                )}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Typography.Text
                style={{ color: '#666', fontSize: 13, marginBottom: 6, display: 'block' }}
              >
                Mời người dùng qua email
              </Typography.Text>
              <Input
                ref={inputSearch}
                placeholder="Nhập email"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ borderRadius: 8, marginBottom: 8 }}
              />

              {debouncedSearch && (
                <List
                  dataSource={users?.data || []}
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
                  }}
                  renderItem={(user: IUser) => {
                    const isSelected = formData.selectedUsers.some(u => u.id === user.id);
                    const isMember = members?.data?.find((m: any) => m.user.id === user.id);
                    return (
                      <List.Item
                        key={user.id}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          background: isSelected || isMember ? '#f0f7ff' : 'transparent',
                        }}
                        onClick={() => handleSetSelectedUser(user)}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
                        >
                          <Avatar size={24} src={user.avatar} style={{ background: '#1890ff' }}>
                            {user.name?.[0] || 'U'}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Typography.Text style={{ fontSize: 13 }}>{user.name}</Typography.Text>
                            <Typography.Text
                              style={{ fontSize: 11, color: '#999', display: 'block' }}
                            >
                              {user.email}
                            </Typography.Text>
                          </div>
                          {(isSelected || isMember) && <IconCheck size={16} color="#1677ff" />}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              )}

              {formData.selectedUsers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {formData.selectedUsers.map(user => (
                    <Tag
                      key={user.id}
                      closable
                      onClose={() => handleRemoveUser(user.id)}
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      {user.email}
                    </Tag>
                  ))}
                </div>
              )}

              <Typography.Text
                style={{ fontSize: 12, color: '#666', marginTop: 8, display: 'block' }}
              >
                {formData.selectedUsers.length}/20 email
              </Typography.Text>

              {invalidEmails.length > 0 && (
                <Typography.Text
                  style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4, display: 'block' }}
                >
                  ⚠ {invalidEmails.length} email không hợp lệ
                </Typography.Text>
              )}
            </div>
          </div>
        )}

        <Space
          style={{
            width: '100%',
            marginTop: 'auto',
            borderTop: '1px solid #f0f0f0',
            padding: '10px 15px',
            justifyContent: 'space-between',
          }}
        >
          {step === 1 ? (
            <>
              <Button
                type="text"
                style={{
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                }}
                onClick={closeModal}
              >
                Hủy
              </Button>

              <Button
                type="primary"
                style={{
                  borderRadius: 8,
                }}
                onClick={handleProceed}
                disabled={!selectWorkspace}
              >
                Tiếp tục →
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<IconChevronLeft size={16} />}
                style={{
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                }}
                onClick={handleBack}
              >
                Quay lại
              </Button>

              <Button
                type="primary"
                icon={<IconSend size={16} />}
                style={{
                  borderRadius: 8,
                }}
                onClick={handleInvite}
                loading={isInviting}
                disabled={formData.selectedUsers.length === 0 || invalidEmails.length > 0}
              >
                Gửi lời mời
              </Button>
            </>
          )}
        </Space>
      </div>
    </Drawer>
  );
};

export default ModalInviteMember;
