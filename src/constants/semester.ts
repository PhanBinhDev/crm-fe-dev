import { SemesterStatus } from '@/common/enum/semester';
import { ColumnFilterItem } from 'antd/lib/table/interface';

export const semesterStatusFilterOptions: ColumnFilterItem[] = [
  { text: 'Sắp diễn ra', value: SemesterStatus.UPCOMING },
  { text: 'Đang diễn ra', value: SemesterStatus.ONGOING },
  { text: 'Đã kết thúc', value: SemesterStatus.COMPLETED },
];
