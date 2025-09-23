import { UserRole } from '@/common/enum/user';
import {
  IconAlertCircle,
  IconAward,
  IconBan,
  IconBrandAsana,
  IconCalendar,
  IconCalendarCheck,
  IconCalendarEvent,
  IconChartLine,
  IconClipboardList,
  IconClock,
  IconFileAnalytics,
  IconFileText,
  IconFolderCheck,
  IconFolders,
  IconLayoutDashboard,
  IconPresentation,
  IconProgressCheck,
  IconReport,
  IconSettings,
  IconTarget,
  IconTrophy,
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
    name: 'feedback',
    meta: {
      label: 'Đánh giá sự kiện',
      icon: <IconFolderCheck size={16} />,
      canDelete: true,
      menuPath: '/feedback',
    },
  },
  {
    name: 'my-work',
    meta: {
      label: 'Công việc của tôi',
      icon: <IconTarget size={16} />,
      menuPath: '/my-work',
    },
    children: [
      {
        name: 'assigned-tasks',
        identifier: 'my-work/assigned',
        meta: {
          label: 'Công việc được giao',
          icon: <IconBrandAsana size={14} />,
          parent: 'my-work',
          menuPath: '/my-work/assigned',
        },
      },
      {
        name: 'today-tasks',
        identifier: 'my-work/today',
        meta: {
          label: 'Hôm nay',
          icon: <IconCalendarCheck size={14} />,
          parent: 'my-work',
          menuPath: '/my-work/today',
        },
      },
      {
        name: 'overdue-tasks',
        identifier: 'my-work/overdue',
        meta: {
          label: 'Quá hạn',
          icon: <IconAlertCircle size={14} />,
          parent: 'my-work',
          menuPath: '/my-work/overdue',
        },
      },
      {
        name: 'upcoming-tasks',
        identifier: 'my-work/upcoming',
        meta: {
          label: 'Sắp tới',
          icon: <IconClock size={14} />,
          parent: 'my-work',
          menuPath: '/my-work/upcoming',
        },
      },
      {
        name: 'my-created-tasks',
        identifier: 'my-work/created',
        meta: {
          label: 'Tôi tạo',
          icon: <IconProgressCheck size={14} />,
          parent: 'my-work',
          menuPath: '/my-work/created',
        },
      },
    ],
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
        name: 'exam-papers',
        identifier: 'exams/papers',
        meta: {
          label: 'Đề thi',
          icon: <IconFileText size={14} />,
          parent: 'exams',
          canDelete: true,
          menuPath: '/exams/papers',
        },
      },
      {
        name: 'exam-schedule',
        identifier: 'exams/schedule',
        meta: {
          label: 'Lịch thi',
          icon: <IconCalendar size={14} />,
          parent: 'exams',
          canDelete: true,
          menuPath: '/exams/schedule',
        },
      },
      {
        name: 'exam-results',
        identifier: 'exams/results',
        meta: {
          label: 'Kết quả thi',
          icon: <IconTrophy size={14} />,
          parent: 'exams',
          menuPath: '/exams/results',
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
    name: 'reports',
    meta: {
      label: 'Báo cáo',
      icon: <IconReport size={16} />,
      menuPath: '/reports',
    },
    children: [
      {
        name: 'academic-reports',
        identifier: 'reports/academic',
        meta: {
          label: 'Báo cáo học tập',
          icon: <IconChartLine size={14} />,
          parent: 'reports',
          menuPath: '/reports/academic',
        },
      },
      {
        name: 'teaching-reports',
        identifier: 'reports/teaching',
        meta: {
          label: 'Báo cáo giảng dạy',
          icon: <IconClipboardList size={14} />,
          parent: 'reports',
          menuPath: '/reports/teaching',
        },
      },
      {
        name: 'department-reports',
        identifier: 'reports/department',
        meta: {
          label: 'Báo cáo bộ môn',
          icon: <IconFileAnalytics size={14} />,
          parent: 'reports',
          menuPath: '/reports/department',
        },
      },
      {
        name: 'semester-reports',
        identifier: 'reports/semester',
        meta: {
          label: 'Báo cáo kỳ học',
          icon: <IconAward size={14} />,
          parent: 'reports',
          menuPath: '/reports/semester',
        },
      },
      {
        name: 'activity-reports',
        identifier: 'reports/activities',
        meta: {
          label: 'Báo cáo hoạt động',
          icon: <IconBan size={14} />,
          parent: 'reports',
          menuPath: '/reports/activities',
        },
      },
    ],
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
  const baseResources = ['dashboard', 'workspaces', 'my-work', 'teachers', 'feedback'];

  switch (role) {
    case UserRole.GV:
      return resources.filter(resource => baseResources.includes(resource.name));

    case UserRole.CNBM:
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

// Utility function để set workspace
export const setCurrentWorkspace = (workspaceId: string): void => {
  localStorage.setItem('currentWorkspace', workspaceId);
};
