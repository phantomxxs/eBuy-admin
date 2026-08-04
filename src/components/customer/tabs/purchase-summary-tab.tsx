import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateToCustomFormat } from "@/lib/utils"
import { useGetCustomerPurchaseSummary } from "@/store/queries/customers"
import type { CustomerDetail } from "@/types/customers"

interface Props {
  customer: CustomerDetail
}

export default function PurchaseSummaryTab({ customer }: Props) {
  const { data: summary, isLoading } = useGetCustomerPurchaseSummary(String(customer.entity_id))

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-borderSubtle flex items-center justify-between border-b py-3"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <DetailRow label="Total orders">{summary?.totalOrders ?? customer.order_count}</DetailRow>
      <DetailRow label="Total spend">
        ₦{(summary?.totalSpend ?? customer.total_spend).toLocaleString()}.00
      </DetailRow>
      {summary?.averageOrderValue != null && (
        <DetailRow label="Average order value">
          ₦{summary.averageOrderValue.toLocaleString()}.00
        </DetailRow>
      )}
      <DetailRow label="Last purchase">
        {(summary?.lastOrderDate ?? customer.last_activity)
          ? formatDateToCustomFormat(
              (summary?.lastOrderDate ?? customer.last_activity) as string,
              true,
            )
          : "—"}
      </DetailRow>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between gap-4 border-b py-3">
    <span className="font-jakarta text-brand/60 shrink-0 text-sm tracking-[-0.02em]">{label}</span>
    <span className="font-jakarta text-brand text-right text-sm font-medium tracking-[-0.04em]">
      {children}
    </span>
  </div>
)
