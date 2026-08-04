import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import type { Order } from "@/types/orders"
import { formatPrice } from "@/utils/shared"
import { PAYMENT_CONFIG } from "@/utils/orders"

export const recentOrderColumns: ColumnDef<Order>[] = [
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-semibold whitespace-nowrap">
        {formatPrice(row.original.grand_total ?? 0)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 130,
    cell: ({ row }) => {
      const cfg = PAYMENT_CONFIG[row.original.payment_status] ?? {
        label: row.original.payment_status,
        variant: "neutral" as const,
      }
      return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    size: 160,
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.customer_name}
      </span>
    ),
  },
]
