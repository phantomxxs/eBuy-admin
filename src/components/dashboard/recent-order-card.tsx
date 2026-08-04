import { StatusBadge } from "@/components/ui/data-table"
import type { Order } from "@/types/orders"
import { formatPrice } from "@/utils/shared"
import { PAYMENT_CONFIG } from "@/utils/orders"

export default function RecentOrderCard({ order }: { order: Order }) {
  const cfg = PAYMENT_CONFIG[order.payment_status] ?? {
    label: order.payment_status,
    variant: "neutral" as const,
  }
  const initials = order.customer_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="bg-primary/10 text-primary font-jakarta flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
        {initials}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-jakarta text-brand text-sm font-semibold">
            {order.customer_name}
          </span>
          <span className="font-jakarta text-brand/50 text-xs">{order.increment_id}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-jakarta text-brand text-sm font-semibold">
            {formatPrice(order.grand_total)}
          </span>
          <StatusBadge label={cfg.label} variant={cfg.variant} dot />
        </div>
      </div>
    </div>
  )
}
