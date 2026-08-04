import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import type { Banner, BannerStatus } from "@/types/banners"

export const BANNER_STATUS_CONFIG: Record<
  BannerStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" | "error" }
> = {
  active: { label: "Active", variant: "success" },
  scheduled: { label: "Scheduled", variant: "warning" },
  inactive: { label: "Inactive", variant: "neutral" },
  expired: { label: "Expired", variant: "default" },
  draft: { label: "Draft", variant: "neutral" },
}

export const TYPE_COLORS: Record<string, string> = {
  Promotional: "bg-blushDim text-secondary",
  Informational: "bg-blue-50 text-blue-700",
  Seasonal: "bg-amber-50 text-amber-700",
}

export const formatImpressions = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()

export const bannerColumns: ColumnDef<Banner>[] = [
  {
    accessorKey: "title",
    header: "Banner title",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-52 truncate font-medium whitespace-nowrap">
            {row.original.title}
          </span>
        }
        content={row.original.title}
      />
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.duration}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
          TYPE_COLORS[row.original.type] ?? "bg-gray-50 text-gray-600",
        )}
      >
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "placement",
    header: "Placement",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.placement}
      </span>
    ),
  },
  {
    accessorKey: "isHeroBanner",
    header: "Hero banner",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.isHeroBanner ? "Yes" : "No"}
        variant={row.original.isHeroBanner ? "success" : "neutral"}
        dot
      />
    ),
  },
  {
    accessorKey: "targetCustomers",
    header: "Target customers",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.targetCustomers}
      </span>
    ),
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.impressions.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "ctr",
    header: "CTR",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm font-semibold whitespace-nowrap">
        {row.original.ctr}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = BANNER_STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        variant: "neutral" as const,
      }
      return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    },
  },
  {
    id: "actions",
    header: "",
    size: 60,
    cell: () => (
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>
    ),
  },
]

export function makeBannerColumns(
  onView: (b: Banner) => void,
  onEdit: (b: Banner) => void,
  onDelete: (b: Banner) => void,
): ColumnDef<Banner>[] {
  return [
    ...bannerColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActionsMenu
            trigger={
              <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <MoreVertical size={16} />
              </button>
            }
            items={[
              { label: "View details", onClick: () => onView(row.original) },
              { label: "Edit banner", onClick: () => onEdit(row.original) },
              {
                label: "Delete banner",
                onClick: () => onDelete(row.original),
                variant: "destructive",
              },
            ]}
          />
        </div>
      ),
    },
  ]
}

// Keep old export name for backward compat
export { BANNER_STATUS_CONFIG as bannerStatusConfig }
