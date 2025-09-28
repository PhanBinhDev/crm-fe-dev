import { IBase, IUser } from '@/common/types';

export interface IWorkspace extends IBase {
  name: string;
  description?: string;
  icon?: string;
  avatar?: string;
}

export interface IMember extends IBase {
  user: IUser;
  workspaceId: string;
}
