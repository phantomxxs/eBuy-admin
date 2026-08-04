import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import type { Message, MessageStatus } from "@/types/messages"

const STATUS_CONFIG: Record<
  MessageStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" | "error" }
> = {
  sent: { label: "Sent", variant: "success" },
  scheduled: { label: "Scheduled", variant: "warning" },
  draft: { label: "Draft", variant: "neutral" },
  failed: { label: "Failed", variant: "error" },
}

export const CHANNEL_COLORS: Record<string, string> = {
  Email: "bg-blue-50 text-blue-700",
  SMS: "bg-green-50 text-green-700",
  Push: "bg-purple-50 text-purple-700",
  "In-app": "bg-amber-50 text-amber-700",
}

export const messageColumns: ColumnDef<Message>[] = [
  {
    accessorKey: "title",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-52">
        <WithTooltip
          trigger={
            <p className="font-jakarta text-brand line-clamp-1 truncate text-sm font-medium whitespace-nowrap">
              {row.original.title}
            </p>
          }
          content={row.original.title}
        />
        <p className="font-jakarta text-brand/50 text-xs whitespace-nowrap">
          {row.original.sentAt}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "sentTo",
    header: "Sent to",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.sentTo}
      </span>
    ),
  },
  {
    accessorKey: "channels",
    header: "Channels",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.channels.map((ch) => (
          <span
            key={ch}
            className={cn(
              "font-jakarta rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
              CHANNEL_COLORS[ch] ?? "bg-gray-50 text-gray-600",
            )}
          >
            {ch}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "delivered",
    header: "Delivered",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.delivered.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "opens",
    header: "Opens",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.opens.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm font-semibold whitespace-nowrap">
        {row.original.rate}
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

export { STATUS_CONFIG as messageStatusConfig }
