import { type ColumnDef } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { ActionOrder } from "@/types/dashboard"

export const actionOrderColumns: ColumnDef<ActionOrder>[] = [
  {
    accessorKey: "id",
    header: "Order",
    size: 120,
    cell: ({ row }) => (
      <span className="font-jakarta text-primary text-sm font-semibold whitespace-nowrap">
        #{row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.customer}
      </span>
    ),
  },
  {
    accessorKey: "items",
    header: "Items",
    size: 100,
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 block max-w-40 truncate text-sm">
            {row.original.items}
          </span>
        }
        content={row.original.items}
      />
    ),
  },
  {
    id: "actions",
    header: "",
    size: 80,
    cell: () => null,
  },
]
