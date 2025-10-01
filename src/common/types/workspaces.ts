import { IBase, IUser } from '@/common/types';
import { MemberRole } from '../enum/workspace';

export interface IWorkspace extends IBase {
  name: string;
  description?: string;
  avatar?: string;
  visibility?: 'private' | 'public';
  membersCount?: number;
}

export interface IMember extends IBase {
  user: IUser;
  workspaceId: string;
  role: MemberRole;
}
