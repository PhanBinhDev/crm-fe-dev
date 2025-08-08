import { AssigneeRole, AssignmentStatus } from '@/common/enum/activity';
import { IActivity, IBase, IUser } from '@/common/types';

export interface IAssignee extends IBase {
  id: string;
  activityId: string;
  userId: string;
  user: IUser;
  note?: string;
  assignedBy?: string;
  assignedAt?: Date;
  role: AssigneeRole;
  status: AssignmentStatus;
}

export interface IActivityAssignee {
  id: string;
  activityId: string;
  status: AssignmentStatus;
  role: AssigneeRole;
  assignedAt?: Date;
  note?: string;
  activity: IActivity;
}
