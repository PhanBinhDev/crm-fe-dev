import { ParticipantRole, ParticipantStatus } from '@/common/enum/activity';
import { IBase } from '@/common/types';

import { IUser } from './users';

export interface IParticipant extends IBase {
  id: string;
  activityId: string;
  userId: string;
  user: IUser;
  role: ParticipantRole;
  status: ParticipantStatus;
}
