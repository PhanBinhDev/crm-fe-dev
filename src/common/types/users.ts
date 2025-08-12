import { IBase } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { IActivityAssignee } from './assignee';

export interface IUser  {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  assignedActivities?: IActivityAssignee[];
}
