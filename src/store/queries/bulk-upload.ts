import { useQuery } from "@tanstack/react-query"
import {
  getBulkUploadJobs,
  getBulkUploadJobById,
  getBulkUploadJobItems,
} from "../requests/bulk-upload"
import {
  GET_BULK_UPLOAD_JOBS_KEY,
  GET_BULK_UPLOAD_JOB_KEY,
  GET_BULK_UPLOAD_JOB_ITEMS_KEY,
} from "../query-keys"
import type { BulkUploadJobsParams, BulkUploadItemsParams } from "@/types/bulk-upload"

export const useGetBulkUploadJobs = (params: BulkUploadJobsParams = {}) =>
  useQuery({
    queryKey: [GET_BULK_UPLOAD_JOBS_KEY, params],
    queryFn: () => getBulkUploadJobs(params),
    refetchInterval: 20_000,
  })

export const useGetBulkUploadJob = (jobId: string) =>
  useQuery({
    queryKey: [GET_BULK_UPLOAD_JOB_KEY, jobId],
    queryFn: () => getBulkUploadJobById(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "queued" || status === "processing") return 5_000
      return false
    },
  })

export const useGetBulkUploadJobItems = (jobId: string, params: BulkUploadItemsParams = {}) =>
  useQuery({
    queryKey: [GET_BULK_UPLOAD_JOB_ITEMS_KEY, jobId, params],
    queryFn: () => getBulkUploadJobItems(jobId, params),
    enabled: !!jobId,
  })
