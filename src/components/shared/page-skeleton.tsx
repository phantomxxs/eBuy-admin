import { Filter, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PageSkeletonProps {
  metricCount?: number
  rowCount?: number
}

export default function PageSkeleton({ metricCount = 4, rowCount = 6 }: PageSkeletonProps) {
  return (
    <div className="page-bg min-h-full">
      {/* Header */}
      <div className="border-borderSubtle flex items-center justify-between border-b bg-white p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Metric cards */}
      <div
        className="no-scrollbar flex gap-3 overflow-x-auto p-4 lg:grid lg:p-6"
        style={{ gridTemplateColumns: `repeat(${metricCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: metricCount }).map((_, i) => (
          <Skeleton key={i} className="h-20.5 min-w-37.5 rounded-xl md:h-24 md:min-w-0" />
        ))}
      </div>

      {/* Table section */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        {/* Toolbar */}
        <div className="lg:border-borderSubtle flex flex-col gap-3 px-4 pb-4 md:p-4 lg:flex-row lg:items-center lg:border-b">
          <div className="border-borderSubtle flex w-full items-center gap-2 rounded-full border bg-white px-4 py-2.5 lg:max-w-100">
            <Search size={14} className="text-brand/30 shrink-0" />
            <span className="font-jakarta text-brand/30 flex-1 bg-transparent text-sm tracking-[-0.04em]">
              Search…
            </span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="border-borderSubtle font-jakarta text-brand/30 flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium">
              <Filter size={14} />
              Filter
            </div>
          </div>
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden lg:block">
          {/* Table header */}
          <div className="border-borderSubtle flex items-center gap-4 border-b px-4 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3" style={{ width: `${[15, 12, 30, 14, 12][i]}%` }} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: rowCount }).map((_, i) => (
            <div
              key={i}
              className="border-borderSubtle flex items-center gap-4 border-b px-4 py-3.5 last:border-0"
            >
              <Skeleton className="h-4" style={{ width: "15%" }} />
              <Skeleton className="h-4" style={{ width: "12%" }} />
              <Skeleton className="h-4" style={{ width: "30%" }} />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>

        {/* Mobile card skeletons */}
        <div className="space-y-2 px-4 py-2 lg:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-line flex items-start gap-3 rounded-lg bg-white p-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
