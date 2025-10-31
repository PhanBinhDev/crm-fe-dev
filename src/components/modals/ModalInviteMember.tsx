import { MemberRole } from '@/common/enum/workspace';
import { IUser, IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useCreate, useInvalidate, useList } from '@refinedev/core';
import {
  IconCheck,
  IconChevronUp,
  IconPlus,
  IconSend,
  IconShield,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Drawer,
  Input,
  InputRef,
  List,
  message,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useDebounceValue, useMediaQuery } from 'usehooks-ts';

type FormData = {
  role: MemberRole;
  userIds: IUser[];
};

const ModalInviteMember = () => {
  const { isOpen, type, closeModal, openModal } = useModal();
  const [open, setOpen] = useState(false);
  const [selectWorkspace, setSelectWorkspace] = useState<IWorkspace | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOpenModal = isOpen && type === 'ModalInviteMember';
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    role: MemberRole.ADMIN,
    userIds: [],
  });
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(search.trim(), 400);
  const inputSearch = useRef<InputRef>(null);
  const { workspaces, isLoading, currentWorkspace } = useWorkspaces();
  const { user: currentUser } = useAuth();
  const invalidate = useInvalidate();

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
      setStep(1);
      setFormData({ role: MemberRole.ADMIN, userIds: [] });
      setSearch('');
    }
  }, [isOpenModal]);

  const handleProceed = () => {
    if (step === 1 && selectWorkspace) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSearch('');
      setFormData(prev => ({ ...prev, userIds: [] }));
    }
  };

  const handleSetSelectedUser = (user: IUser) => {
    if (formData.userIds.find(u => u.id === user.id)) return;

    if (members?.data?.find((m: any) => m.user.id === user.id)) {
      message.warning('Người dùng đã là thành viên của workspace');
      return;
    }

    setFormData(prev => ({
      ...prev,
      userIds: [...prev.userIds, user],
    }));
  };

  const handleRemoveUser = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.filter(u => u.id !== userId),
    }));
  };

  console.log('formData', formData);

  const handleInvite = () => {
    if (!selectWorkspace || formData.userIds.length === 0) return;

    const userIds = formData.userIds.map(u => u.id);

    inviteMember(
      {
        resource: `workspaces/${selectWorkspace.id}/invite`,
        values: {
          userIds,
          // role: formData.role
        },
      },
      {
        onSuccess: () => {
          message.success('Gửi lời mời tới thành viên thành công');
          invalidate({
            resource: `workspaces/${selectWorkspace.id}/members`,
            invalidates: ['list', 'many'],
          });
          closeModal();
        },
        onError: () => {
          message.error('Gửi lời mời tới thành viên thất bại, vui lòng thử lại');
        },
      },
    );
  };

  const invalidEmails = formData.userIds.filter(
    user => !user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
  );

  const content = (
    <List
      style={{
        width: '100%',
      }}
    >
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
                style={{
                  fontSize: 12,
                }}
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

  const handleRoleChange = (role: MemberRole) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  return (
    <Drawer
      closeIcon={null}
      open={isOpenModal}
      onClose={closeModal}
      destroyOnHidden
      styles={{
        wrapper: {
          padding: 12,
          width: isMobile ? '100%' : 380,
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
        {step === 1 && (
          <>
            <Space
              align="center"
              style={{
                width: '100%',
                padding: '12px 10px 12px 15px',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                }}
              >
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

              <Popover
                content={content}
                trigger={['click']}
                placement="bottom"
                arrow={false}
                style={{
                  width: '100%',
                }}
                styles={{
                  body: {
                    padding: 8,
                    width: isMobile ? '100%' : 326,
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
                        style={{
                          fontSize: 12,
                        }}
                      />

                      <span style={{ marginLeft: 8 }}>{selectWorkspace.name}</span>
                    </>
                  ) : (
                    'Chọn workspace'
                  )}
                </Button>
              </Popover>

              {/* Select Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                <Typography.Title
                  level={5}
                  style={{
                    margin: 0,
                  }}
                >
                  Chọn vai trò
                </Typography.Title>
                <Space direction="vertical" style={{ width: '100%', gap: 8 }}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${formData.role === MemberRole.ADMIN ? '#1677ff' : '#d9d9d9'}`,
                      display: 'flex',
                      gap: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRoleChange(MemberRole.ADMIN)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f9f9f9';
                      e.currentTarget.style.border = `1px solid ${formData.role === MemberRole.ADMIN ? '#1677ff' : '#d9d9d9'}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = `1px solid ${formData.role === MemberRole.ADMIN ? '#1677ff' : '#d9d9d9'}`;
                    }}
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
                      }}
                    >
                      <IconShield size={24} color="#1677ff" />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, fontSize: 15, userSelect: 'none' }}
                      >
                        Quản trị viên
                      </Typography.Title>
                      <Typography.Text
                        style={{
                          color: '#666',
                          margin: 0,
                          fontSize: 12,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                        }}
                      >
                        Có quyền quản lý thành viên trong workspace
                      </Typography.Text>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${formData.role === MemberRole.MEMBER ? '#1677ff' : '#d9d9d9'}`,
                      display: 'flex',
                      gap: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleRoleChange(MemberRole.MEMBER)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f9f9f9';
                      e.currentTarget.style.border = `1px solid ${formData.role === MemberRole.MEMBER ? '#1677ff' : '#d9d9d9'}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = `1px solid ${formData.role === MemberRole.MEMBER ? '#1677ff' : '#d9d9d9'}`;
                    }}
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
                      }}
                    >
                      <IconUser size={24} color="#1677ff" />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, fontSize: 15, userSelect: 'none' }}
                      >
                        Thành viên
                      </Typography.Title>
                      <Tooltip title="Có quyền truy cập và sử dụng các tính năng trong workspace">
                        <Typography.Text
                          style={{
                            color: '#666',
                            margin: 0,
                            fontSize: 12,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            userSelect: 'none',
                          }}
                        >
                          Có quyền truy cập và sử dụng các tính năng trong workspace
                        </Typography.Text>
                      </Tooltip>
                    </div>
                  </div>
                </Space>
              </div>
            </Space>
          </>
        )}

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
                  }}
                  renderItem={(user: IUser) => {
                    const isSelected = formData.userIds.some(u => u.id === user.id);
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

              {formData.userIds.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    marginTop: 8,
                    border: '1px solid #f0f0f0',
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  {formData.userIds.map(user => (
                    <Tag
                      key={user.id}
                      closable
                      onClose={() => handleRemoveUser(user.id)}
                      style={{ padding: '2px 4px', fontSize: 12 }}
                    >
                      {user.email}
                    </Tag>
                  ))}
                </div>
              )}

              <Typography.Text
                style={{ fontSize: 12, color: '#666', marginTop: 8, display: 'block' }}
              >
                {formData.userIds.length}/20 email
              </Typography.Text>

              {invalidEmails.length > 0 && (
                <Typography.Text
                  style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4, display: 'block' }}
                >
                  {invalidEmails.length} email không hợp lệ
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
                type="text"
                style={{
                  marginLeft: 'auto',
                  background: '#1890ff',
                  borderRadius: 8,
                  color: '#fff',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#40a9ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1890ff';
                }}
                onClick={handleProceed}
                disabled={!selectWorkspace}
              >
                Tiếp tục
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                style={{
                  borderRadius: 8,
                  border: '1px solid #d9d9d9',
                }}
                onClick={handleBack}
              >
                Quay lại
              </Button>

              <Button
                type="text"
                style={{
                  marginLeft: 'auto',
                  background: '#1890ff',
                  borderRadius: 8,
                  color: '#fff',
                }}
                icon={<IconSend size={16} />}
                onClick={handleInvite}
                loading={isInviting}
                disabled={formData.userIds.length === 0 || invalidEmails.length > 0}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#40a9ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1890ff';
                }}
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
