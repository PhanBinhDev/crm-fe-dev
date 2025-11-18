export interface IFileMetadata {
  [key: string]: any;
}

export interface IUserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface IFileInfo {
  id: string;
  url: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  metadata: IFileMetadata;
}

export interface ILinkPreview {
  [key: string]: any;
}

export type DocumentType = 'FILE' | 'LINK';
export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface IDocument {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  status: DocumentStatus;
  file?: IFileInfo;
  linkUrl?: string;
  linkPreview?: ILinkPreview;
  createdBy: IUserInfo;
  updatedBy: IUserInfo;
  metadata: IFileMetadata;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  folderId: string;
  folderName: string;
}

export interface IFolder {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { name: string };
  documents: IDocument[];
  totalDocuments: number;
}
