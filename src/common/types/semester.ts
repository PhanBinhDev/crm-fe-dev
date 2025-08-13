import { IBase } from '@/common/types';
import { SemesterStatus } from '@/common/enum/semester';

export interface ISemesterBlocks {
  name: string;
}

export interface ISemester extends IBase {
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  status: SemesterStatus;
  year: number;
  blocks: ISemesterBlocks[];
}
