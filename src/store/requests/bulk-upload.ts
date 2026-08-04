import instance from "@/services/axios-instance"
import {
  PRODUCT_BULK_UPLOAD_TEMPLATE,
  PRODUCT_QUEUED_BULK_UPLOAD_TARGET,
  PRODUCT_QUEUED_BULK_UPLOADS,
  BULK_UPLOADS,
  BULK_UPLOAD_BY_ID,
  BULK_UPLOAD_ITEMS,
} from "@/services/apis"
import type {
  BulkJobStatus,
  BulkUploadJob,
  BulkUploadJobItem,
  BulkUploadJobsResult,
  BulkUploadJobItemsResult,
  BulkUploadTargetPayload,
  BulkUploadTargetResponse,
  QueueBulkUploadPayload,
  BulkUploadJobsParams,
  BulkUploadItemsParams,
  DownloadTemplateResponse,
} from "@/types/bulk-upload"

export const downloadBulkUploadTemplate = async (): Promise<DownloadTemplateResponse> => {
  const response = await instance.get(PRODUCT_BULK_UPLOAD_TEMPLATE)
  return response.data
}

export const requestUploadTarget = async (
  payload: BulkUploadTargetPayload,
): Promise<BulkUploadTargetResponse> => {
  const response = await instance.post(PRODUCT_QUEUED_BULK_UPLOAD_TARGET, payload)
  return response.data
}

export const uploadFileToStorage = async (
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> => {
  // Goes directly to storage, NOT through axios instance (no auth headers)
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  })
}

export const queueBulkUpload = async (payload: QueueBulkUploadPayload): Promise<BulkUploadJob> => {
  const response = await instance.post(PRODUCT_QUEUED_BULK_UPLOADS, payload)
  return normalizeBulkUploadJob(response.data)
}

export const getBulkUploadJobs = async (
  params: BulkUploadJobsParams = {},
): Promise<BulkUploadJobsResult> => {
  const response = await instance.get(BULK_UPLOADS, {
    params: { entityType: "product", pageSize: 20, currentPage: 1, ...params },
  })
  const body = response.data
  const rawItems = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
  return {
    ...body,
    items: rawItems.map(normalizeBulkUploadJob),
  }
}

export const getBulkUploadJobById = async (jobId: string): Promise<BulkUploadJob> => {
  const response = await instance.get(BULK_UPLOAD_BY_ID(jobId))
  return normalizeBulkUploadJob(response.data?.data ?? response.data)
}

export const getBulkUploadJobItems = async (
  jobId: string,
  params: BulkUploadItemsParams = {},
): Promise<BulkUploadJobItemsResult> => {
  const response = await instance.get(BULK_UPLOAD_ITEMS(jobId), {
    params: { status: "failed", pageSize: 50, currentPage: 1, ...params },
  })
  const body = response.data
  const rawItems = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : []
  return {
    ...body,
    items: rawItems.map(normalizeBulkUploadJobItem),
  }
}

function normalizeBulkUploadJob(raw: unknown): BulkUploadJob {
  const r = raw as Record<string, unknown>
  return {
    jobId: String(r.job_id ?? r.jobId ?? ""),
    entityType: String(r.entity_type ?? r.entityType ?? "product"),
    status: (r.status ?? "queued") as BulkJobStatus,
    originalFilename: String(r.original_filename ?? r.originalFilename ?? ""),
    queuedAt: String(r.queued_at ?? r.queuedAt ?? r.created_at ?? ""),
    startedAt: (r.started_at ?? r.startedAt ?? null) as string | null,
    completedAt: (r.completed_at ?? r.completedAt ?? null) as string | null,
    createdBy: String(r.created_by ?? r.createdBy ?? ""),
    totalRows: Number(r.total_rows ?? r.totalRows ?? 0),
    processedRows: Number(r.processed_rows ?? r.processedRows ?? 0),
    successCount: Number(r.success_count ?? r.successCount ?? 0),
    failedCount: Number(r.failed_count ?? r.failedCount ?? 0),
    progressPercent: Number(r.progress_percent ?? r.progressPercent ?? 0),
    failureMessage: (r.failure_message ?? r.failureMessage ?? null) as string | null,
    reportUrl: (r.report_url ?? r.reportUrl ?? null) as string | null,
  }
}

function normalizeBulkUploadJobItem(raw: unknown): BulkUploadJobItem {
  const r = raw as Record<string, unknown>
  const payload = (r.payload ?? {}) as Record<string, unknown>
  const row = (payload.row ?? {}) as Record<string, unknown>
  return {
    rowNumber: Number(r.row_number ?? r.rowNumber ?? 0),
    message: String(r.message ?? ""),
    payload: {
      row: {
        name: row.name as string | undefined,
        sku: row.sku as string | undefined,
        category: row.category as string | undefined,
        skin_type: row.skin_type as string | undefined,
        locations: row.locations as string | undefined,
        status: row.status as string | undefined,
      },
      raw_line: payload.raw_line as string | undefined,
      headers: payload.headers as string[] | undefined,
      columns: payload.columns as Record<string, unknown> | undefined,
    },
  }
}
