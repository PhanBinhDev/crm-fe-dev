import { IBase } from '@/common/types';
import { UserRole } from '@/common/enum/user';
import { IActivityAssignee } from './assignee';

export interface IUser extends IBase {
  name: string;
  username?: string; // Thêm username
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  dateOfBirth?: string; // Thêm dateOfBirth
  avatar?: string; // Thêm avatar
  assignedActivities?: IActivityAssignee[];
}
