import { cn } from "@/lib/utils"

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn("bg-brand/8 animate-pulse rounded", className)} />
)

export default function OrderDetailSkeleton() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-5">
      {/* Section label */}
      <SkeletonLine className="mb-4 h-3 w-32" />

      {/* Detail rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="border-borderSubtle flex items-center justify-between border-b py-3"
        >
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-28" />
        </div>
      ))}

      {/* Order Items label */}
      <SkeletonLine className="mt-5 mb-4 h-3 w-24" />

      {/* Item rows */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="border-borderSubtle flex items-center justify-between border-b py-3"
        >
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-4 w-20" />
        </div>
      ))}

      {/* Total row */}
      <div className="border-borderSubtle flex items-center justify-between border-b py-3">
        <SkeletonLine className="h-4 w-12" />
        <SkeletonLine className="h-4 w-24" />
      </div>

      {/* Fulfilment Progress label */}
      <SkeletonLine className="mt-5 mb-6 h-3 w-36" />

      {/* Steps */}
      <div className="flex items-start justify-between pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <SkeletonLine className="h-6 w-6 rounded-full md:h-7 md:w-7" />
            <SkeletonLine className="h-2.5 w-14" />
            <SkeletonLine className="h-2.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}
