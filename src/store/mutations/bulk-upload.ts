import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  downloadBulkUploadTemplate,
  requestUploadTarget,
  uploadFileToStorage,
  queueBulkUpload,
} from "../requests/bulk-upload"
import { GET_BULK_UPLOAD_JOBS_KEY } from "../query-keys"
import type { QueueBulkUploadPayload, UploadAndQueueParams } from "@/types/bulk-upload"

export const useDownloadBulkUploadTemplate = () =>
  useMutation({
    mutationFn: downloadBulkUploadTemplate,
    onSuccess: ({ download_url, filename }) => {
      const a = document.createElement("a")
      a.href = download_url
      a.download = filename
      a.click()
    },
  })

export const useUploadAndQueueBulkUpload = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, skipHeader = true }: UploadAndQueueParams) => {
      const contentType = file.name.endsWith(".xlsx")
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv"
      const target = await requestUploadTarget({ filename: file.name, contentType })
      await uploadFileToStorage(target.upload_url, file, target.content_type)
      const payload: QueueBulkUploadPayload = {
        storageKey: target.storage_key,
        originalFilename: file.name,
        contentType,
        skipHeader,
      }
      return queueBulkUpload(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_BULK_UPLOAD_JOBS_KEY] })
    },
  })
}
