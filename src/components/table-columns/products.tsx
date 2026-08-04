import { MoreVertical } from "lucide-react"
import { type ColumnDef } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { formatPrice } from "@/utils/shared"
import type { Product, ProductStatus } from "@/types/products"
import { formatDateToCustomFormat } from "@/lib/utils"

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "warning" },
  draft: { label: "Draft", variant: "neutral" },
  archived: { label: "Archived", variant: "default" },
}

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "brandName",
    header: "Brand",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.brandName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Product",
    size: 250,
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-55 truncate text-sm font-medium tracking-[-0.04em] whitespace-nowrap capitalize">
            {row.original.name}
          </span>
        }
        content={row.original.name}
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
    cell: ({ row }) => {
      const names = row.original.categoryNames.length
        ? row.original.categoryNames
        : row.original.category
          ? row.original.category.split(", ").filter(Boolean)
          : []
      if (!names.length) return <span className="font-jakarta text-brand/60 text-sm">—</span>
      const visible = names.slice(0, 1)
      const overflow = names.slice(1)
      return (
        <span className="font-jakarta text-brand/60 flex items-center gap-1 text-sm whitespace-nowrap">
          <span>{visible.join(", ")}</span>
          {overflow.length > 0 && (
            <WithTooltip
              trigger={
                <span className="text-brand/40 cursor-default text-xs">
                  +{overflow.length} others
                </span>
              }
              content={overflow.join(", ")}
            />
          )}
        </span>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm font-semibold whitespace-nowrap">
        {formatPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.stock}
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
    accessorKey: "createdAt",
    header: "Created on",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.createdAt)}
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

export function makeProductColumns(
  onEdit: (product: Product) => void,
  onArchive: (product: Product) => void,
  onActivate: (product: Product) => void,
): ColumnDef<Product>[] {
  return [
    ...productColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const product = row.original
        const isArchivedOrInactive =
          product.status === "archived" ||
          product.status === "inactive" ||
          product.status === "draft"
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <RowActionsMenu
              trigger={
                <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <MoreVertical size={16} />
                </button>
              }
              items={[
                { label: "Edit", onClick: () => onEdit(product) },
                isArchivedOrInactive
                  ? {
                      label: "Activate",
                      onClick: () => onActivate(product),
                      variant: "success" as const,
                    }
                  : { label: "Archive", onClick: () => onArchive(product), variant: "destructive" },
              ]}
            />
          </div>
        )
      },
    },
  ]
}
