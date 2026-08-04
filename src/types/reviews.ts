export type ReviewStatus = "pending" | "approved" | "rejected"

export interface Review {
  review_id: number
  product_id: number
  product_name: string
  sku: string
  title: string
  detail: string
  nickname: string
  customer_type: string
  customer_email: string
  rating: number
  status: ReviewStatus
  created_at: string
}

export interface ReviewMetrics {
  total_reviews: number
  pending_reviews: number
  approved_reviews: number
  rejected_reviews: number
  average_rating: number
}

export interface ReviewQueryParams {
  pageSize?: number
  currentPage?: number
  search?: string
  status?: string
  rating?: number
  productId?: string
  dateFrom?: string
  dateTo?: string
}

export interface UpdateReviewStatusPayload {
  status: ReviewStatus
}

export interface ReviewExportResult {
  download_url: string
  filename: string
}
