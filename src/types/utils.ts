export interface ApiResponse<T> {
  data: T
  message: string
  status: number
  type: "success" | "error"
  url: string
}

// For paginated responses
export interface PaginatedData<T> {
  items: T[]
  total_count: number
  // optional pagination metadata if your API includes them
  current_page?: number
  total_pages?: number
  page_size?: number
}
// <-- this must return the payload directly
export type PaginatedApiResponse<T> = Promise<PaginatedData<T>>

export interface PaginatedApiRaw<T> {
  items: T[]
  total_count: number
}

export interface PaginatedQueryParams {
  currentPage?: number
  pageSize?: number | "all"
  search?: string
  sortBy?: string
  sortDir?: string
  status?: string
}
