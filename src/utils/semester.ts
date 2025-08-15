import { SemesterStatus } from '@/common/enum/semester';

export const getSemesterColor = (status: SemesterStatus): string => {
  switch (status) {
    case SemesterStatus.ONGOING:
      return 'red';
    case SemesterStatus.UPCOMING:
      return 'blue';
    case SemesterStatus.COMPLETED:
      return 'green';
    default:
      return 'default';
  }
};

export const getSemesterLabel = (status: SemesterStatus): string => {
  switch (status) {
    case SemesterStatus.ONGOING:
      return 'Đang diễn ra';
    case SemesterStatus.UPCOMING:
      return 'Sắp diễn ra';
    case SemesterStatus.COMPLETED:
      return 'Đã kết thúc';
    default:
      return status;
  }
};
