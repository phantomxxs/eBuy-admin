import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Dropdown from "@/components/ui/dropdown"
import { PAGE_SIZE_OPTIONS } from "@/components/ui/table-pagination"

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((s) => ({ label: String(s), value: String(s) }))

interface FloatingPaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  className?: string
}

export default function FloatingPagination({
  page,
  totalPages,
  onPrev,
  onNext,
  pageSize,
  onPageSizeChange,
  className,
}: FloatingPaginationProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "border-brand/8 flex items-center gap-3 rounded-full border bg-white px-4 py-2.5 shadow-lg",
        className,
      )}
    >
      {pageSize !== undefined && onPageSizeChange && (
        <>
          <Dropdown
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange(Number(v))}
            hideBorder={false}
            className="w-20"
          />
          <span className="bg-brand/10 h-4 w-px" />
        </>
      )}

      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="hover:bg-brand/5 flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-30"
      >
        <ChevronLeft size={14} className="text-brand" />
      </button>
      <span className="font-jakarta text-brand text-xs font-medium whitespace-nowrap">
        {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="hover:bg-brand/5 flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-30"
      >
        <ChevronRight size={14} className="text-brand" />
      </button>
    </div>
  )
}
