import { getResourcesByRole } from '@/config/resources';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@refinedev/core';
import { Breadcrumb } from 'antd';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const CustomBreadcrumb = () => {
  const { user, isLoading } = useAuth();
  const { push } = useNavigation();
  const location = useLocation();
  const resourcesByRole = useCallback(() => {
    if (!user || isLoading) return [];
    return getResourcesByRole(user?.role);
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

    if (pathname.startsWith('/workspaces/')) {
      const segments = pathname.split('/').filter(Boolean);

      items.push({
        title: 'Workspaces',
        href: `/workspaces/${segments[1]}`,
      });

      if (segments.length > 2) {
        // For settings or any other workspace sub-path
        const lastSegment = segments[segments.length - 1];

        // Capitalize first letter for better presentation
        const formattedSegment = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
        items.push({
          title: formattedSegment,
        });
      }

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

  return (
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
  );
};

export default CustomBreadcrumb;
