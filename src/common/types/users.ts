import { IBase } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { IActivityAssignee } from './assignee';

export interface IUser extends IBase {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  assignedActivities?: IActivityAssignee[];
}
