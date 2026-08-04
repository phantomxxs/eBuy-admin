import { useState, useRef, useEffect } from "react"
import { Download, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { exportToCsv } from "@/utils/csv"

interface ExportButtonProps<T extends object> {
  /** Current page data (already loaded) */
  currentData: T[]
  /** Filename prefix for the downloaded CSV */
  filename: string
  /** Called when user chooses "Export all" — should fetch all records and return them */
  onFetchAll?: () => Promise<T[]>
  /** Called when user chooses "Export all" — handles download externally (skips client-side CSV) */
  onExportAll?: () => void
  /** Render as icon-only button (no label, no chevron) */
  iconOnly?: boolean
  className?: string
}

export default function ExportButton<T extends object>({
  currentData,
  filename,
  onFetchAll,
  onExportAll,
  iconOnly = false,
  className,
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleCurrentPage = () => {
    exportToCsv(currentData, `${filename}-current-page`)
    setOpen(false)
  }

  const handleAll = async () => {
    if (!onFetchAll) return
    setLoadingAll(true)
    setOpen(false)
    try {
      const all = await onFetchAll()
      exportToCsv(all, `${filename}-all`)
    } finally {
      setLoadingAll(false)
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "font-jakarta text-brand/70 border-borderSubtle flex items-center gap-2 rounded-lg border bg-white text-sm font-medium transition-colors hover:bg-gray-50",
          iconOnly ? "h-10 w-10 justify-center" : "px-4 py-2.5",
        )}
      >
        {loadingAll ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {!iconOnly && (
          <>
            Export CSV
            <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>

      {open && (
        <div className="border-borderSubtle absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border bg-white shadow-lg">
          <button
            onClick={handleCurrentPage}
            className="font-jakarta text-brand/80 hover:bg-brand/[0.03] flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors"
          >
            <Download size={13} className="shrink-0" />
            Export current page
          </button>
          {(onFetchAll || onExportAll) && (
            <button
              onClick={onExportAll ?? handleAll}
              className="font-jakarta text-brand/80 hover:bg-brand/[0.03] border-borderSubtle flex w-full items-center gap-2.5 border-t px-4 py-3 text-left text-sm transition-colors"
            >
              <Download size={13} className="shrink-0" />
              Export all records
            </button>
          )}
        </div>
      )}
    </div>
  )
}
