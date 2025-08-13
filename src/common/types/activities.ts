import {
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
} from '@/common/enum/activity';
import { IBase, IFeedback, IFile, IParticipant } from '@/common/types';

import { IAssignee } from './assignee';
import { ISemester } from './semester';

export interface IActivity extends IBase {
  name: string;
  type: ActivityType;
  description?: string;
  priority?: ActivityPriority;
  stageId?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  onlineLink?: string;
  mandatory: boolean;
  estimateTime?: number;
  parentId?: string;
  semester: ISemester;
  category?: ActivityCategory;
  status: ActivityStatus;
  participants?: IParticipant[];
  files?: IFile[];
  feedbacks?: IFeedback[];
  assignees?: IAssignee[];
  progress?: number;
}

export interface ActivityFormValues {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  estimateTime?: string;
  semesterId?: string;
  assignees?: IAssignee[];
  priority?: string;
  link?: string;
  file?: File;
}
