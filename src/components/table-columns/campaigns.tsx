import { MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { Campaign } from "@/types/customers"

export const CAMPAIGN_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "error" | "neutral" | "default" }
> = {
  sent: { label: "Sent", variant: "success" },
  sending: { label: "Sending", variant: "warning" },
  scheduled: { label: "Scheduled", variant: "neutral" },
  failed: { label: "Failed", variant: "error" },
  draft: { label: "Draft", variant: "default" },
  completed: { label: "Completed", variant: "success" },
}

export const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand max-w-64 truncate text-sm font-medium tracking-[-0.04em] whitespace-nowrap">
        {row.original.subject}
      </span>
    ),
  },
  {
    accessorKey: "recipientCount",
    header: "Recipients",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.recipientCount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "sentCount",
    header: "Sent",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.sentCount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.createdAt, true)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = CAMPAIGN_STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        variant: "default" as const,
      }
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

export function makeCampaignColumns(onView: (c: Campaign) => void): ColumnDef<Campaign>[] {
  return [
    ...campaignColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActionsMenu
            trigger={
              <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <MoreVertical size={16} />
              </button>
            }
            items={[{ label: "View details", onClick: () => onView(row.original) }]}
          />
        </div>
      ),
    },
  ]
}
