import { useNavigation } from '@refinedev/core';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import React, { useState, useMemo, useEffect } from 'react';
import { AppHeader } from '@/components/shared/header';
import { ResourceConfig, resources } from '@/config/resources';
import styles from '@/styles/custom-layout.module.css';
import { Link, useLocation } from 'react-router-dom';

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface CustomLayoutProps {
  children: React.ReactNode;
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { push } = useNavigation();
  const location = useLocation();

  const getSelectedKeyFromPath = (pathname: string) => {
    // Xử lý dashboard
    if (pathname === '/') return ['dashboard'];

    const paths = pathname.slice(1).split('/');

    // Tìm resource config dựa trên pathname
    const findResourceByPath = (path: string): any => {
      for (const res of resources) {
        // Kiểm tra resource cha
        if (res.list === path || res.name === paths[0]) {
          return { key: res.name };
        }
        // Kiểm tra resource con
        if (res.children) {
          const child = res.children.find(
            (c: any) => c.list === path || c.name === paths[0] || c.identifier === paths[0],
          );
          if (child) {
            return { key: child.identifier || child.name };
          }
        }
      }
      return null;
    };

    const resource = findResourceByPath('/' + paths[0]);
    return resource ? [resource.key] : [paths[0]];
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Tự động generate menu items từ resources config
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

      // Menu item thông thường
      return {
        key: name,
        icon: meta?.icon,
        label: meta?.label || name,
      };
    };

    const resourceItems = resources.map(generateMenuItem);

    return resourceItems;
  }, []);

  // Tự động generate breadcrumb từ current resource
  const breadcrumbItems = useMemo(() => {
    const items: {
      title: string;
      href?: string;
    }[] = [{ title: 'Trang chủ', href: '/' }];

    const pathname = location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);

    // Xử lý breadcrumb dựa trên URL segments
    if (pathSegments.length > 0) {
      const resourceName = pathSegments[0];

      // Tìm resource config
      const findResourceByName = (name: string): any => {
        for (const res of resources) {
          if (res.name === name) return res;
          if (res.children) {
            const found = res.children.find((child: any) => child.name === name);
            if (found) return { parent: res, child: found };
          }
        }
        return null;
      };

      const foundResource = findResourceByName(resourceName);

      if (foundResource) {
        if (foundResource.parent) {
          // Resource con
          items.push({
            title: foundResource.parent.meta?.label || foundResource.parent.name,
            href: foundResource.parent.list,
          });
          items.push({
            title: foundResource.child.meta?.label || foundResource.child.name,
            href: foundResource.child.list,
          });
        } else {
          // Resource chính
          items.push({
            title: foundResource.meta?.label || foundResource.name,
            href: foundResource.list,
          });

          // Xử lý action (show, create, edit)
          if (pathSegments.length > 1) {
            const action = pathSegments[1];
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
              default:
                actionTitle = action;
            }

            items.push({
              title: actionTitle,
            });
          }
        }
      }
    }

    return items;
  }, [location.pathname]);

  const { initialOpenKeys, selectedKeys } = useMemo(() => {
    const pathname = location.pathname;
    const currentSelectedKeys = getSelectedKeyFromPath(pathname);

    let parentKey = null;
    const findParentKey = (path: string) => {
      // Bỏ dấu / đầu tiên
      const currentPath = path.slice(1);

      for (const res of resources) {
        if (res.children) {
          // Kiểm tra xem path hiện tại có match với list path của child resource không
          const hasChild = res.children.some(
            (child: any) => child.list?.slice(1) === currentPath || child.name === currentPath,
          );
          if (hasChild) {
            return res.name;
          }
        }
      }
      return null;
    };

    // Tìm parent key dựa vào pathname
    parentKey = findParentKey(pathname);

    return {
      initialOpenKeys: parentKey ? [parentKey] : [],
      selectedKeys: currentSelectedKeys,
    };
  }, [location.pathname, resources]);

  const [currentOpenKeys, setCurrentOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (initialOpenKeys.length > 0) {
      setCurrentOpenKeys(prev => {
        const newKeys = [...new Set([...prev, ...initialOpenKeys])];
        return newKeys;
      });
    }
  }, [initialOpenKeys]);

  const handleOpenChange = (keys: string[]) => {
    setCurrentOpenKeys(keys);
  };

  // Tự động handle menu click
  const handleMenuClick: MenuProps['onClick'] = e => {
    const key = e.key;

    if (key === 'dashboard') {
      push('/');
      return;
    }

    const findResourceConfig = (name: string): any => {
      for (const res of resources) {
        if (res.name === name) return res;
        if (res.children) {
          const found = res.children.find((child: any) => child.name === name);
          if (found) return found;
        }
      }
      return null;
    };

    const resourceConfig = findResourceConfig(key);

    console.log('Resource config found:', resourceConfig);

    if (resourceConfig) {
      push(resourceConfig.list || `/${key}`);
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
        collapsedWidth={80}
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
        <Menu
          theme="dark"
          selectedKeys={selectedKeys}
          openKeys={currentOpenKeys}
          onOpenChange={handleOpenChange}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.sideMenu}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
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
          }}
        >
          <Breadcrumb
            style={{ marginBottom: 24 }}
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
          <div
            style={{
              minHeight: 'calc(100vh - 280px)',
            }}
          >
            {children}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
            padding: '16px',
          }}
        >
          CRM CNTT ©{new Date().getFullYear()} Khoa Công nghệ Thông tin
        </Footer>
      </Layout>
    </Layout>
  );
};
