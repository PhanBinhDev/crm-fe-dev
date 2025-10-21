import { ActivityPriority, ActivityStatus, ActivityType } from '@/common/enum/activity';
import {
  ActivityFile,
  DateRange,
  IBase,
  ICategory,
  IFeedback,
  IParticipant,
  IStage,
  IUser,
} from '@/common/types';

import { ReminderType } from '../enum/notifications';
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
  workspaceId: string;
  parentId?: string;
  semester: ISemester;
  categoryId: string | null;
  category?: ICategory;
  status: ActivityStatus;
  participants?: IParticipant[];
  files?: ActivityFile[];
  feedbacks?: IFeedback[];
  assignees?: IAssignee[];
  progress?: number;
  subActivities?: IActivity[];
  checklists?: Checklist[];
  instructorCount?: number;
  studentCount?: number;
  workspace: { name: string };
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
  category?: ICategory;
  mandatory?: boolean;
  parentId?: string;
  assignees?: PayloadAssignee[];
  attachments?: string[];
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

export interface Checklist extends IBase {
  name: string;
  totalItems: number;
  completedItems: number;
  progress: number;
  items: ChecklistItem[];
}

export interface ChecklistItem extends IBase {
  content: string;
  isDone: boolean;
}

export interface IActivityLinks {
  id: string;
  title: string;
  url: string;
  description: string;
  createdAt: string;
  creator: { name: string };
  imageUrl: string;
  linkPreview: ILinkPreview;
}

export interface ILinkPreview {
  thumbnail?: string;
  siteName?: string;
  favicon?: string;
  siteDescription?: string;
}

export interface FormAddReminderPayload {
  title: string;
  description: string;
  receivers: string[];
  date: Date;
  type: ReminderType;
  notifyBefore: NotifyOption;
  attachments: File[];
}

export interface NotifyOption {
  label: string;
  value: number | 'none' | 'custom';
}
