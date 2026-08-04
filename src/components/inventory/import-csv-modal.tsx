import { useRef, useState } from "react"
import { X, Upload, FileText, Download } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useImportInventory } from "@/store/mutations/inventory"
import { showAlert } from "@/store/alerts"

interface ImportCsvModalProps {
  isOpen: boolean
  onClose: () => void
}

const CSV_TEMPLATE_HEADER = "sku,store_code,qty,cost_price,reason,notes"
const CSV_TEMPLATE_EXAMPLE = "TUL-9E5368C9,STR-001,25,5000,Initial stock,INV-42"

export default function ImportCsvModal({ isOpen, onClose }: ImportCsvModalProps) {
  const importInventory = useImportInventory()
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      showAlert({ variant: "error", message: "Only CSV files are accepted." })
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      showAlert({ variant: "error", message: `"${f.name}" exceeds the 5MB size limit.` })
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = () => {
    if (!file) return
    importInventory.mutate(file, {
      onSuccess: () => {
        showAlert({ variant: "success", message: "Inventory imported successfully" })
        onClose()
        setFile(null)
      },
      onError: (error) =>
        showAlert({
          variant: "error",
          message: error.message || "Failed to import inventory. Please try again.",
        }),
    })
  }

  const handleClose = () => {
    if (importInventory.isPending) return
    setFile(null)
    onClose()
  }

  const downloadTemplate = () => {
    const content = [CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE].join("\n")
    const blob = new Blob([content], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory-import-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={importInventory.isPending}
      variant="dialog"
      className="p-0"
      width="480px"
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">Import inventory CSV</h2>
          <button
            onClick={handleClose}
            disabled={importInventory.isPending}
            className="text-brand/40 hover:text-brand rounded p-1"
          >
            <X size={16} />
          </button>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-6 py-4">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={importInventory.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleSubmit}
              loading={importInventory.isPending}
              disabled={!file}
              className="flex-1"
            >
              Import
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Template download */}
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="font-jakarta text-sm text-amber-800">
            Use the template to format your CSV correctly.
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="font-jakarta text-primary ml-3 flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
          >
            <Download size={13} />
            Template
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={cn(
            "border-borderSubtle flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            dragOver && "border-primary/50 bg-primary/4",
            file && "cursor-default",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ""
            }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary/8 flex h-10 w-10 items-center justify-center rounded-full">
                <FileText size={18} className="text-primary" />
              </div>
              <p className="font-jakarta text-brand max-w-xs truncate text-sm font-medium">
                {file.name}
              </p>
              <p className="font-jakarta text-brand/50 text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                className="font-jakarta text-danger text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="border-borderSubtle flex h-10 w-10 items-center justify-center rounded-full border">
                <Upload size={16} className="text-brand/40" />
              </div>
              <p className="font-jakarta text-brand text-sm font-medium">
                Drop your CSV here, or <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="font-jakarta text-brand/40 text-xs">CSV files only</p>
            </div>
          )}
        </div>

        {/* Column guide */}
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="font-jakarta text-brand/60 mb-1.5 text-xs font-semibold tracking-wide uppercase">
            Required columns
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {["sku", "store_code", "qty", "cost_price", "reason", "notes"].map((col) => (
              <span key={col} className="font-jakarta text-brand/70 font-mono text-xs">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
