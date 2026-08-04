import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { InventoryItem, InventoryStatus } from "@/types/inventory"

const STATUS_CONFIG: Record<
  InventoryStatus,
  { label: string; variant: "success" | "warning" | "error" | "neutral" | "default" }
> = {
  in_stock: { label: "In stock", variant: "success" },
  low_stock: { label: "Low stock", variant: "warning" },
  out_of_stock: { label: "Out of stock", variant: "error" },
}

export const formatInventoryPrice = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-48 truncate font-medium whitespace-nowrap">
            {row.original.product}
          </span>
        }
        content={row.original.product}
      />
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.category}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm font-semibold whitespace-nowrap">
        {formatInventoryPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-jakarta text-sm font-semibold whitespace-nowrap",
          row.original.status === "out_of_stock"
            ? "text-red-500"
            : row.original.status === "low_stock"
              ? "text-amber-600"
              : "text-brand/60",
        )}
      >
        {row.original.stock}
      </span>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.location}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status]
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
    accessorKey: "createdAt",
    header: "Created on",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.createdAt}
      </span>
    ),
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

export { STATUS_CONFIG as inventoryStatusConfig }
