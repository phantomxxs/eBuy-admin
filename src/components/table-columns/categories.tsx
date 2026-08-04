import { Tag } from "lucide-react"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import type { Category, CategoryStatus } from "@/types/categories"

const STATUS_CONFIG: Record<CategoryStatus, { label: string; variant: "success" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "neutral" },
}

export function makeCategoryColumns(
  onEdit: (category: Category) => void,
  onDeactivate?: (category: Category) => void,
): ColumnDef<Category>[] {
  return [
    ...categoryColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(row.original)
            }}
            className="font-jakarta text-secondary hover:text-secondary/80 text-sm font-semibold whitespace-nowrap transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeactivate?.(row.original)
            }}
            className={cn(
              "font-jakarta text-sm font-semibold whitespace-nowrap transition-colors",
              row.original.status === "active"
                ? "text-brand/60 hover:text-brand"
                : "text-statusSuccess hover:text-statusSuccess/80",
            )}
          >
            {row.original.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ]
}

export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
          <Tag size={13} className="text-primary" />
        </div>
        <span className="font-jakarta text-brand text-sm font-medium tracking-[-0.04em] whitespace-nowrap">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "productsCount",
    header: "Products",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.product_count} products
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
        {formatDateToCustomFormat(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 160,
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <button className="font-jakarta text-secondary hover:text-secondary/80 text-sm font-semibold whitespace-nowrap transition-colors">
          Edit
        </button>
        <button
          className={cn(
            "font-jakarta text-sm font-semibold whitespace-nowrap transition-colors",
            row.original.status === "active"
              ? "text-brand/60 hover:text-brand"
              : "text-green-600 hover:text-green-700",
          )}
        >
          {row.original.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    ),
  },
]

export { STATUS_CONFIG as categoryStatusConfig }
