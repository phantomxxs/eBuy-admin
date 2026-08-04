import { useState } from "react"
import { Upload, Download, FileSpreadsheet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useGetBulkUploadJobs } from "@/store/queries/bulk-upload"
import { useDownloadBulkUploadTemplate } from "@/store/mutations/bulk-upload"
import BulkUploadModal from "@/components/product/bulk-upload-modal"
import BulkUploadJobDetailDrawer from "@/components/product/bulk-upload-job-detail-drawer"
import PageSkeleton from "@/components/shared/page-skeleton"
import { ROUTES } from "@/lib/routes"
import type { BulkUploadJob } from "@/types/bulk-upload"

export default function ProductBulkUploadPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const { data, isLoading, refetch, isRefetching } = useGetBulkUploadJobs()
  const downloadTemplate = useDownloadBulkUploadTemplate()
  const jobs = data?.items ?? []

  if (isLoading) return <PageSkeleton metricCount={0} />

  return (
    <div className="page-bg min-h-full">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.products}
                className="font-jakarta text-brand/50 hover:text-brand text-sm transition-colors"
              >
                Products
              </Link>
              <span className="text-brand/30 text-sm">/</span>
              <span className="font-jakarta text-brand text-sm font-semibold">Bulk import</span>
            </div>
            <h1 className="font-jakarta text-brand mt-1 text-xl font-semibold">
              Product bulk import
            </h1>
            <p className="font-jakarta text-brand/50 mt-0.5 text-sm">
              Upload an .xlsx file to import products in bulk. Jobs are processed asynchronously.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="subtle"
              beforeIcon={<Download size={14} />}
              loading={downloadTemplate.isPending}
              onClick={() => downloadTemplate.mutate()}
            >
              Sample sheet
            </Button>
            <Button
              variant="secondary"
              beforeIcon={<Upload size={14} />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload products
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <InstructionsCard />

        {/* Jobs table */}
        <div className="border-borderSubtle overflow-hidden rounded-2xl border bg-white">
          <div className="border-borderSubtle flex items-center justify-between border-b px-5 py-4">
            <p className="font-jakarta text-brand text-sm font-semibold">Import jobs</p>
            <Button
              variant="ghost"
              size="icon-sm"
              beforeIcon={<RefreshCw size={14} className={cn(isRefetching && "animate-spin")} />}
              onClick={() => refetch()}
            />
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="bg-primary/8 flex h-12 w-12 items-center justify-center rounded-full">
                <FileSpreadsheet size={20} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-jakarta text-brand text-sm font-semibold">No import jobs yet</p>
                <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                  Upload a product sheet to get started
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                beforeIcon={<Upload size={13} />}
                onClick={() => setShowUploadModal(true)}
              >
                Upload products
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-borderSubtle border-b bg-gray-50/60">
                    {[
                      "Job ID",
                      "Filename",
                      "Status",
                      "Progress",
                      "Created by",
                      "Queued at",
                      "Completed at",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="font-jakarta text-brand/50 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-borderSubtle divide-y">
                  {jobs.map((job) => (
                    <JobRow key={job.jobId} job={job} onView={() => setSelectedJobId(job.jobId)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BulkUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onQueued={(job) => {
          setShowUploadModal(false)
          setSelectedJobId(job.jobId)
        }}
      />

      <BulkUploadJobDetailDrawer
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
        jobId={selectedJobId}
      />
    </div>
  )
}

// ── Instruction helpers ────────────────────────────────────────────────────────

const Col = ({ children }: { children: React.ReactNode }) => (
  <span className="font-jakarta bg-brand/5 text-brand text-xxs inline-flex items-center rounded px-1.5 py-0.5 font-semibold tracking-wide">
    {children}
  </span>
)

const Ext = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-brand/5 text-brand/70 text-xxs inline-flex items-center rounded px-1.5 py-0.5 font-mono font-semibold">
    {children}
  </span>
)

const Btn = ({ children }: { children: React.ReactNode }) => (
  <span className="font-jakarta border-borderSubtle text-brand text-xxs inline-flex items-center rounded border bg-white px-1.5 py-0.5 font-semibold shadow-sm">
    {children}
  </span>
)

const StatusPill = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: "success" | "info" | "neutral" | "error" | "warning"
}) => (
  <span
    className={cn(
      "font-jakarta text-xxs inline-flex items-center rounded-full px-2 py-0.5 font-semibold",
      variant === "success" && "bg-statusSuccessBg text-statusSuccess",
      variant === "info" && "bg-statusInfoBg text-statusInfo",
      variant === "neutral" && "bg-brand/5 text-brand/60",
      variant === "error" && "bg-danger/8 text-danger",
      variant === "warning" && "bg-statusWarningBg text-statusWarning",
    )}
  >
    {children}
  </span>
)

// ── Instruction data ───────────────────────────────────────────────────────────

const INSTRUCTION_STEPS: { title: string; points: React.ReactNode[] }[] = [
  {
    title: "Download the sample sheet",
    points: [
      <>
        Click <Btn>Sample sheet</Btn> in the top-right to get the official <Ext>.xlsx</Ext>{" "}
        template.
      </>,
      "Do not rename or reorder the column headers — the importer reads them by name.",
      "The first row must contain the headers exactly as provided.",
    ],
  },
  {
    title: "Fill in your products",
    points: [
      <>
        Required columns: <Col>Name</Col> <Col>Price</Col> <Col>Brand</Col> <Col>Stock qty</Col>{" "}
        <Col>Status</Col>.
      </>,
      <>
        Status must be one of: <StatusPill variant="success">active</StatusPill>{" "}
        <StatusPill variant="neutral">inactive</StatusPill>{" "}
        <StatusPill variant="warning">draft</StatusPill>.
      </>,
      <>
        <Col>Category</Col> <Col>Skin Type</Col> and <Col>Location</Col> values must exactly match
        records already in the system.
      </>,
      "Each SKU must be unique — duplicates within the same file will be rejected.",
      "SKUs that already exist in the catalog will also be rejected.",
    ],
  },
  {
    title: "Upload & queue the job",
    points: [
      <>
        Click <Btn>Upload products</Btn> and select your completed <Ext>.xlsx</Ext> file (or{" "}
        <Ext>.csv</Ext>).
      </>,
      <>
        Tick <Btn>First row contains headers</Btn> if your file includes a header row (recommended).
      </>,
      <>
        Click <Btn>Upload & queue</Btn> — the file is sent directly to secure storage, then queued.
      </>,
      "You will be taken to the job detail view automatically after queuing.",
    ],
  },
  {
    title: "Track progress",
    points: [
      "Jobs are processed asynchronously — the page refreshes every 20 seconds automatically.",
      <>
        Click <Btn>View details</Btn> on any row to see live row-by-row progress.
      </>,
      <>
        The detail view refreshes every 5 seconds while the job is{" "}
        <StatusPill variant="neutral">queued</StatusPill> or{" "}
        <StatusPill variant="info">processing</StatusPill>.
      </>,
      "Processing stops automatically once all rows are handled or a fatal error occurs.",
    ],
  },
  {
    title: "Review errors",
    points: [
      <>
        If rows fail, a <Btn>View failed rows</Btn> button appears in the job detail drawer.
      </>,
      "Each failed row shows its row number, error message, and the data that was submitted.",
      <>
        Click <Btn>Download error report</Btn> to get a formatted file of all failures.
      </>,
      "Fix the flagged rows in your sheet and re-upload — only the corrected rows are needed.",
    ],
  },
  {
    title: "Job statuses explained",
    points: [
      <>
        <StatusPill variant="neutral">Queued</StatusPill> — received and waiting for a worker to
        pick it up.
      </>,
      <>
        <StatusPill variant="info">Processing</StatusPill> — a worker is actively importing rows.
      </>,
      <>
        <StatusPill variant="success">Completed</StatusPill> — all rows were processed. Check the
        failed count for partial errors.
      </>,
      <>
        <StatusPill variant="error">Failed</StatusPill> — a fatal error stopped the job. Check the
        failure message for details.
      </>,
    ],
  },
]

const IMPORTANT_RULES: React.ReactNode[] = [
  <>
    The preferred file format is <Ext>.xlsx</Ext>. <Ext>.csv</Ext> is accepted but may cause
    encoding issues with special characters.
  </>,
  <>
    Maximum recommended file size is <Col>10 MB</Col>. Very large files may take several minutes to
    process.
  </>,
  <>
    A job stuck on <StatusPill variant="info">processing</StatusPill> for more than{" "}
    <Col>1 hour</Col> will be automatically marked as failed.
  </>,
  "Uploading the same file twice will create two separate jobs — there is no deduplication by filename.",
  "Partial imports are possible: a job can complete with some rows succeeded and others failed.",
]

// ── InstructionsCard ──────────────────────────────────────────────────────────

function InstructionsCard() {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-5">
      <div className="border-borderSubtle overflow-hidden rounded-2xl border bg-white">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div>
              <p className="font-jakarta text-brand text-sm font-semibold">How bulk import works</p>
              <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                Follow these steps to import products without errors
              </p>
            </div>
            {open ? (
              <ChevronUp size={15} className="text-brand/40 shrink-0" />
            ) : (
              <ChevronDown size={15} className="text-brand/40 shrink-0" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-borderSubtle border-t px-5 pt-5 pb-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {INSTRUCTION_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="bg-primary/8 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <span className="font-jakarta text-primary text-[11px] font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-jakarta text-brand text-sm font-semibold">{step.title}</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {step.points.map((point, j) => (
                        <li
                          key={j}
                          className="font-jakarta text-brand/60 flex items-start gap-1.5 text-xs leading-relaxed"
                        >
                          <span className="text-brand/30 mt-0.75 shrink-0">·</span>
                          <span className="flex flex-wrap items-center gap-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-statusWarningBorder bg-statusWarningBg mt-5 rounded-xl border px-4 py-3">
              <p className="font-jakarta text-brand text-xs font-semibold">Important rules</p>
              <ul className="mt-1.5 space-y-1.5">
                {IMPORTANT_RULES.map((rule, i) => (
                  <li
                    key={i}
                    className="font-jakarta text-brand/60 flex items-start gap-1.5 text-xs leading-relaxed"
                  >
                    <span className="text-statusWarning mt-0.75 shrink-0">·</span>
                    <span className="flex flex-wrap items-center gap-1">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function JobRow({ job, onView }: { job: BulkUploadJob; onView: () => void }) {
  const statusConfig = {
    queued: { label: "Queued", variant: "neutral" as const },
    processing: { label: "Processing", variant: "info" as const },
    completed: { label: "Completed", variant: "success" as const },
    failed: { label: "Failed", variant: "error" as const },
  }
  const sc = statusConfig[job.status] ?? { label: job.status, variant: "neutral" as const }

  return (
    <tr className="transition-colors hover:bg-gray-50/60">
      <td className="px-4 py-3">
        <span className="font-jakarta text-primary text-sm font-semibold">{job.jobId}</span>
      </td>
      <td className="max-w-[200px] px-4 py-3">
        <span className="font-jakarta text-brand block truncate text-sm">
          {job.originalFilename || "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge label={sc.label} variant={sc.variant} dot />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-blur h-1.5 w-20 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                job.status === "completed" && job.failedCount === 0
                  ? "bg-statusSuccess"
                  : job.status === "failed"
                    ? "bg-danger"
                    : "bg-primary",
              )}
              style={{ width: `${job.progressPercent}%` }}
            />
          </div>
          <span className="font-jakarta text-brand/50 text-xs">{job.progressPercent}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-jakarta text-brand/70 text-sm">{job.createdBy || "—"}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-jakarta text-brand/70 text-sm">
          {job.queuedAt ? formatDateToCustomFormat(job.queuedAt) : "—"}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-jakarta text-brand/70 text-sm">
          {job.completedAt ? formatDateToCustomFormat(job.completedAt) : "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onView}
          className="font-jakarta text-primary hover:text-primary/70 text-sm font-medium whitespace-nowrap transition-colors"
        >
          View details
        </button>
      </td>
    </tr>
  )
}
