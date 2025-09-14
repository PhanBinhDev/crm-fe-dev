export interface INotification {
  id: string;
  title: string | null;
  message: string | null;
  type: string | null;
  data: any | null;
  userId: string | null;
  senderId: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  readAt: string | null;
}
