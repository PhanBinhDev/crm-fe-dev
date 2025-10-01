import { IWorkspace } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useCustomMutation, useNavigation } from '@refinedev/core';
import { IconCamera, IconChevronDown, IconSettings } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  message,
  Popover,
  Skeleton,
  Space,
  Spin,
  Tooltip,
  Upload,
} from 'antd';
import { useState } from 'react';

interface WorkspaceItemSelectorProps {
  collapsed?: boolean;
}

const WorkspaceItemSelector = ({ collapsed }: WorkspaceItemSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { openModal } = useModal();
  const { push } = useNavigation();
  const { workspaces, currentWorkspace, isLoading, switchWorkspace, refreshWorkspaces } =
    useWorkspaces();

  const { mutate: updateWorkspace, isPending: isUpdating } = useCustomMutation();

  const handleUpdateWorkspace = async (option: any) => {
    const formData = new FormData();
    formData.append('avatar', option.file as Blob);
    formData.append('name', currentWorkspace?.name as string);
    formData.append('visibility', currentWorkspace?.visibility as string);

    updateWorkspace(
      {
        url: '/workspaces/' + currentWorkspace?.id,
        method: 'patch',
        values: formData,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật avatar thành công');
          refreshWorkspaces();
          setOpen(false);
        },
        onError: () => {
          message.error('Cập nhật avatar thất bại');
        },
      },
    );
  };

  const handleWorkspaceSelect = (workspace: IWorkspace) => {
    switchWorkspace(workspace.id);
    setOpen(false);
  };

  const renderWorkspaceAvatar = (workspace: IWorkspace, size: number = 24) => {
    if (workspace?.avatar && typeof workspace.avatar === 'string') {
      const avatarUrl = workspace.avatar.startsWith('http')
        ? workspace.avatar
        : `${import.meta.env.VITE_API_BASE_URL}${workspace.avatar}`;

      return <Avatar size={size} src={avatarUrl} />;
    }

    return (
      <div
        style={{
          padding: 2,
          borderRadius: 4,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Avatar
          size={size}
          style={{
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'oklch(27.4% 0.006 286.033)',
          }}
        >
          {workspace?.name?.charAt(0).toUpperCase() || 'W'}
        </Avatar>
      </div>
    );
  };

  const priorityContent = (
    <Card
      styles={{
        body: {
          padding: '10px 5px',
          width: '230px',
        },
      }}
    >
      <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
        <Space>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Upload
              name="avatar"
              showUploadList={false}
              accept=".jpg,.jpeg,.png"
              disabled={isUpdating}
              customRequest={handleUpdateWorkspace}
            >
              {renderWorkspaceAvatar(currentWorkspace!, 35)}
              {isUpdating && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Spin />
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <IconCamera size={24} color="#fff" stroke={1.5} />
              </div>
            </Upload>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: '#000',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: 200,
                lineHeight: 1.2,
              }}
            >
              {`${currentWorkspace?.name.charAt(0).toLocaleUpperCase()}${currentWorkspace?.name.slice(1)}`}
            </span>

            <span
              style={{
                fontSize: 12,
                color: '#666',
              }}
            >
              1 thành viên
            </span>
          </div>
        </Space>
        <Space
          style={{ display: 'flex', gap: '8px', width: '100%' }}
          styles={{
            item: {
              flex: 1,
            },
          }}
        >
          <Button
            type="text"
            style={{
              flex: 1,
              border: '1px solid #d9d9d9',
              gap: 4,
              width: '100%',
            }}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            onClick={() => {
              setOpen(false);
              push(`/workspaces/${currentWorkspace?.id}/settings`);
            }}
            icon={<IconSettings size={14} />}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#d9d9d9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cài đặt
          </Button>
          {/* <Button
            type="text"
            style={{
              width: '100%',
              border: '1px solid #d9d9d9',
            }}
            onClick={() => setOpen(false)}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#d9d9d9';
            }}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            icon={<IconUsers size={14} />}
          >
            Thành viên
          </Button> */}
        </Space>
      </Space>
      <Divider
        style={{
          margin: 0,
        }}
      />
      <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
        <List>
          {workspaces.length > 1 ? (
            <List>
              {workspaces
                .filter(workspace => workspace.id !== currentWorkspace?.id)
                .map(workspace => (
                  <List.Item
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Space>
                      {renderWorkspaceAvatar(workspace, 24)}
                      <span>{workspace.name}</span>
                    </Space>
                  </List.Item>
                ))}
            </List>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                color: '#888',
                background: '#f5f5f5',
                borderRadius: 6,
              }}
            >
              Không còn workspace nào khác.
            </div>
          )}
        </List>
        <Button
          type="primary"
          style={{ width: '100%' }}
          onClick={() => {
            openModal('ModalAddWorkspace');
            setOpen(false);
          }}
        >
          Tạo workspace mới
        </Button>
      </Space>
    </Card>
  );

  if (isLoading) {
    return (
      <div
        style={{
          padding: '2px 8px 10px',
          borderBottom: '1px solid #414040',
        }}
      >
        <Skeleton.Button
          active
          style={{
            borderRadius: 8,
            width: collapsed ? '48px' : '216px',
            backgroundColor: '#ffffff14',
            height: 36,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2px 8px 10px',
        borderBottom: '1px solid #414040',
      }}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        styles={{
          body: {
            padding: 0,
            width: 230,
            marginLeft: 35,
          },
        }}
        trigger={['click']}
        placement="bottomLeft"
        arrow={false}
        content={priorityContent}
      >
        <Tooltip title={!collapsed ? null : 'Lựa chọn workspace'} placement="right">
          <Button
            style={{
              borderRadius: 8,
              gap: 4,
              border: 'none',
              outline: 'none',
              width: collapsed ? '48px' : '216px',
              padding: '0 8px',
              height: 36,
              background: '#1890ff',
              boxShadow: 'none',
              overflow: 'hidden',
              color: '#fff',
              justifyContent: collapsed ? 'center' : 'space-between',
            }}
            ghost={false}
            loading={isLoading}
            styles={{
              icon: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            icon={
              !collapsed && (
                <IconChevronDown
                  size={14}
                  color="#fff"
                  style={{
                    transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              )
            }
            iconPosition="end"
          >
            <Space
              style={{
                gap: 4,
              }}
            >
              {renderWorkspaceAvatar(currentWorkspace!, 24)}
              {!collapsed && (
                <span style={{ fontWeight: 500 }}>
                  {currentWorkspace?.name || 'Chọn workspace'}
                </span>
              )}
            </Space>
          </Button>
        </Tooltip>
      </Popover>
    </div>
  );
};

export default WorkspaceItemSelector;
