import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateReviewStatus, deleteReview, exportReviewsCSV } from "../requests/reviews"
import { GET_REVIEWS_KEY, GET_REVIEW_METRICS_KEY, GET_REVIEW_BY_ID_KEY } from "../query-keys"
import type { UpdateReviewStatusPayload, ReviewQueryParams } from "@/types/reviews"

export const useUpdateReviewStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateReviewStatusPayload) =>
      updateReviewStatus(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [GET_REVIEWS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_REVIEW_METRICS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_REVIEW_BY_ID_KEY, id] })
    },
  })
}

export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [GET_REVIEWS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_REVIEW_METRICS_KEY, id] })
    },
  })
}

export const useExportReviewsCSV = () =>
  useMutation({
    mutationFn: (params: Omit<ReviewQueryParams, "pageSize" | "currentPage">) =>
      exportReviewsCSV(params),
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })
