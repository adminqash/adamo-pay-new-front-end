export type APIPagination = {
  total: number
  pages: number
  page: number
  next: number | null
  previous: number | null
};

export type APIResponse<T> = {
  success: boolean
  message: string | null
  data: T | null
  pagination: APIPagination | null
  code: string | null
  timestamp: string
  traceId: string | null
};
