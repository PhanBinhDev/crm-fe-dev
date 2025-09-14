import { Dayjs } from 'dayjs';

export * from './activities';
export * from './auth';
export * from './feedback';
export * from './file';
export * from './participant';
export * from './stage';
export * from './users';
export * from './workspaces';

export interface IBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type DateRange = {
  start: Dayjs | null;
  end: Dayjs | null;
};
