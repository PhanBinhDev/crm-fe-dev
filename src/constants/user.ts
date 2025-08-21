import { ColumnFilterItem } from 'antd/lib/table/interface';

export const userRoleFilterOptions: ColumnFilterItem[] = [
  { text: 'Trưởng môn', value: 'TM' },
  { text: 'Chủ nhiệm bộ môn', value: 'CNBM' },
  { text: 'Giáo viên', value: 'GV' },
];


export const userStatusFilterOptions = [
  { label: 'Hoạt động', value: 'true' },
  { label: 'Không hoạt động', value: 'false' },
];

// For table column filters (still using boolean)
export const userStatusColumnFilters: ColumnFilterItem[] = [
  { text: 'Hoạt động', value: true },
  { text: 'Không hoạt động', value: false },
];
