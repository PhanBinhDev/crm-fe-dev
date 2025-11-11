import { UserRole } from '@/common/enum/user';
import {
  IconArchive,
  IconCalendarEvent,
  IconFileText,
  IconFolders,
  IconLayoutDashboard,
  IconPresentation,
  IconSettings,
} from '@tabler/icons-react';

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
    menuPath?: string;
  };
  children?: ResourceConfig[];
}

export const resources: ResourceConfig[] = [
  {
    name: 'dashboard',
    meta: {
      label: 'Tổng quan',
      icon: <IconLayoutDashboard size={16} />,
      menuPath: '/dashboard',
    },
  },
  {
    name: 'workspaces',
    meta: {
      label: 'Workspaces',
      icon: <IconFolders size={16} />,
      canDelete: true,
      menuPath: '/workspaces',
    },
  },
  {
    name: 'semester-management',
    list: '/semesters/list',
    create: '/semesters/create',
    edit: '/semesters/edit/:id',
    show: '/semesters/show/:id',
    meta: {
      label: 'Quản lý kỳ học',
      icon: <IconCalendarEvent size={16} />,
      menuPath: '/semesters',
    },
  },
  {
    name: 'exams',
    meta: {
      label: 'Quản lý đề thi',
      icon: <IconFileText size={16} />,
      menuPath: '/exams',
    },
    children: [
      {
        name: 'exam-bank',
        identifier: 'exams/bank',
        meta: {
          label: 'Ngân hàng đề thi',
          icon: <IconArchive size={14} />,
          parent: 'exams',
          menuPath: '/exams/bank',
        },
      },
      {
        name: 'exam-papers',
        identifier: 'exams/random',
        meta: {
          label: 'Đề thi',
          icon: <IconFileText size={14} />,
          parent: 'exams',
          canDelete: true,
          menuPath: '/exams/random',
        },
      },
    ],
  },
  {
    name: 'teachers',
    meta: {
      label: 'Giáo viên',
      icon: <IconPresentation size={16} />,
      canDelete: true,
      menuPath: '/teachers',
    },
  },
  {
    name: 'settings',
    meta: {
      label: 'Cài đặt',
      icon: <IconSettings size={16} />,
      menuPath: '/settings',
    },
  },
];

export const getResourcesByRole = (role: UserRole): ResourceConfig[] => {
  const baseResources = ['dashboard', 'workspaces', 'my-work', 'teachers', 'exams', 'settings'];

  switch (role) {
    case UserRole.GV:
      return resources.filter(resource => baseResources.includes(resource.name));

    case UserRole.CNBM:
    case UserRole.SUPERADMIN:
      return resources.filter(
        resource =>
          baseResources.includes(resource.name) ||
          ['reports', 'semester-management'].includes(resource.name),
      );

    case UserRole.TM:
      return resources;

    default:
      return resources.filter(resource => baseResources.includes(resource.name));
  }
};

export const setCurrentWorkspace = (workspaceId: string): void => {
  localStorage.setItem('currentWorkspace', workspaceId);
};
