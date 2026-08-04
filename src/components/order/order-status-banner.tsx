import { Info } from "lucide-react"
import { formatDateToCustomFormat } from "@/lib/utils"
import { FULFILLMENT_STATUS } from "@/utils/orders"

export interface OrderStatusBannerProps {
  isFulfilledOrDelivered: boolean
  isAccepted: boolean
  isCancelled: boolean
  isRefunded: boolean
  fulfillmentStatus: string
  grandTotal: number
  createdAt: string
}

export default function OrderStatusBanner({
  isFulfilledOrDelivered,
  isAccepted,
  isCancelled,
  isRefunded,
  fulfillmentStatus,
  grandTotal,
  createdAt,
}: OrderStatusBannerProps) {
  if (isFulfilledOrDelivered && !isRefunded) {
    return (
      <div className="border-statusSuccess/20 bg-statusSuccessBg mb-4 flex items-start gap-2 rounded-lg border p-3">
        <Info size={14} className="text-statusSuccess mt-0.5 shrink-0" />
        <p className="font-jakarta text-statusSuccess text-sm">
          This order was{" "}
          {fulfillmentStatus === FULFILLMENT_STATUS.DELIVERED ? "delivered" : "fulfilled"}{" "}
          successfully on {formatDateToCustomFormat(createdAt)}.
        </p>
      </div>
    )
  }
  if (isAccepted) {
    return (
      <div className="border-statusInfo/20 bg-statusInfo/5 mb-4 flex items-start gap-2 rounded-lg border p-3">
        <Info size={14} className="text-statusInfo mt-0.5 shrink-0" />
        <p className="font-jakarta text-statusInfo text-sm">
          This order has been accepted and is currently being processed.
        </p>
      </div>
    )
  }
  if (isCancelled && !isRefunded) {
    return (
      <div className="border-statusError/20 bg-statusError/5 mb-4 flex items-start gap-2 rounded-lg border p-3">
        <Info size={14} className="text-statusError mt-0.5 shrink-0" />
        <p className="font-jakarta text-statusError text-sm">This order was cancelled.</p>
      </div>
    )
  }
  if (isRefunded) {
    return (
      <div className="border-statusError/20 bg-statusError/5 mb-4 flex items-start gap-2 rounded-lg border p-3">
        <Info size={14} className="text-statusError mt-0.5 shrink-0" />
        <p className="font-jakarta text-statusError text-sm">
          This order was cancelled and a full refund of ₦{grandTotal.toLocaleString()} has been
          processed.
        </p>
      </div>
    )
  }
  return null
}
