import { MoreVertical, Star } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { WithTooltip } from "@/components/ui/tooltip"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { Review, ReviewStatus } from "@/types/reviews"

export const REVIEW_STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "neutral" },
}

const StarRating = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-brand/20"}
      />
    ))}
    <span className="font-jakarta text-brand/60 ml-1 text-xs">{rating}</span>
  </span>
)

export const reviewColumns: ColumnDef<Review>[] = [
  {
    accessorKey: "product_name",
    header: "Product",
    size: 180,
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-44 truncate text-sm font-semibold tracking-[-0.04em] whitespace-nowrap">
            {row.original.product_name}
          </span>
        }
        content={row.original.product_name}
      />
    ),
  },
  {
    accessorKey: "nickname",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.nickname}
      </span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    size: 120,
    cell: ({ row }) => <StarRating rating={row.original.rating} />,
  },
  {
    accessorKey: "detail",
    header: "Review",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 block max-w-56 truncate text-sm">
            {row.original.detail}
          </span>
        }
        content={row.original.detail}
      />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    size: 140,
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const cfg = REVIEW_STATUS_CONFIG[row.original.status]
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

export function makeReviewColumns(
  onView: (r: Review) => void,
  onApprove: (r: Review) => void,
  onReject: (r: Review) => void,
  onDelete: (r: Review) => void,
): ColumnDef<Review>[] {
  return [
    ...reviewColumns.slice(0, -1),
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
              ...(row.original.status !== "approved"
                ? [
                    {
                      label: "Approve review",
                      onClick: () => onApprove(row.original),
                      variant: "success" as const,
                    },
                  ]
                : []),
              ...(row.original.status !== "rejected"
                ? [{ label: "Reject review", onClick: () => onReject(row.original) }]
                : []),
              {
                label: "Delete review",
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
