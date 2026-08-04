import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Dropdown from "@/components/ui/dropdown"

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((s) => ({ label: String(s), value: String(s) }))

interface TablePaginationProps {
  page: number
  pageSize: number
  /** Total items after filtering — used to compute pages and "of N" */
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  entityLabel?: string
  className?: string
}

export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  entityLabel = "entries",
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const [isJumping, setIsJumping] = useState(false)
  const [jumpValue, setJumpValue] = useState("")

  const commitJump = () => {
    const n = parseInt(jumpValue, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) onPageChange(n)
    setIsJumping(false)
    setJumpValue("")
  }

  return (
    <div
      className={cn(
        "border-borderSubtle flex items-center justify-between border-t px-4 py-3",
        className,
      )}
    >
      {/* Left: showing range */}
      <span className="font-jakarta text-brand/60 text-sm font-medium">
        {total === 0
          ? `No ${entityLabel}`
          : `Showing ${from}–${to} of ${total.toLocaleString()} ${entityLabel}`}
      </span>

      {/* Right: limit selector + prev/next */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-jakarta text-brand/50 text-sm">Rows per page</span>
          <Dropdown
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(v) => {
              onPageSizeChange(Number(v))
              onPageChange(1)
            }}
            hideBorder={false}
            className="w-20"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="hover:bg-brand/5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={16} className="text-brand" />
          </button>
          {isJumping ? (
            <input
              autoFocus
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitJump()
                if (e.key === "Escape") {
                  setIsJumping(false)
                  setJumpValue("")
                }
              }}
              onBlur={commitJump}
              className="font-jakarta text-brand border-primary ring-primary/20 h-8 w-16 [appearance:textfield] rounded-lg border bg-white text-center text-sm font-medium focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <button
              onClick={() => {
                setIsJumping(true)
                setJumpValue("")
              }}
              className="font-jakarta text-brand hover:bg-brand/5 min-w-16 rounded-lg px-1 py-1 text-center text-sm font-medium transition-colors"
              title="Click to jump to page"
            >
              {page} / {totalPages}
            </button>
          )}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="hover:bg-brand/5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
          >
            <ChevronRight size={16} className="text-brand" />
          </button>
        </div>
      </div>
    </div>
  )
}
