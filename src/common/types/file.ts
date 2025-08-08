import { IActivity, IBase } from '@/common/types';

export interface IFile extends IBase {
  fileUrl: string;
  fileName: string;
  activityId: string;
  activity: IActivity;
}
