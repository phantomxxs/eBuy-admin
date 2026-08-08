export type BulkJobStatus = "queued" | "processing" | "completed" | "failed"

export interface BulkUploadJob {
  jobId: string
  entityType: string
  status: BulkJobStatus
  originalFilename: string
  queuedAt: string
  startedAt: string | null
  completedAt: string | null
  createdBy: string
  totalRows: number
  processedRows: number
  successCount: number
  failedCount: number
  progressPercent: number
  failureMessage: string | null
  reportUrl: string | null
}

export interface BulkUploadJobItem {
  rowNumber: number
  message: string
  payload: {
    row: {
      name?: string
      sku?: string
      category?: string
      locations?: string
      status?: string
    }
    raw_line?: string
    headers?: string[]
    columns?: Record<string, unknown>
  }
}

export interface BulkUploadJobsResult {
  items: BulkUploadJob[]
  total_count: number
  current_page?: number
  page_size?: number
}

export interface BulkUploadTargetPayload {
  filename: string
  contentType: string
}

export interface BulkUploadTargetResponse {
  upload_url: string
  storage_key: string
  method: string
  content_type: string
}

export interface QueueBulkUploadPayload {
  storageKey: string
  originalFilename: string
  contentType: string
  skipHeader: boolean
}

export interface BulkUploadJobsParams {
  entityType?: string
  status?: BulkJobStatus
  pageSize?: number
  currentPage?: number
}

export interface BulkUploadItemsParams {
  status?: string
  pageSize?: number
  currentPage?: number
}

export interface BulkUploadJobItemsResult {
  items: BulkUploadJobItem[]
  total_count: number
}

export interface DownloadTemplateResponse {
  download_url: string
  filename: string
}

export interface UploadAndQueueParams {
  file: File
  skipHeader?: boolean
}
