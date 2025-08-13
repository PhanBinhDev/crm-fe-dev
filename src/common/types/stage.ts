import { IBase } from '@/common/types';

export interface IStage extends IBase {
  id: string;
  title: string;
  position: number;
  color?: string;
}
