import { Filter, X } from "lucide-react"
import SearchIcon from "@/components/shared/search-icon"
import ExportButton from "@/components/shared/export-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TableToolbarProps<T extends object> {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  exportProps?: {
    currentData: T[]
    filename: string
    onFetchAll?: () => Promise<T[]>
    onExportAll?: () => void
  }
  onFilterClick?: () => void
  activeFiltersCount?: number
  className?: string
}

export default function TableToolbar<T extends object>({
  search,
  onSearchChange,
  placeholder = "Search…",
  exportProps,
  onFilterClick,
  activeFiltersCount = 0,
  className,
}: TableToolbarProps<T>) {
  return (
    <div
      className={cn(
        "lg:border-borderSubtle flex items-center gap-2 px-4 py-4 md:p-4 lg:border-b",
        className,
      )}
    >
      <div className="border-borderSubtle flex flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5 lg:max-w-125">
        <SearchIcon />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="font-jakarta text-brand placeholder:text-brand/60 flex-1 bg-transparent text-sm tracking-[-0.04em] outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Mobile: icon-only buttons */}
      <div className="flex items-center gap-2 lg:hidden">
        {onFilterClick && (
          <Button
            variant="outline"
            size="icon"
            onClick={onFilterClick}
            className={cn(activeFiltersCount > 0 && "border-primary/20 text-primary")}
          >
            <Filter size={15} />
            {activeFiltersCount > 0 && (
              <span className="bg-primary absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}
        {exportProps && (
          <ExportButton
            currentData={exportProps.currentData}
            filename={exportProps.filename}
            onFetchAll={exportProps.onFetchAll}
            onExportAll={exportProps.onExportAll}
            iconOnly
          />
        )}
      </div>

      {/* Desktop: labelled buttons */}
      <div className="hidden items-center gap-3 lg:flex">
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className={cn(
              "font-jakarta border-borderSubtle flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50",
              activeFiltersCount > 0 ? "border-primary/20 text-primary" : "text-brand/70",
            )}
          >
            <Filter size={14} />
            Filter
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-xxs flex h-4 w-4 items-center justify-center rounded-full font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
        {exportProps && (
          <ExportButton
            currentData={exportProps.currentData}
            filename={exportProps.filename}
            onFetchAll={exportProps.onFetchAll}
            onExportAll={exportProps.onExportAll}
          />
        )}
      </div>
    </div>
  )
}
