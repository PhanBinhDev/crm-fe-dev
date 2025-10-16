import { IBase, IUser } from '@/common/types';

export interface IFollower extends IBase {
  activityId: string;
  userId: string;
  createdBy: string;
  user: IUser;
}
