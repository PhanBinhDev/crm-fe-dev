import { MemberRole, MemberStatus, WorkspaceVisibility } from '@/common/enum/workspace';
import { IBase, IUser } from '@/common/types';

export interface IWorkspace extends IBase {
  name: string;
  description?: string;
  avatar?: string;
  visibility?: WorkspaceVisibility;
  membersCount?: number;
  inviteCode: string;
  owner: IUser;
  ownerName: string;
  members: IMember[];
}

export interface IMember extends IBase {
  id: string;
  workspaceId: string;
  user: IUser;
  role: MemberRole;
  createdAt: string;
  status: MemberStatus;
  createdBy: string;
}

export interface IWorkspaceInvitation extends IBase {
  workspaceId: string;
  workspace: IWorkspace;
  invitedBy: IUser;
  status: MemberStatus;
  expiresAt: string;
}
