import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { Transaction, TransactionStatus } from "@/types/transactions"

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "error" | "neutral" | "default" }
> = {
  Successful: { label: "Successful", variant: "success" },
  Pending: { label: "Pending", variant: "warning" },
  Failed: { label: "Failed", variant: "error" },
  Refunded: { label: "Refunded", variant: "neutral" },
}

export const METHOD_COLORS: Record<string, string> = {
  Card: "bg-blue-50 text-blue-700",
  Transfer: "bg-purple-50 text-purple-700",
  Cash: "bg-green-50 text-green-700",
  Wallet: "bg-amber-50 text-amber-700",
}

export const TYPE_COLORS: Record<string, string> = {
  Sale: "bg-blushDim text-secondary",
  Refund: "bg-red-50 text-red-600",
  Adjustment: "bg-gray-50 text-gray-600",
}

export const formatTransactionAmount = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="text-brand/70 font-mono text-xs whitespace-nowrap">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="text-brand/60 font-mono text-xs whitespace-nowrap">
        {row.original.orderId}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-40 truncate font-medium whitespace-nowrap">
            {row.original.customer}
          </span>
        }
        content={row.original.customer}
      />
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
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
          METHOD_COLORS[row.original.method] ?? "bg-gray-50 text-gray-600",
        )}
      >
        {row.original.method}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand font-semibold whitespace-nowrap">
        {formatTransactionAmount(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        variant: "default" as const,
      }
      return (
        <StatusBadge
          label={cfg.label}
          variant={cfg.variant as "success" | "warning" | "neutral" | "default"}
          dot
        />
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.date, true)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 60,
    cell: () => <div className="w-15" />,
  },
]

export function makeTransactionColumns(
  onView: (tx: Transaction) => void,
): ColumnDef<Transaction>[] {
  return [
    ...transactionColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onView(row.original)
          }}
          className="font-jakarta text-primary text-xs font-semibold whitespace-nowrap hover:underline"
        >
          View
        </button>
      ),
    },
  ]
}

export { STATUS_CONFIG as transactionStatusConfig }
