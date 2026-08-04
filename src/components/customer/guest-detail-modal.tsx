import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCustomerGuestDetail } from "@/store/queries/customers"
import { formatCurrency, formatDateToCustomFormat } from "@/lib/utils"
import type { CustomerDetail } from "@/types/customers"
import { CustomerStatus } from "@/lib/constants"
import { getInitials } from "@/store/normalizers/customers"

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: CustomerDetail | null
}

export default function GuestDetailModal({ isOpen, onClose, customer }: Props) {
  const { data: detail, isLoading } = useGetCustomerGuestDetail(
    isOpen && customer?.customer_type === CustomerStatus.GUEST ? customer.email : null,
  )

  if (!customer) return null

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Guest customer
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {customer.email} · Read-only profile
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      width="560px"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center justify-between border-b pb-4"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-primary/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                <span className="font-jakarta text-primary text-lg font-bold">
                  {getInitials(detail?.customer_name ?? customer.customer_name)}
                </span>
              </div>
              <div>
                <p className="font-jakarta text-brand text-base font-semibold">
                  {detail?.customer_name ?? customer.customer_name}
                </p>
                <p className="font-jakarta text-brand/50 text-sm">{customer.email}</p>
              </div>
            </div>

            <div className="space-y-0">
              <GuestDetailRow
                label="Total orders"
                value={(detail?.order_count ?? customer.order_count).toLocaleString()}
              />
              <GuestDetailRow
                label="Total spend"
                value={formatCurrency(detail?.total_spend ?? customer.total_spend)}
              />
              <GuestDetailRow
                label="Last purchase"
                value={
                  (detail?.last_activity ?? customer.last_activity)
                    ? formatDateToCustomFormat(
                        (detail?.last_activity ?? customer.last_activity) as string,
                        true,
                      )
                    : "—"
                }
              />
              {detail && detail.addresses.length > 0 && (
                <div className="border-borderSubtle border-b py-4">
                  <p className="font-jakarta text-brand/50 mb-3 text-xs font-medium tracking-wider uppercase">
                    Addresses
                  </p>
                  <div className="space-y-2">
                    {detail.addresses.map((addr, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 px-3 py-2.5">
                        <p className="font-jakarta text-brand/50 mb-0.5 text-xs font-medium">
                          {addr.label}
                        </p>
                        <p className="font-jakarta text-brand text-sm">
                          {addr.street}, {addr.city}, {addr.region}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

const GuestDetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between border-b py-3.5">
    <span className="font-jakarta text-brand/50 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-sm font-medium">{value}</span>
  </div>
)
