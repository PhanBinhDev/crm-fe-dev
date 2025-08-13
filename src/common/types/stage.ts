import { IBase } from '@/common/types';

export interface IStage extends IBase {
  title: string;
  position: number;
  color?: string;
}
