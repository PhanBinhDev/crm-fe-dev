import { WorkspaceVisibility } from '@/common/enum/workspace';

export interface ICreateWorkspacePayload {
  name: string;
  description?: string;
  avatar?: File;
  visibility: WorkspaceVisibility;
  members: string[];
}
