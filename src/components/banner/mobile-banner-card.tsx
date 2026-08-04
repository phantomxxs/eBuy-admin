import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/data-table"
import { bannerStatusConfig, TYPE_COLORS } from "@/components/table-columns/banners"
import type { Banner } from "@/types/banners"

const MobileBannerCard = ({ banner, onView }: { banner: Banner; onView: () => void }) => {
  const cfg = bannerStatusConfig[banner.status]
  const typeClass = TYPE_COLORS[banner.type] ?? "bg-gray-50 text-gray-600"
  return (
    <div
      onClick={onView}
      className="border-line flex items-start justify-between rounded-lg border bg-white p-4"
    >
      <div className="flex-1 pr-4">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{banner.title}</p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{banner.duration}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={cn(
              "font-jakarta rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
              typeClass,
            )}
          >
            {banner.type}
          </span>
          <span className="font-jakarta text-brand/50 text-xs">{banner.placement}</span>
        </div>
        <p className="font-jakarta text-brand/50 mt-1 text-xs">
          {banner.impressions.toLocaleString()} impressions · {banner.ctr} CTR
        </p>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </div>
  )
}

export default MobileBannerCard
