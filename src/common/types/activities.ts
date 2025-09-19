import {
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
} from '@/common/enum/activity';
import { DateRange, IBase, IFeedback, IFile, IParticipant, IUser } from '@/common/types';

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
  position: number;
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

export interface FormAddTaskData {
  name: string;
  description?: string;
  assignees: IUser[];
  priority: ActivityPriorityLevel | null;
  dueDate: DateRange;
  timeEstimate?: string;
  subtasks: string[];
  checklist: Checklist[];
  attachments?: File[];
  stage?: string;
}

export interface FormAddActivityPayload {
  name: string;
  description?: string;
  type: ActivityType;
  priority?: ActivityPriority;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  onlineLink?: string;
  estimateTime?: number;
  category?: ActivityCategory;
  mandatory?: boolean;
  parentId?: string;
  assignees?: string[];
  files?: File[];
  stageId?: string;
  subtask?: string[];
  checklist?: Checklist[];
  workspaceId: string;
}

export interface ActivityPriorityLevel {
  label: string;
  value: ActivityPriority;
  color: string;
}

export interface Checklist {
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  content: string;
  isDone: boolean;
}

export type ModalAction = 'create-action' | 'create-another' | 'create-duplicate' | 'create-open';
