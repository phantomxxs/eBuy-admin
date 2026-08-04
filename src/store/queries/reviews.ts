import { useQuery } from "@tanstack/react-query"
import { getReviews, getReviewStats, getReviewById } from "../requests/reviews"
import { GET_REVIEWS_KEY, GET_REVIEW_METRICS_KEY, GET_REVIEW_BY_ID_KEY } from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { ReviewQueryParams } from "@/types/reviews"

export const useGetReviews = (params: ReviewQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.REVIEWS_VIEW))
  return useQuery({
    queryKey: [GET_REVIEWS_KEY, params],
    queryFn: () => getReviews(params),
    enabled: canView,
  })
}

export const useGetReviewStats = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.REVIEWS_VIEW))
  return useQuery({
    queryKey: [GET_REVIEW_METRICS_KEY],
    queryFn: getReviewStats,
    enabled: canView,
  })
}

export const useGetReviewById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.REVIEWS_VIEW))
  return useQuery({
    queryKey: [GET_REVIEW_BY_ID_KEY, id],
    queryFn: () => getReviewById(id!),
    enabled: !!id && canView,
  })
}
