export type CategoryStatus = "active" | "inactive"

export interface Category {
  category_id: number | string
  name: string
  product_count: number
  status: CategoryStatus
  created_at: string
  image_url?: string
}

export interface CategoryMetrics {
  total_categories: number
  active_categories: number
}

export interface CreateCategoryPayload {
  name: string
}

export interface UpdateCategoryPayload {
  name?: string
}

export interface UpdateCategoryStatusPayload {
  status: CategoryStatus
}

export interface CategoryQueryParams {
  currentPage?: number
  pageSize?: number | "all"
  search?: string
  status?: string
  date_from?: string
  date_to?: string
}
