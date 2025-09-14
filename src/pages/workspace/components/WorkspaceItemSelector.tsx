import { IWorkspace } from '@/common/types';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { IconChevronDown } from '@tabler/icons-react';
import { Avatar, Button, Popover, Space, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

interface WorkspaceItemSelectorProps {
  collapsed?: boolean;
}

const WorkspaceItemSelector = ({ collapsed }: WorkspaceItemSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [tablerIcons, setTablerIcons] = useState<Record<string, React.FC<any>>>({});

  const { workspaces, currentWorkspace, isLoading, switchWorkspace } = useWorkspaces();

  const handleWorkspaceSelect = (workspace: IWorkspace) => {
    switchWorkspace(workspace.id);
    setOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('@tabler/icons-react');
        if (mounted) {
          const iconMap = Object.entries(mod).reduce(
            (acc, [key, comp]) => {
              if (
                key.startsWith('Icon') &&
                (typeof comp === 'function' ||
                  (typeof comp === 'object' && comp !== null && 'render' in comp))
              ) {
                acc[key] = comp as React.FC<any>;
              }
              return acc;
            },
            {} as Record<string, React.FC<any>>,
          );
          setTablerIcons(iconMap);
        }
      } catch (e) {
        console.error('Failed to load tabler icons', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const priorityContent = <div>OK</div>;

  const renderWorkspaceAvatar = (workspace: IWorkspace, size: number = 24) => {
    if (workspace?.avatar) {
      return <Avatar size={size} src={workspace.avatar} />;
    } else if (workspace?.icon) {
      const IconComponent = tablerIcons[workspace.icon];

      return (
        <Avatar
          size={size}
          icon={<IconComponent size={16} />}
          style={{ backgroundColor: '#1890ff' }}
        />
      );
    } else {
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
    }
  };

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
            padding: '8px 0',
            width: 185,
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
