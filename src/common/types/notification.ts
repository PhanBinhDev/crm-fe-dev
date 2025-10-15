import { IBase } from '.';
import { IUser } from './users';

export interface INotification extends IBase {
  id: string;
  title: string;
  message: string;
  type: string;
  data: Record<string, any>;
  userId: string;
  user: IUser;
  senderId: string | null;
  isRead: boolean;
  isDeleted: boolean;
  readAt: string | null;
}

export type NotificationTab = 'all' | 'unread' | 'mentions';
