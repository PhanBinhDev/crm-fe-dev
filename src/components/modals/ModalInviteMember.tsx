import { MemberRole } from '@/common/enum/workspace';
import { IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import {
  IconCheck,
  IconChevronUp,
  IconPlus,
  IconShield,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { Button, Drawer, List, Popover, Space, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

type FormData = {
  role: MemberRole;
  userIds: string[];
};

const ModalInviteMember = () => {
  const { isOpen, type, closeModal, openModal } = useModal();
  const [open, setOpen] = useState(false);
  const [selectWorkspace, setSelectWorkspace] = useState<IWorkspace | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOpenModal = isOpen && type === 'ModalInviteMember';
  const [formData, setFormData] = useState<FormData>({
    role: MemberRole.ADMIN,
    userIds: [],
  });

  const { workspaces, isLoading, currentWorkspace } = useWorkspaces();

  useEffect(() => {
    if (currentWorkspace && isOpenModal) {
      setSelectWorkspace(currentWorkspace);
    }
  }, [workspaces, currentWorkspace, isOpenModal]);

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

        <Space
          style={{
            width: '100%',
            marginTop: 'auto',
            borderTop: '1px solid #f0f0f0',
            padding: '10px 15px',
            justifyContent: 'space-between',
          }}
        >
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
          >
            Tiếp tục
          </Button>
        </Space>
      </div>
    </Drawer>
  );
};

export default ModalInviteMember;
