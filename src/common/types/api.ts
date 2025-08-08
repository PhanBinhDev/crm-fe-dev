export interface PaginationMeta {
  limit: number;
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
  totalRecords: number;
  totalPages: number;
}

export interface CursorPaginationMeta {
  limit: number;
  afterCursor?: string;
  beforeCursor?: string;
  totalRecords: number;
}

export interface BaseResponse {
  statusCode: number;
  message: string;
  timestamp: Date;
}

export interface ApiResponse<T> extends BaseResponse {
  data: T;
}

export interface ApiPaginatedResponse<T> extends BaseResponse {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiCursorPaginatedResponse<T> extends BaseResponse {
  data: T[];
  pagination: CursorPaginationMeta;
}

export interface ApiResponseNoData extends BaseResponse {
  data?: never;
}
