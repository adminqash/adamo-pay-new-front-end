export type APIErrorItem = {
  code: string
  message?: string
  field?: string
  details?: unknown
};

export type APIPaginationRaw = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
};

/** Legacy pagination shape (normalized internally) */
export type APIPagination = {
  total: number
  pages: number
  page: number
  next: number | null
  previous: number | null
};

export type APIMeta = {
  requestId: string
  service: string
  version: string
  locale: string
};

export type APIResponse<T> = {
  success: boolean
  message: string | null
  data: T | null
  timestamp: string
  errors: APIErrorItem[] | null
  pagination: APIPaginationRaw | APIPagination | null
  meta?: APIMeta
  /** @deprecated use errors[0].code */
  code?: string | null
  /** @deprecated use meta.requestId */
  traceId?: string | null
};

export type ListQueryParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  currency?: string
  countryCode?: string
  dateFrom?: string
  dateTo?: string
  organizationId?: string
  [key: string]: string | number | boolean | undefined
};

export type MetricsQueryParams = {
  from?: string
  to?: string
  period?: string
  countryCode?: string
  accountId?: string
};
