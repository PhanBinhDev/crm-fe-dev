export interface IHistoryItem {
  id: string;
  title: string;
  link: string;
  createdAt: string;
  createdBy: string;
  createdByUserName: string;
  folderName: string;
}

export interface IFolderItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
