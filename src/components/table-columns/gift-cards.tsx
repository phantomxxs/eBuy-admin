import { Copy, MoreVertical } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import type { GiftCard, GiftCardStatus } from "@/types/gift-cards"

export const GIFT_CARD_STATUS_CONFIG: Record<
  GiftCardStatus,
  { label: string; variant: "success" | "info" | "neutral" | "warning" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  redeemed: { label: "Redeemed", variant: "info" },
  expired: { label: "Expired", variant: "neutral" },
  canceled: { label: "Canceled", variant: "warning" },
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`
}

function handleCopyCode(e: React.MouseEvent, code: string) {
  e.stopPropagation()
  void navigator.clipboard.writeText(code)
}

export const giftCardColumns: ColumnDef<GiftCard>[] = [
  {
    accessorKey: "code",
    header: "Code",
    size: 180,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-brand font-mono text-xs font-semibold tracking-wider">
          {row.original.code}
        </span>
        <WithTooltip
          trigger={
            <button
              onClick={(e) => handleCopyCode(e, row.original.code)}
              className="text-brand/30 hover:text-brand/60 transition-colors"
            >
              <Copy size={13} />
            </button>
          }
          content="Copy code"
        />
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-semibold whitespace-nowrap">
        {formatNaira(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {formatNaira(row.original.balance)}
      </span>
    ),
  },
  {
    id: "recipient",
    header: "Recipient",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-jakarta text-brand text-sm font-medium">
          {row.original.recipientName}
        </span>
        <span className="font-jakarta text-brand/50 text-xs">{row.original.recipientEmail}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = GIFT_CARD_STATUS_CONFIG[row.original.status]
      return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
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

export function makeGiftCardColumns(
  onView: (card: GiftCard) => void,
  onDeactivate: (card: GiftCard) => void,
  onDelete: (card: GiftCard) => void,
): ColumnDef<GiftCard>[] {
  return [
    ...giftCardColumns.slice(0, -1),
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
            items={[
              { label: "View details", onClick: () => onView(row.original) },
              ...(row.original.status === "active"
                ? [
                    {
                      label: "Deactivate gift card",
                      onClick: () => onDeactivate(row.original),
                      variant: "warning" as const,
                    },
                  ]
                : []),
              {
                label: "Delete gift card",
                onClick: () => onDelete(row.original),
                variant: "destructive" as const,
              },
            ]}
          />
        </div>
      ),
    },
  ]
}
