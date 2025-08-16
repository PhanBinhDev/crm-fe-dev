import { IActivity, IBase } from '@/common/types';

export interface IFile extends IBase {
  fileUrl: string;
  fileName: string;
  activityId: string;
  activity: IActivity;
}

export interface IFileUploadResponse {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  encoding: string;
  fileName: string;
}
