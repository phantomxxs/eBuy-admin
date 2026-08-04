import { MapPin, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import type { Location, LocationStatus } from "@/types/locations"

const STATUS_CONFIG: Record<
  LocationStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "warning" },
  closed: { label: "Closed", variant: "default" },
}

const EnabledPill = ({ enabled, label }: { enabled: boolean; label?: string }) => (
  <span
    className={cn(
      "font-jakarta inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
      enabled ? "bg-green-50 text-green-700" : "text-brand/40 bg-brand/4",
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", enabled ? "bg-green-500" : "bg-brand/30")} />
    {label ?? (enabled ? "Yes" : "No")}
  </span>
)

export const locationColumns: ColumnDef<Location>[] = [
  {
    accessorKey: "name",
    header: "Store name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-primary shrink-0" />
        <span className="font-jakarta text-brand font-medium whitespace-nowrap">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "storeId",
    header: "Store ID",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.storeId}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 inline-block max-w-48 truncate text-sm whitespace-nowrap">
            {row.original.address}
          </span>
        }
        content={row.original.address}
      />
    ),
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.contact}
      </span>
    ),
  },
  {
    accessorKey: "pickupEnabled",
    header: "Pickup",
    cell: ({ row }) => <EnabledPill enabled={row.original.pickupEnabled} />,
  },
  {
    accessorKey: "walkInEnabled",
    header: "Walk-in",
    cell: ({ row }) => <EnabledPill enabled={row.original.walkInEnabled} />,
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

export function makeLocationColumns(
  onEdit: (location: Location) => void,
  onDelete: (location: Location) => void,
): ColumnDef<Location>[] {
  return [
    ...locationColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActionsMenu
            items={[
              { label: "Edit location", onClick: () => onEdit(row.original) },
              {
                label: "Delete location",
                onClick: () => onDelete(row.original),
                variant: "destructive",
              },
            ]}
          />
        </div>
      ),
    },
  ]
}

export { STATUS_CONFIG as locationStatusConfig, EnabledPill }
