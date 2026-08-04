import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { type ColumnDef } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { ActivityLog } from "@/types/activity-logs"

export const MODULE_COLORS: Record<string, string> = {
  Products: "bg-blushDim text-secondary",
  Orders: "bg-blue-50 text-blue-700",
  Transactions: "bg-purple-50 text-purple-700",
  "Users & Roles": "bg-amber-50 text-amber-700",
  Banners: "bg-teal-50 text-teal-700",
  Promotions: "bg-green-50 text-green-700",
  Inventory: "bg-orange-50 text-orange-700",
  Settings: "bg-gray-50 text-gray-600",
  Messaging: "bg-indigo-50 text-indigo-700",
  Locations: "bg-pink-50 text-pink-700",
  Categories: "bg-cyan-50 text-cyan-700",
}

export const activityLogColumns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/50 text-xs whitespace-nowrap">
        {formatDateToCustomFormat(row.original.date, true)}
      </span>
    ),
  },
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-72 truncate text-sm whitespace-nowrap">
            {row.original.activity}
          </span>
        }
        content={row.original.activity}
      />
    ),
  },
  {
    accessorKey: "module",
    header: "Page / Module",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
          MODULE_COLORS[row.original.page_module] ?? "bg-gray-50 text-gray-600",
        )}
      >
        {row.original.page_module}
      </span>
    ),
  },
  {
    accessorKey: "by",
    header: "By",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="bg-primary/15 font-jakarta text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {row.original.byInitials}
        </div>
        <span className="font-jakarta text-brand text-sm whitespace-nowrap">{row.original.by}</span>
      </div>
    ),
  },
]
