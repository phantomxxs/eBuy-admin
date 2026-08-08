import { useState } from "react"
import { X, Download, ChevronDown, ChevronRight, AlertCircle, Loader2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { useGetBulkUploadJob, useGetBulkUploadJobItems } from "@/store/queries/bulk-upload"
import type { BulkUploadJob, BulkUploadJobItem } from "@/types/bulk-upload"

interface Props {
  isOpen: boolean
  onClose: () => void
  jobId: string | null
}

export default function BulkUploadJobDetailDrawer({ isOpen, onClose, jobId }: Props) {
  const { data: job, isLoading } = useGetBulkUploadJob(jobId ?? "")
  const [showFailedRows, setShowFailedRows] = useState(false)

  const customHeader = (
    <div className="border-borderSubtle border-b px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold">Import job details</h2>
          {job && <p className="font-jakarta text-brand/50 mt-0.5 text-sm">{job.jobId}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      width="600px"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading || !job ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-brand/30 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Failure message banner */}
            {job.failureMessage && (
              <div className="bg-danger/5 border-danger/20 flex items-start gap-2.5 rounded-xl border p-4">
                <AlertCircle size={16} className="text-danger mt-0.5 shrink-0" />
                <div>
                  <p className="font-jakarta text-danger text-sm font-semibold">Job failed</p>
                  <p className="font-jakarta text-danger/80 mt-0.5 text-xs">{job.failureMessage}</p>
                </div>
              </div>
            )}

            {/* Summary card */}
            <SectionCard title="SUMMARY">
              <DetailRow label="Job ID" value={job.jobId} />
              <DetailRow label="Entity type" value={job.entityType} />
              <DetailRow label="Status" value={<JobStatusBadge status={job.status} />} />
              <DetailRow label="Filename" value={job.originalFilename} />
              <DetailRow label="Created by" value={job.createdBy || "—"} />
              <DetailRow
                label="Queued at"
                value={job.queuedAt ? formatDateToCustomFormat(job.queuedAt) : "—"}
              />
              {job.startedAt && (
                <DetailRow label="Started at" value={formatDateToCustomFormat(job.startedAt)} />
              )}
              {job.completedAt && (
                <DetailRow label="Completed at" value={formatDateToCustomFormat(job.completedAt)} />
              )}
            </SectionCard>

            {/* Progress card */}
            <SectionCard title="PROGRESS">
              <div className="flex items-end justify-between pt-3 pb-2">
                <span className="font-jakarta text-brand/50 text-sm">
                  {job.processedRows} / {job.totalRows} rows
                </span>
                <span className="font-jakarta text-brand text-sm font-semibold">
                  {job.progressPercent}%
                </span>
              </div>
              <div className="bg-blur h-2 w-full overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    job.status === "completed" && job.failedCount === 0
                      ? "bg-statusSuccess"
                      : job.status === "failed"
                        ? "bg-danger"
                        : "bg-primary",
                  )}
                  style={{ width: `${job.progressPercent}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 pb-3">
                {[
                  { label: "Total rows", value: job.totalRows, color: "" },
                  { label: "Succeeded", value: job.successCount, color: "text-statusSuccess" },
                  {
                    label: "Failed",
                    value: job.failedCount,
                    color: job.failedCount > 0 ? "text-danger" : "",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="border-borderSubtle rounded-lg border p-3 text-center"
                  >
                    <p
                      className={cn("font-jakarta text-lg font-semibold", s.color || "text-brand")}
                    >
                      {s.value}
                    </p>
                    <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="font-jakarta text-brand/40 pb-3 text-xs">
                {job.status === "queued" && "Waiting for worker…"}
                {job.status === "processing" && "Processing rows…"}
                {job.status === "completed" && job.failedCount === 0 && "Completed successfully"}
                {job.status === "completed" && job.failedCount > 0 && "Completed with errors"}
                {job.status === "failed" && "Job failed"}
              </p>
            </SectionCard>

            {/* Actions */}
            {job.reportUrl && (
              <a href={job.reportUrl} download className="inline-flex">
                <Button variant="outline" size="sm" beforeIcon={<Download size={14} />}>
                  Download error report
                </Button>
              </a>
            )}

            {/* Failed rows */}
            {job.failedCount > 0 && (
              <div>
                <button
                  onClick={() => setShowFailedRows((v) => !v)}
                  className="font-jakarta text-brand flex items-center gap-1.5 text-sm font-semibold"
                >
                  {showFailedRows ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  View failed rows ({job.failedCount})
                </button>
                {showFailedRows && <FailedRowsTable jobId={job.jobId} />}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

function FailedRowsTable({ jobId }: { jobId: string }) {
  const { data, isLoading } = useGetBulkUploadJobItems(jobId)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const items = data?.items ?? []

  if (isLoading)
    return (
      <div className="mt-3 flex items-center justify-center py-10">
        <Loader2 size={20} className="text-brand/30 animate-spin" />
      </div>
    )

  if (items.length === 0)
    return <p className="font-jakarta text-brand/50 mt-3 text-sm">No failed rows found.</p>

  return (
    <div className="border-borderSubtle mt-3 overflow-hidden rounded-xl border">
      <div className="border-borderSubtle grid grid-cols-[48px_1fr_120px_100px] gap-2 border-b bg-gray-50 px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        <span>Row</span>
        <span>Message</span>
        <span>SKU</span>
        <span>Status</span>
      </div>
      <div className="no-scrollbar max-h-80 overflow-y-auto">
        {items.map((item) => (
          <FailedRowItem
            key={item.rowNumber}
            item={item}
            expanded={expandedRow === item.rowNumber}
            onToggle={() => setExpandedRow(expandedRow === item.rowNumber ? null : item.rowNumber)}
          />
        ))}
      </div>
    </div>
  )
}

function FailedRowItem({
  item,
  expanded,
  onToggle,
}: {
  item: BulkUploadJobItem
  expanded: boolean
  onToggle: () => void
}) {
  const { row } = item.payload
  return (
    <div className="border-borderSubtle border-b last:border-0">
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[48px_1fr_120px_100px] items-start gap-2 px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-jakarta text-brand/50 text-xs">#{item.rowNumber}</span>
        <span className="font-jakarta text-brand text-xs leading-relaxed">{item.message}</span>
        <span className="font-jakarta text-brand/70 text-xs">{row.sku ?? "—"}</span>
        <span className="font-jakarta text-brand/70 text-xs">{row.status ?? "—"}</span>
      </button>
      {expanded && (
        <div className="border-borderSubtle border-t bg-gray-50/60 px-4 py-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {(
              [
                ["Name", row.name],
                ["Category", row.category],
                ["Locations", row.locations],
              ] as [string, string | undefined][]
            ).map(([label, val]) =>
              val ? (
                <div key={label} className="flex gap-2">
                  <span className="font-jakarta text-brand/40 w-20 shrink-0">{label}</span>
                  <span className="font-jakarta text-brand">{val}</span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-borderSubtle rounded-xl border">
      <div className="border-borderSubtle border-b px-4 py-2.5">
        <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wider uppercase">
          {title}
        </p>
      </div>
      <div className="divide-borderSubtle divide-y px-4">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="font-jakarta text-brand/50 text-sm">{label}</span>
      <span className="font-jakarta text-brand text-right text-sm font-medium">{value}</span>
    </div>
  )
}

function JobStatusBadge({ status }: { status: BulkUploadJob["status"] }) {
  const config = {
    queued: { label: "Queued", variant: "neutral" as const },
    processing: { label: "Processing", variant: "info" as const },
    completed: { label: "Completed", variant: "success" as const },
    failed: { label: "Failed", variant: "error" as const },
  }
  const c = config[status] ?? { label: status, variant: "neutral" as const }
  return <StatusBadge label={c.label} variant={c.variant} dot />
}
