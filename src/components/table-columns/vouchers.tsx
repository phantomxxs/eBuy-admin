import { Copy, MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { cn, formatCurrency } from "@/lib/utils"
import type { Voucher, VoucherStatus } from "@/types/vouchers"

export const VOUCHER_STATUS_CONFIG: Record<
  VoucherStatus,
  { label: string; variant: "success" | "info" | "neutral" | "warning" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "warning" },
  expired: { label: "Expired", variant: "neutral" },
  exhausted: { label: "Exhausted", variant: "info" },
  scheduled: { label: "Scheduled", variant: "default" },
}

function formatDiscountValue(voucher: Voucher): string {
  if (voucher.discountType === "percentage") return `${voucher.discountValue}%`
  return formatCurrency(voucher.discountValue)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const voucherColumns: ColumnDef<Voucher>[] = [
  {
    accessorKey: "code",
    header: "Code",
    size: 160,
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span
            className={cn(
              "bg-brand/5 border-borderSubtle inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs font-semibold tracking-widest whitespace-nowrap",
              "text-brand",
            )}
          >
            {row.original.code}
            <Copy size={11} className="text-brand/40 shrink-0" />
          </span>
        }
        content="Click to copy code"
      />
    ),
  },
  {
    accessorKey: "discountType",
    header: "Type",
    cell: ({ row }) => (
      <span className="bg-brand/5 font-jakarta text-brand/70 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap capitalize">
        {row.original.discountType === "percentage" ? "Percentage" : "Fixed amount"}
      </span>
    ),
  },
  {
    accessorKey: "discountValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-semibold whitespace-nowrap">
        {formatDiscountValue(row.original)}
      </span>
    ),
  },
  {
    id: "usage",
    header: "Used / Limit",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.usageCount.toLocaleString()} / {row.original.maxUsage.toLocaleString()}
      </span>
    ),
  },
  {
    id: "validity",
    header: "Validity",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = VOUCHER_STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        variant: "default" as const,
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

export function makeVoucherColumns(
  onView: (v: Voucher) => void,
  onEdit: (v: Voucher) => void,
  onToggle: (v: Voucher) => void,
  onDelete: (v: Voucher) => void,
): ColumnDef<Voucher>[] {
  return [
    ...voucherColumns.slice(0, -1),
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
              { label: "Edit voucher", onClick: () => onEdit(row.original) },
              ...(row.original.status === "active"
                ? [{ label: "Deactivate", onClick: () => onToggle(row.original) }]
                : row.original.status === "inactive"
                  ? [
                      {
                        label: "Activate",
                        onClick: () => onToggle(row.original),
                        variant: "success" as const,
                      },
                    ]
                  : []),
              {
                label: "Delete voucher",
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
