import { MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { formatPrice } from "@/utils/shared"
import type { Order } from "@/types/orders"
import { formatDateToCustomFormat } from "@/lib/utils"
import { PAYMENT_CONFIG, FULFILLMENT_CONFIG, formatOrderType } from "@/utils/orders"

export function makeOrderColumns(onView: (order: Order) => void): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-jakarta text-primary text-sm font-semibold whitespace-nowrap">
          {row.original.increment_id}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <WithTooltip
            trigger={
              <span className="font-jakarta text-brand inline-block max-w-40 truncate font-medium whitespace-nowrap">
                {row.original.customer_name}
              </span>
            }
            content={row.original.customer_name}
          />
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand/60 flex max-w-45 items-center gap-1 text-sm">
              <span className="truncate">{row.original.items_summary}</span>
              <span className="text-brand/40 shrink-0 text-xs">({row.original.qty})</span>
            </span>
          }
          content={row.original.items_summary}
        />
      ),
    },
    {
      accessorKey: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const cfg = PAYMENT_CONFIG[row.original.payment_status] ?? {
          label: row.original.payment_status,
          variant: "neutral" as const,
        }
        return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      },
    },
    {
      accessorKey: "fulfillment",
      header: "Fulfillment",
      cell: ({ row }) => {
        const cfg = FULFILLMENT_CONFIG[row.original.fulfillment_status] ?? {
          label: row.original.fulfillment_status,
          variant: "neutral" as const,
        }
        return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      },
    },
    {
      accessorKey: "order_type",
      header: "Order type",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {formatOrderType(row.original.order_type)}
        </span>
      ),
    },
    {
      accessorKey: "purchasedOn",
      header: "Purchased on",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {formatDateToCustomFormat(row.original.created_at, true)}
        </span>
      ),
    },
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
            items={[{ label: "View", onClick: () => onView(row.original) }]}
          />
        </div>
      ),
    },
  ]
}

export { formatPrice as formatOrderPrice, PAYMENT_CONFIG, FULFILLMENT_CONFIG }
