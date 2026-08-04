import { MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import type { Discount, DiscountStatus } from "@/types/discounts"

export const DISCOUNT_STATUS_CONFIG: Record<
  DiscountStatus,
  { label: string; variant: "success" | "info" | "neutral" | "warning" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  scheduled: { label: "Scheduled", variant: "info" },
  expired: { label: "Expired", variant: "neutral" },
  draft: { label: "Draft", variant: "warning" },
}

export const discountColumns: ColumnDef<Discount>[] = [
  {
    accessorKey: "name",
    header: "Discount",
    size: 200,
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-48 truncate text-sm font-semibold tracking-[-0.04em] whitespace-nowrap">
            {row.original.name}
          </span>
        }
        content={row.original.name}
      />
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="bg-brand/5 font-jakarta text-brand/70 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-semibold whitespace-nowrap">
        {row.original.discount}
      </span>
    ),
  },
  {
    accessorKey: "appliesTo",
    header: "Applies to",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.appliesTo}
      </span>
    ),
  },
  {
    accessorKey: "used",
    header: "Used",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.used.toLocaleString()}
      </span>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = DISCOUNT_STATUS_CONFIG[row.original.status]
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

export function makeDiscountColumns(
  onView: (p: Discount) => void,
  onPause: (p: Discount) => void,
  onActivate: (p: Discount) => void,
  onDelete: (p: Discount) => void,
): ColumnDef<Discount>[] {
  return [
    ...discountColumns.slice(0, -1),
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
              row.original.status === "active"
                ? { label: "Pause discount", onClick: () => onPause(row.original) }
                : {
                    label: "Activate discount",
                    onClick: () => onActivate(row.original),
                    variant: "success" as const,
                  },
              {
                label: "Delete discount",
                onClick: () => onDelete(row.original),
                variant: "destructive" as const,
              },
            ]}
          />
        </div>
      ),
    },
  ]
}

// Keep old export name for backward compat
export { DISCOUNT_STATUS_CONFIG as discountStatusConfig }
