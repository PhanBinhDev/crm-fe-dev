import {
  UserOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  ProjectOutlined,
  PieChartOutlined,
  FileOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

export interface ResourceConfig {
  name: string;
  list?: string;
  create?: string;
  edit?: string;
  show?: string;
  identifier?: string;
  meta?: {
    label?: string;
    icon?: React.ReactNode;
    canDelete?: boolean;
    parent?: string;
  };
  children?: ResourceConfig[];
}

export const resources: ResourceConfig[] = [
  {
    name: 'dashboard',
    list: '/dashboard',
    meta: {
      label: 'Dashboard',
      icon: <PieChartOutlined />,
    },
  },
  {
    name: 'activities',
    list: '/activities',
    create: '/activities/create',
    edit: '/activities/edit/:id',
    show: '/activities/show/:id',
    meta: {
      label: 'Nhiệm vụ',
      icon: <CheckSquareOutlined />,
      canDelete: true,
    },
  },
  {
    name: 'semesters',
    list: '/semesters',
    create: '/semesters/create',
    edit: '/semesters/edit/:id',
    show: '/semesters/show/:id',
    meta: {
      label: 'Kỳ Học',
      icon: <ScheduleOutlined />,
      canDelete: true,
    },
  },
  {
    name: 'users',
    list: '/users',
    create: '/users/create',
    edit: '/users/edit/:id',
    show: '/users/show/:id',
    meta: {
      label: 'Người dùng',
      icon: <UserOutlined />,
      canDelete: true,
    },
  },
  {
    name: 'stages',
    list: '/stages',
    create: '/stages/create',
    edit: '/stages/edit/:id',
    show: '/stages/show/:id',
    meta: {
      label: 'Giai đoạn',
      icon: <ProjectOutlined />,
      canDelete: true,
    },
  },
  {
    name: 'reports',
    list: '/reports',
    meta: {
      label: 'Báo cáo',
      icon: <FileOutlined />,
    },
    children: [
      {
        name: 'activity-reports',
        list: '/reports/activities',
        identifier: 'reports/activities',
        meta: {
          label: 'Báo cáo nhiệm vụ',
          icon: <ProjectOutlined style={{ fontSize: '14px' }} />,
          parent: 'reports',
        },
      },
      {
        name: 'user-reports',
        list: '/reports/users',
        identifier: 'reports/users',
        meta: {
          label: 'Báo cáo người dùng',
          icon: <UserOutlined style={{ fontSize: '14px' }} />,
          parent: 'reports',
        },
      },
      {
        name: 'performance-reports',
        list: '/reports/performance',
        identifier: 'reports/performance',
        meta: {
          label: 'Báo cáo hiệu suất',
          icon: <PieChartOutlined style={{ fontSize: '14px' }} />,
          parent: 'reports',
        },
      },
    ],
  },
  {
    name: 'settings',
    list: '/settings',
    meta: {
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
  },
];

// Utility functions để làm việc với resources
export const findResourceByName = (
  name: string,
  resourcesList = resources,
): ResourceConfig | null => {
  for (const resource of resourcesList) {
    if (resource.name === name) return resource;
    if (resource.children) {
      const found = resource.children.find(child => child.name === name);
      if (found) return found;
    }
  }
  return null;
};

export const findResourceWithParent = (name: string, resourcesList = resources) => {
  for (const resource of resourcesList) {
    if (resource.name === name) return { resource, parent: null };
    if (resource.children) {
      const found = resource.children.find(child => child.name === name);
      if (found) return { resource: found, parent: resource };
    }
  }
  return { resource: null, parent: null };
};

export const getResourcePath = (resourceName: string): string => {
  const resource = findResourceByName(resourceName);
  return resource?.list || `/${resourceName}`;
};

export const getAllResourceNames = (resourcesList = resources): string[] => {
  const names: string[] = [];
  resourcesList.forEach(resource => {
    names.push(resource.name);
    if (resource.children) {
      resource.children.forEach(child => {
        names.push(child.name);
      });
    }
  });
  return names;
};
