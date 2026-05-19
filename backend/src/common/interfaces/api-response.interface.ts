export interface ApiResponse<T> {
  // Theo xlsx contract — FE check boolean (Tâm dùng `if (res.success)`).
  // Optional vì controllers cũ chỉ set `status`; ResponseInterceptor sẽ auto-inject.
  success?: boolean;
  // Backward-compat cho code Nhi/Tiến đang check `status === 'success'`
  status: 'success' | 'error';
  message: string;
  data: T;
  meta?: {
    count?: number;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    period?: string;
    groupBy?: string;
    [key: string]: any;
  };
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginationMeta {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogAnalyticsMeta extends PaginationMeta {
  period: string;
  groupBy: string;
  totalViews?: number;
  uniqueViews?: number;
  averageViews?: number;
}
