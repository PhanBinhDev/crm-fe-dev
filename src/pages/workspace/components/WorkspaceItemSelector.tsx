import { IWorkspace } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useCustomMutation, useNavigation } from '@refinedev/core';
import { IconChevronDown, IconSettings, IconShare } from '@tabler/icons-react';
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
  Tooltip,
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

  const { mutate: updateWorkspace } = useCustomMutation();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleUpdateWorkspace = async (file: File) => {
    if (!file || !currentWorkspace?.id) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('name', currentWorkspace?.name || '');
    formData.append('visibility', currentWorkspace?.visibility || '');

    updateWorkspace(
      {
        url: `/workspaces/${currentWorkspace?.id}`,
        method: 'patch',
        values: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } },
      },
      {
        onSuccess: res => {
          const newAvatar = res?.data?.avatar;
          if (newAvatar) {
            setAvatarPreview(newAvatar);
          }
          message.success('Cập nhật avatar thành công');
          refreshWorkspaces();
        },
        onError: () => {
          message.error('Cập nhật avatar thất bại');
        },
      },
    );
  };

  const handleWorkspaceSelect = (workspace: IWorkspace) => {
    switchWorkspace(workspace.id);
    // reload page

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
        }}
      >
        <Avatar
          size={size}
          style={{
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getInitials(workspace?.name) ? '#fff' : '#000',
            fontSize: size / 2,
            background: getColorFromName(workspace?.name),
            border: 'none',
          }}
        >
          {workspace?.name?.charAt(0).toUpperCase() || 'W'}
        </Avatar>
      </div>
    );
  };

  const selectWorkspaceContent = (
    <Card
      styles={{
        body: {
          padding: '5px',
        },
      }}
    >
      <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
        <Space>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              size={35}
              src={avatarPreview || currentWorkspace?.avatar}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: getColorFromName(currentWorkspace?.name),
                border: 'none',
              }}
              onClick={() => document.getElementById('workspace-avatar-input')?.click()}
            >
              {!avatarPreview && !currentWorkspace?.avatar && (
                <>{currentWorkspace?.name?.[0]?.toUpperCase() || 'W'}</>
              )}
            </Avatar>
            <input
              id="workspace-avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleUpdateWorkspace(file);
              }}
            />
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
              {currentWorkspace?.membersCount} thành viên
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
              push(`/settings/workspaces/${currentWorkspace?.id}`);
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
          <Button
            type="text"
            style={{
              width: '100%',
              border: '1px solid #d9d9d9',
            }}
            onClick={() => {
              openModal('WorkspaceShareModal', {
                workspaceId: currentWorkspace,
              });
              setOpen(false);
            }}
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
            icon={<IconShare size={14} />}
          >
            Chia sẻ
          </Button>
        </Space>
      </Space>
      <Divider
        style={{
          margin: 0,
        }}
      />
      <Space direction="vertical" style={{ width: '100%', padding: 8 }}>
        {workspaces.length > 1 ? (
          <List
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              width: '100%',
            }}
          >
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
                    marginBottom: workspace.id !== workspaces[workspaces.length - 1].id ? 4 : 0,
                    border: 0,
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
            width: 310,
          },
        }}
        trigger={['click']}
        placement="bottomRight"
        arrow={false}
        content={selectWorkspaceContent}
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
                  {!currentWorkspace?.name
                    ? 'Chọn workspace'
                    : currentWorkspace?.name.length > 19
                      ? `${currentWorkspace?.name.slice(0, 19)}...`
                      : currentWorkspace?.name}
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
