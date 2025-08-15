import { IActivity, IBase } from '@/common/types';

export interface IFile extends IBase {
  url: string;
  fileName: string;
  activityId: string;
  activity: IActivity;
}
