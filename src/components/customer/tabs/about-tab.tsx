import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { CustomerDetail } from "@/types/customers"
import { getInitials } from "@/store/normalizers/customers"
import { CustomerStatus } from "@/lib/constants"
import { formatPrice } from "@/utils/shared"
import { StatusBadge } from "@/components/ui/data-table"

interface Props {
  customer: CustomerDetail
  detail: CustomerDetail | null
}

export default function AboutTab({ customer, detail }: Props) {
  return (
    <div>
      <div className="flex items-center gap-4 pb-6">
        <div className="bg-primary/15 flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20">
          <span className="font-jakarta text-primary text-xl font-bold sm:text-2xl">
            {getInitials(customer.customer_name)}
          </span>
        </div>
        <div>
          <p className="font-jakarta text-brand text-base font-medium tracking-[-0.04em]">
            {customer.customer_name}
          </p>
          <p className="font-jakarta text-brand/60 text-sm font-medium tracking-[-0.04em]">
            {customer.customer_type} · {customer.email}
          </p>
        </div>
      </div>

      <SectionLabel title="CUSTOMER OVERVIEW" />

      <DetailRow label="Customer ID">{customer.customer_id}</DetailRow>
      <DetailRow label="Customer name">{customer.customer_name}</DetailRow>
      <DetailRow label="Email address">
        <span className="flex items-center justify-end gap-1.5">
          <span className="max-w-35 truncate sm:max-w-none">{customer.email}</span>
          <CheckCircle2 size={13} className="text-statusSuccess shrink-0" />
        </span>
      </DetailRow>
      <DetailRow label="Customer type">{customer.customer_type}</DetailRow>
      {detail && (
        <>
          <DetailRow label="Member since">
            {formatDateToCustomFormat(detail.member_since, true)}
          </DetailRow>
          <DetailRow label="Marketing consent">{detail.marketing_consent}</DetailRow>
          <DetailRow label="Last activity">
            {formatDateToCustomFormat(detail.last_activity, true)}
          </DetailRow>
        </>
      )}
      <DetailRow label="Orders">{customer.order_count}</DetailRow>
      <DetailRow label="Total spend">{formatPrice(customer.total_spend)}</DetailRow>
      <DetailRow label="Status">
        <StatusBadge
          label={customer.status === CustomerStatus.ACTIVE ? "Active" : "Inactive"}
          variant={customer.status === CustomerStatus.ACTIVE ? "success" : "warning"}
          dot
        />
      </DetailRow>

      {detail && detail.addresses.length > 0 && (
        <>
          <SectionLabel title="SAVED ADDRESSES" />
          {detail.addresses.map((addr, i) => (
            <div key={i} className="border-borderSubtle bg-brand/1 mb-2 rounded-[6px] border p-4">
              <p className="font-jakarta text-brand/60 text-sm">{addr.label}</p>
              <p className="font-jakarta text-brand mt-2 text-sm font-medium tracking-[-0.04em]">
                {[addr.street, addr.city, addr.region].filter(Boolean).join(", ")}
              </p>
              <p className="font-jakarta text-brand/40 mt-0.5 text-xs">{addr.type}</p>
            </div>
          ))}
        </>
      )}
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

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 mt-5 mb-3 text-sm font-bold tracking-[-0.04em] uppercase first:mt-0">
    {title}
  </p>
)
