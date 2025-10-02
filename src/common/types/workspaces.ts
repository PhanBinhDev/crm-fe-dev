import { IBase } from '@/common/types';
import { MemberRole, MemberStatus } from '../enum/workspace';

export interface IWorkspace extends IBase {
  name: string;
  description?: string;
  avatar?: string;
  visibility?: 'private' | 'public';
  membersCount?: number;
}

export interface IMember extends IBase {
  workspaceId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: MemberRole;
  createdAt: string;
  status: MemberStatus;
  createdBy: string;
}
