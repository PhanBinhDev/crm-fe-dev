import {
  ActivityCategory,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
} from '@/common/enum/activity';
import { DateRange, IBase, IFeedback, IFile, IParticipant, IStage, IUser } from '@/common/types';

import { IAssignee, PayloadAssignee } from './assignee';
import { ISemester } from './semester';

export interface IActivity extends IBase {
  name: string;
  type: ActivityType;
  description?: string;
  priority: ActivityPriority | null;
  stageId?: string;
  stage: IStage;
  startTime: Date | null;
  endTime: Date | null;
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
  subActivities?: IActivity[];
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
  assignees?: PayloadAssignee[];
  files?: File[];
  stageId?: string;
  subtask?: string[];
  checklist?: Checklist[];
  workspaceId: string;
  instructorCount?: number;
  studentCount?: number;
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
