import { useList, useNavigation } from '@refinedev/core';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, Select, theme } from 'antd';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/shared/Header';
import { getResourcesByRole, ResourceConfig } from '@/config/resources';
import styles from '@/styles/custom-layout.module.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { IconPlus } from '@tabler/icons-react';
import { useModal } from '@/hooks/useModal';
import * as TablerIcons from '@tabler/icons-react';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface CustomLayoutProps {
  children: React.ReactNode;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const { push } = useNavigation();
  const location = useLocation();
  const { data: workspaces, isLoading: workspacesLoading } = useList({
    resource: 'workspaces/mine',
    config: {
      pagination: { mode: 'off' },
    },
    queryOptions: {
      enabled: location.pathname.startsWith('/workspaces'),
    },
  });

  const workspaceOptions = useMemo(() => {
    if (workspacesLoading) return [];
    return (
      workspaces?.data.map(workspace => ({
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hiện icon Tabler nếu có */}
            {workspace.icon && TablerIcons[workspace.icon] ? (
              React.createElement(TablerIcons[workspace.icon], {
                size: 22,
                style: { color: '#1890ff', marginRight: 4 },
              })
            ) : (
              <span
                style={{
                  width: 22,
                  height: 22,
                  display: 'inline-block',
                  background: '#eee',
                  borderRadius: 6,
                  marginRight: 4,
                }}
              />
            )}
            <span style={{ fontWeight: 600 }}>{workspace.name}</span>
          </div>
        ),
        value: workspace.id,
      })) || []
    );
  }, [workspaces, workspacesLoading]);

  const resourcesByRole = useCallback(() => {
    if (!user) return [];
    return getResourcesByRole(user?.role);
  }, [user?.role, isLoading, getResourcesByRole]);

  const getSelectedKeyFromPath = (pathname: string) => {
    if (pathname === '/' || pathname === '/dashboard') return ['dashboard'];

    for (const resource of resourcesByRole()) {
      if (resource.meta?.menuPath === pathname) {
        return [resource.name];
      }
      if (resource.children) {
        for (const child of resource.children) {
          if (child.meta?.menuPath === pathname) {
            return [child.identifier || child.name];
          }
        }
      }
    }

    const pathSegments = pathname.split('/').filter(Boolean);

    for (const resource of resourcesByRole()) {
      const resourcePath = resource.meta?.menuPath?.split('/').filter(Boolean) || [];
      if (resourcePath.length > 0 && pathSegments[0] === resourcePath[0]) {
        if (resource.children && pathSegments.length > 1) {
          const subPath = `/${pathSegments.slice(0, 2).join('/')}`;
          const child = resource.children.find(c => c.meta?.menuPath === subPath);
          if (child) {
            return [child.identifier || child.name];
          }
        }
        if (pathSegments.length > 1) {
          const action = pathSegments[1];
          if (['show', 'edit', 'create'].includes(action)) {
            return [resource.name];
          }
        }
        return [resource.name];
      }
      if (resource.children) {
        for (const child of resource.children) {
          const childPath = child.meta?.menuPath?.split('/').filter(Boolean) || [];
          if (
            childPath.length >= 2 &&
            pathSegments[0] === childPath[0] &&
            pathSegments[1] === childPath[1]
          ) {
            return [child.identifier || child.name];
          }
        }
      }
    }

    return [];
  };

  const getOpenKeysFromPath = (pathname: string) => {
    for (const resource of resourcesByRole()) {
      if (resource.children) {
        for (const child of resource.children) {
          if (child.meta?.menuPath === pathname) {
            return [resource.name];
          }
          const pathSegments = pathname.split('/').filter(Boolean);
          const childPath = child.meta?.menuPath?.split('/').filter(Boolean) || [];
          if (
            childPath.length >= 2 &&
            pathSegments[0] === childPath[0] &&
            pathSegments[1] === childPath[1]
          ) {
            return [resource.name];
          }
        }
      }
    }
    return [];
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuItem[] = useMemo(() => {
    const generateMenuItem = (resourceConfig: ResourceConfig): MenuItem => {
      const { name, meta, children } = resourceConfig;

      if (children && children.length > 0) {
        return {
          key: name,
          icon: meta?.icon,
          label: meta?.label || name,
          children: children.map((child: any) => ({
            key: child.identifier || child.name,
            icon: child.meta?.icon,
            label: child.meta?.label || child.name,
          })),
        };
      }

      return {
        key: name,
        icon: meta?.icon,
        label: meta?.label || name,
      };
    };

    return resourcesByRole().map(generateMenuItem);
  }, [user?.role, isLoading, getResourcesByRole]);

  const breadcrumbItems = useMemo(() => {
    const items: {
      title: string;
      href?: string;
    }[] = [{ title: 'Trang chủ', href: '/' }];

    const pathname = location.pathname;

    if (pathname === '/profile') {
      items.push({ title: 'Hồ sơ cá nhân' });
      return items;
    }

    let currentResource = null;
    let parentResource = null;

    for (const resource of resourcesByRole()) {
      if (resource.meta?.menuPath === pathname) {
        currentResource = resource;
        break;
      }

      if (resource.children) {
        const child = resource.children.find(c => c.meta?.menuPath === pathname);
        if (child) {
          parentResource = resource;
          currentResource = child;
          break;
        }
      }
    }

    if (!currentResource) {
      const pathSegments = pathname.split('/').filter(Boolean);

      for (const resource of resourcesByRole()) {
        const resourcePath = resource.meta?.menuPath?.split('/').filter(Boolean) || [];
        if (resourcePath.length > 0 && pathSegments[0] === resourcePath[0]) {
          currentResource = resource;

          // Kiểm tra action
          if (pathSegments.length > 1) {
            const action = pathSegments[1];
            if (['show', 'edit', 'create'].includes(action)) {
              items.push({
                title: resource.meta?.label || resource.name,
                href: resource.meta?.menuPath,
              });

              let actionTitle = action;
              switch (action) {
                case 'show':
                  actionTitle = 'Chi tiết';
                  break;
                case 'create':
                  actionTitle = 'Tạo mới';
                  break;
                case 'edit':
                  actionTitle = 'Chỉnh sửa';
                  break;
              }

              items.push({ title: actionTitle });
              return items;
            }
          }
          break;
        }
      }
    }

    if (currentResource) {
      if (parentResource) {
        items.push({
          title: parentResource.meta?.label || parentResource.name,
          href: parentResource.meta?.menuPath,
        });
      }

      items.push({
        title: currentResource.meta?.label || currentResource.name,
        href: currentResource.meta?.menuPath,
      });
    }

    return items;
  }, [location.pathname, resourcesByRole]);

  const selectedKeys = useMemo(() => {
    return getSelectedKeyFromPath(location.pathname);
  }, [location.pathname]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const newOpenKeys = getOpenKeysFromPath(location.pathname);
    setOpenKeys(newOpenKeys);
  }, [location.pathname]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
  };

  const handleMenuClick: MenuProps['onClick'] = e => {
    const key = e.key;

    if (key === 'dashboard') {
      push('/');
      return;
    }

    // Tìm resource config
    const findResourceConfig = (searchKey: string): ResourceConfig | null => {
      for (const res of resourcesByRole()) {
        if (res.name === searchKey) return res;
        if (res.children) {
          const found = res.children.find(
            (child: any) => (child.identifier || child.name) === searchKey,
          );
          if (found) return found;
        }
      }
      return null;
    };

    const resourceConfig = findResourceConfig(key);

    if (resourceConfig && resourceConfig.list) {
      push(resourceConfig.list);
    } else {
      push(`/${key}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 100,
          transition: 'all 0.2s ease-in-out',
        }}
        width={240}
        collapsedWidth={72}
        breakpoint="lg"
      >
        <Link
          to="/"
          style={{
            height: 64,
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            margin: '0 0 8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#fff',
            transition: 'all 0.3s ease',
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: collapsed ? '26px' : '32px',
              marginRight: collapsed ? '0' : '8px',
              transition: 'all 0.3s ease',
            }}
          />
          {!collapsed && (
            <span
              style={{
                fontSize: '18px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              CRM CNTT
            </span>
          )}
        </Link>

        {location.pathname.startsWith('/workspaces') && (
          <div
            style={{
              padding: collapsed ? '12px 8px' : '16px 16px 8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          ></div>
        )}
        <Menu
          theme="dark"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.sideMenu}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 72 : 240,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5',
        }}
      >
        <AppHeader />
        <Content
          style={{
            margin: '24px 16px',
            padding: '24px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            overflow: 'auto',
            marginTop: 80,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              marginBottom: 24,
            }}
          >
            <Breadcrumb
              itemRender={(route, _, routes) => {
                const isLast = routes.indexOf(route) === routes.length - 1;
                return isLast ? (
                  <span>{route.title}</span>
                ) : (
                  <a
                    href={route.href}
                    onClick={e => {
                      e.preventDefault();
                      if (route.href) {
                        push(route.href);
                      }
                    }}
                  >
                    {route.title}
                  </a>
                );
              }}
              items={breadcrumbItems}
            />
          </div>
          <div
            style={{
              minHeight: 'calc(100vh - 280px)',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
