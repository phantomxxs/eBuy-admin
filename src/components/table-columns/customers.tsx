import { MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { WithTooltip } from "@/components/ui/tooltip"
import { formatPrice } from "@/utils/shared"
import type { CustomerDetail, CustomerStatus } from "@/types/customers"
import { formatDateToCustomFormat } from "@/lib/utils"
import { getInitials } from "@/store/normalizers/customers"

const STATUS_CONFIG: Record<
  CustomerStatus,
  { label: string; variant: "success" | "warning" | "error" | "neutral" | "default" }
> = {
  Active: { label: "Active", variant: "success" },
  Inactive: { label: "Inactive", variant: "warning" },
  Guest: { label: "Geust", variant: "neutral" },
}

export const customerColumns: ColumnDef<CustomerDetail>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    size: 235,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <span className="font-jakarta text-primary text-xs font-bold">
            {getInitials(row.original.customer_name)}
          </span>
        </div>
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand inline-block max-w-40 truncate text-sm font-medium tracking-[-0.04em] whitespace-nowrap">
              {row.original.customer_name}
            </span>
          }
          content={row.original.customer_name}
        />
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "Customer ID",
    cell: ({ row }) => (
      <span className="text-brand/60 font-mono text-sm whitespace-nowrap">
        {row.original.customer_id}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email address",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 inline-block max-w-48 truncate text-sm whitespace-nowrap">
            {row.original.email}
          </span>
        }
        content={row.original.email}
      />
    ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.order_count}
      </span>
    ),
  },
  {
    accessorKey: "totalSpend",
    header: "Total spend",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-semibold whitespace-nowrap">
        {formatPrice(row.original.total_spend)}
      </span>
    ),
  },
  {
    accessorKey: "lastPurchase",
    header: "Last purchase",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.last_purchase)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status]
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

export function makeCustomerColumns(
  onView: (customer: CustomerDetail) => void,
  onDelete: (cutomerDCustomerDetail: CustomerDetail) => void,
): ColumnDef<CustomerDetail>[] {
  return [
    ...customerColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <RowActionsMenu
              trigger={
                <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <MoreVertical size={16} />
                </button>
              }
              items={[
                { label: "View customer", onClick: () => onView(customer) },
                {
                  label: "Delete customer",
                  onClick: () => onDelete(customer),
                  variant: "destructive",
                },
              ]}
            />
          </div>
        )
      },
    },
  ]
}

export { STATUS_CONFIG as customerStatusConfig, formatPrice as formatCustomerPrice }
