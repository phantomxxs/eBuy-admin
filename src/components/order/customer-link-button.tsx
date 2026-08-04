import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useGetCustomerById } from "@/store/queries/customers"
import CustomerDetailModal from "@/components/customer/customer-detail-modal"

interface CustomerLinkButtonProps {
  customerId: string | number | null | undefined
  name: string
}

export default function CustomerLinkButton({ customerId, name }: CustomerLinkButtonProps) {
  const [open, setOpen] = useState(false)

  const { data: customer, isLoading } = useGetCustomerById(
    open && customerId ? String(customerId) : null,
  )

  const initials = name?.slice(0, 2).toUpperCase() ?? "??"

  if (!customerId) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
          <span className="font-jakarta text-primary text-xxs font-bold">{initials}</span>
        </div>
        <span className="font-jakarta text-brand text-sm font-medium">{name}</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-primary flex items-center gap-2 transition-colors"
      >
        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
          {isLoading ? (
            <Loader2 size={10} className="text-primary animate-spin" />
          ) : (
            <span className="font-jakarta text-primary text-xxs font-bold">{initials}</span>
          )}
        </div>
        <span className="font-jakarta text-brand text-sm font-medium">{name}</span>
      </button>

      <CustomerDetailModal
        isOpen={open && !!customer}
        onClose={() => setOpen(false)}
        customer={customer ?? null}
      />
    </>
  )
}
