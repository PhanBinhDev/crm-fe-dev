import { IBase } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { IActivityAssignee } from './assignee';

export interface IUser extends IBase {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  dateOfBirth: string;
  avatar: string;
  major: string;
  isActive: boolean;
  assignedActivities?: IActivityAssignee[];
}
