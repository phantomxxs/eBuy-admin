import { useState, useRef, useEffect } from "react"
import { Upload, Download, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { showAlert } from "@/store/alerts"
import {
  useUploadAndQueueBulkUpload,
  useDownloadBulkUploadTemplate,
} from "@/store/mutations/bulk-upload"
import type { BulkUploadJob } from "@/types/bulk-upload"

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onQueued?: (job: BulkUploadJob) => void
}

type UploadState = "idle" | "dragging" | "selected" | "error"

export default function BulkUploadModal({ isOpen, onClose, onQueued }: BulkUploadModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [skipHeader, setSkipHeader] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAndQueueBulkUpload()
  const downloadTemplate = useDownloadBulkUploadTemplate()

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setUploadState("idle")
      setUploadError(null)
    }
  }, [isOpen])

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      showAlert({ variant: "error", message: `"${f.name}" exceeds the 5MB size limit.` })
      return
    }
    const valid = f.name.endsWith(".csv") || f.name.endsWith(".xlsx")
    setFile(f)
    setUploadError(null)
    setUploadState(valid ? "selected" : "error")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("idle")
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleClose = () => {
    setFile(null)
    setUploadState("idle")
    setUploadError(null)
    onClose()
  }

  const handleUpload = () => {
    if (!file) return
    setUploadError(null)
    upload.mutate(
      { file, skipHeader },
      {
        onSuccess: (job) => {
          handleClose()
          onQueued?.(job)
        },
        onError: (e) => setUploadError(e.message),
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="dialog"
      title="Bulk upload products"
      hideFooter
      preventClose={upload.isPending}
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={upload.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              beforeIcon={
                upload.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )
              }
              disabled={uploadState !== "selected" || upload.isPending}
              loading={upload.isPending}
              className="flex-1"
              onClick={handleUpload}
            >
              {upload.isPending ? "Uploading…" : "Upload & queue"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-6 py-5">
        {uploadError && (
          <div className="bg-danger/5 flex items-start gap-2.5 rounded-lg px-3.5 py-3">
            <AlertCircle size={15} className="text-danger mt-0.5 shrink-0" />
            <p className="font-jakarta text-danger text-sm">{uploadError}</p>
          </div>
        )}

        {/* Step 1 — download template */}
        <div className="border-borderSubtle rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-jakarta text-brand text-sm font-semibold">
                Step 1 — Download the template
              </p>
              <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                Fill in your products using the .xlsx template. Required: Name, SKU, Price, Brand,
                Stock qty, Status.
              </p>
            </div>
            <Button
              variant="subtle"
              size="sm"
              beforeIcon={<Download size={13} />}
              className="shrink-0"
              loading={downloadTemplate.isPending}
              onClick={() => downloadTemplate.mutate()}
            >
              Template
            </Button>
          </div>
        </div>

        {/* Step 2 — upload */}
        <div>
          <p className="font-jakarta text-brand mb-2 text-sm font-semibold">
            Step 2 — Upload your file
          </p>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setUploadState("dragging")
            }}
            onDragLeave={() => setUploadState(file ? "selected" : "idle")}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              uploadState === "dragging" && "border-primary bg-primary/4",
              uploadState === "selected" && "border-statusSuccess bg-statusSuccessBg",
              uploadState === "error" && "border-danger bg-danger/4",
              uploadState === "idle" && "border-borderSubtle hover:border-primary/40 bg-gray-50",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            {uploadState === "selected" && file ? (
              <>
                <CheckCircle2 size={32} className="text-statusSuccess" />
                <div>
                  <p className="font-jakarta text-brand text-sm font-semibold">{file.name}</p>
                  <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                    {(file.size / 1024).toFixed(1)} KB · Click to replace
                  </p>
                </div>
              </>
            ) : uploadState === "error" ? (
              <>
                <AlertCircle size={32} className="text-danger" />
                <div>
                  <p className="font-jakarta text-danger text-sm font-semibold">
                    Unsupported file type
                  </p>
                  <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                    Please upload a .csv or .xlsx file
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-primary/8 flex h-12 w-12 items-center justify-center rounded-full">
                  <Upload size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-jakarta text-brand text-sm font-semibold">
                    {uploadState === "dragging" ? "Drop file here" : "Drop file or click to browse"}
                  </p>
                  <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                    Supports .xlsx (preferred) and .csv — max 10 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skip header checkbox */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={skipHeader}
            onChange={(e) => setSkipHeader(e.target.checked)}
            className="accent-primary h-4 w-4 rounded"
          />
          <span className="font-jakarta text-brand text-sm">First row contains headers</span>
        </label>

        {file && (
          <button
            onClick={() => {
              setFile(null)
              setUploadState("idle")
            }}
            className="font-jakarta text-hint hover:text-danger flex items-center gap-1.5 text-xs transition-colors"
          >
            <X size={12} />
            Remove file
          </button>
        )}
      </div>
    </Modal>
  )
}
