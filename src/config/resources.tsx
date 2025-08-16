import { UserRole } from '@/common/enum/user';
import {
  IconLayoutDashboard,
  IconSchool,
  IconBook,
  IconCalendarEvent,
  IconFileText,
  IconUsers,
  IconSettings,
  IconReport,
  IconClipboardList,
  IconFileAnalytics,
  IconPresentation,
  IconCalendar,
  IconBookmark,
  IconUserCheck,
  IconAward,
  IconChartLine,
  IconNotebook,
  IconTrophy,
  IconBan,
  IconCalendarCheck,
  IconClock,
  IconAlertCircle,
  IconBrandAsana,
  IconFolders,
  IconTarget,
  IconProgressCheck,
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
    name: 'my-teaching',
    meta: {
      label: 'Giảng dạy của tôi',
      icon: <IconSchool size={16} />,
      menuPath: '/my-teaching',
    },
    children: [
      {
        name: 'my-subjects',
        identifier: 'my-teaching/subjects',
        meta: {
          label: 'Môn học phụ trách',
          icon: <IconBook size={14} />,
          parent: 'my-teaching',
          menuPath: '/my-teaching/subjects',
        },
      },
      {
        name: 'my-classes',
        identifier: 'my-teaching/classes',
        meta: {
          label: 'Lớp học phụ trách',
          icon: <IconUsers size={14} />,
          parent: 'my-teaching',
          menuPath: '/my-teaching/classes',
        },
      },
      {
        name: 'my-schedule',
        identifier: 'my-teaching/schedule',
        meta: {
          label: 'Lịch giảng dạy',
          icon: <IconCalendar size={14} />,
          parent: 'my-teaching',
          menuPath: '/my-teaching/schedule',
        },
      },
    ],
  },
  {
    name: 'semester-management',
    list: '/semesters',
    meta: {
      label: 'Quản lý kỳ học',
      icon: <IconCalendarEvent size={16} />,
      menuPath: '/semesters',
    },
    children: [
      {
        name: 'semester-list',
        identifier: 'semesters/list',
        meta: {
          label: 'Danh sách kỳ học',
          icon: <IconClipboardList size={14} />,
          parent: 'semester-management',
          menuPath: '/semesters/list',
        },
      },
      {
        name: 'active-semester',
        identifier: 'semesters/active',
        meta: {
          label: 'Kỳ học hiện tại',
          icon: <IconCalendarCheck size={14} />,
          parent: 'semester-management',
          menuPath: '/semesters/active',
        },
      },
      {
        name: 'semester-planning',
        identifier: 'semesters/planning',
        meta: {
          label: 'Kế hoạch kỳ học',
          icon: <IconNotebook size={14} />,
          parent: 'semester-management',
          menuPath: '/semesters/planning',
        },
      },
    ],
  },
  {
    name: 'subjects',
    meta: {
      label: 'Môn học',
      icon: <IconBook size={16} />,
      canDelete: true,
      menuPath: '/subjects',
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
    name: 'classes',
    meta: {
      label: 'Lớp học',
      icon: <IconUsers size={16} />,
      canDelete: true,
      menuPath: '/classes',
    },
  },
  {
    name: 'students',
    meta: {
      label: 'Học sinh',
      icon: <IconUserCheck size={16} />,
      canDelete: true,
      menuPath: '/students',
    },
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
          label: 'Báo cáo Activities',
          icon: <IconBan size={14} />,
          parent: 'reports',
          menuPath: '/reports/activities',
        },
      },
    ],
  },
  {
    name: 'department-management',
    meta: {
      label: 'Quản lý bộ môn',
      icon: <IconBookmark size={16} />,
      menuPath: '/department',
    },
    children: [
      {
        name: 'department-activities',
        identifier: 'department/activities',
        meta: {
          label: 'Hoạt động bộ môn',
          icon: <IconCalendarEvent size={14} />,
          parent: 'department-management',
          canDelete: true,
          menuPath: '/department/activities',
        },
      },
      {
        name: 'department-meetings',
        identifier: 'department/meetings',
        meta: {
          label: 'Họp bộ môn',
          icon: <IconUsers size={14} />,
          parent: 'department-management',
          canDelete: true,
          menuPath: '/department/meetings',
        },
      },
      {
        name: 'curriculum',
        identifier: 'department/curriculum',
        meta: {
          label: 'Chương trình giảng dạy',
          icon: <IconNotebook size={14} />,
          parent: 'department-management',
          canDelete: true,
          menuPath: '/department/curriculum',
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
  const baseResources = [
    'dashboard',
    'workspaces',
    'my-work',
    'my-teaching',
    'subjects',
    'classes',
    'students',
    'settings',
  ];

  switch (role) {
    case UserRole.GV:
      return resources.filter(
        resource => baseResources.includes(resource.name) || resource.name === 'exams',
      );

    case UserRole.CNBM:
      return resources.filter(
        resource =>
          baseResources.includes(resource.name) ||
          ['activities', 'exams', 'teachers', 'reports', 'semester-management'].includes(
            resource.name,
          ),
      );

    case UserRole.TM:
      return resources;

    default:
      return resources.filter(resource => baseResources.includes(resource.name));
  }
};

// Utility function để lấy workspace hiện tại
export const getCurrentWorkspace = (): string | null => {
  // Có thể lấy từ localStorage hoặc context
  return localStorage.getItem('currentWorkspace') || null;
};

// Utility function để set workspace
export const setCurrentWorkspace = (workspaceId: string): void => {
  localStorage.setItem('currentWorkspace', workspaceId);
};
