import instance from "@/services/axios-instance"
import { REVIEWS, REVIEW_STATS, REVIEW_EXPORT, REVIEW_BY_ID, REVIEW_STATUS } from "@/services/apis"
import type {
  Review,
  ReviewMetrics,
  ReviewQueryParams,
  UpdateReviewStatusPayload,
  ReviewExportResult,
} from "@/types/reviews"
import type { PaginatedApiResponse } from "@/types/utils"

export const getReviews = async (params: ReviewQueryParams = {}): PaginatedApiResponse<Review> => {
  const response = await instance.get(REVIEWS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.rating && { rating: params.rating }),
      ...(params.productId && { productId: params.productId }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
    },
  })
  return response.data
}

export const getReviewStats = async (): Promise<ReviewMetrics> => {
  const response = await instance.get(REVIEW_STATS)
  return response.data
}

export const getReviewById = async (id: string): Promise<Review> => {
  const response = await instance.get(REVIEW_BY_ID(id))
  return response.data
}

export const updateReviewStatus = async (
  id: string,
  payload: UpdateReviewStatusPayload,
): Promise<Review> => {
  const response = await instance.put(REVIEW_STATUS(id), payload)
  return response.data
}

export const deleteReview = async (id: string): Promise<null> => {
  const response = await instance.delete(REVIEW_BY_ID(id))
  return response.data
}

export const exportReviewsCSV = async (
  params: Omit<ReviewQueryParams, "pageSize" | "currentPage"> = {},
): Promise<ReviewExportResult> => {
  const response = await instance.get(REVIEW_EXPORT, {
    params: {
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.rating && { rating: params.rating }),
      ...(params.productId && { productId: params.productId }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
    },
  })
  return response.data
}
