import { IBase, IUser } from '@/common/types';
import { IActivity } from '@/common/types';

export interface IFeedback extends IBase {
  activityId: string;
  userId: string;
  user: IUser;
  activity: IActivity;
  content: string;
  submittedAt: Date;
}
