import { IBase } from '@/common/types';

export interface IWorkspace extends IBase {
  name: string;
  description?: string;
  icon?: string;
  avatar?: string;
}
