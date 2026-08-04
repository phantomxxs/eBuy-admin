import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { LowStockItem, StockLevel } from "@/types/dashboard"

const STOCK_CONFIG: Record<StockLevel, { label: string; variant: "warning" | "error" }> = {
  low: { label: "Low", variant: "warning" },
  critical: { label: "Critical", variant: "error" },
}

export const lowStockColumns: ColumnDef<LowStockItem>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-40 truncate text-xs font-medium whitespace-nowrap">
            {row.original.product}
          </span>
        }
        content={row.original.product}
      />
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const cfg = STOCK_CONFIG[row.original.stockStatus]
      return <StatusBadge label={String(row.original.stock)} variant={cfg.variant} />
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-xs whitespace-nowrap">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-xs whitespace-nowrap">
        {row.original.location}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button className="font-jakarta text-primary text-xs font-semibold whitespace-nowrap hover:underline">
        Restock
      </button>
    ),
  },
]
