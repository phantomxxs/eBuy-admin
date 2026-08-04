import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface OrderFooterActionsProps {
  isFulfilledOrDelivered: boolean
  isAccepted: boolean
  isCancelled: boolean
  isRefunded: boolean
  acceptIsPending: boolean
  cancelIsPending: boolean
  downloadReceiptIsPending: boolean
  onClose: () => void
  onInitiateRefund: () => void
  onAccept: () => void
  onReject: () => void
  onDownloadReceipt: () => void
}

export default function OrderFooterActions({
  isFulfilledOrDelivered,
  isAccepted,
  isCancelled,
  isRefunded,
  acceptIsPending,
  cancelIsPending,
  downloadReceiptIsPending,
  onClose,
  onInitiateRefund,
  onAccept,
  onReject,
  onDownloadReceipt,
}: OrderFooterActionsProps) {
  if (isCancelled) {
    return (
      <div className="border-borderSubtle flex gap-2 border-t px-4 py-3 md:px-6 md:py-4">
        <Button
          variant="outline"
          beforeIcon={<Download size={14} />}
          loading={downloadReceiptIsPending}
          onClick={onDownloadReceipt}
        >
          Download receipt
        </Button>
        <Button variant="subtle" onClick={onClose} className="ml-auto flex">
          Close
        </Button>
      </div>
    )
  }

  if (isRefunded) {
    return (
      <div className="border-borderSubtle flex gap-2 border-t px-4 py-3 md:px-6 md:py-4">
        <Button
          variant="outline"
          beforeIcon={<Download size={14} />}
          loading={downloadReceiptIsPending}
          onClick={onDownloadReceipt}
        >
          Download receipt
        </Button>
        <Button variant="subtle" onClick={onClose} className="ml-auto flex">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="border-borderSubtle flex gap-2 border-t px-4 py-3 md:px-6 md:py-4">
      {isFulfilledOrDelivered || isAccepted ? (
        <>
          <Button
            variant="outline"
            className="flex-1"
            beforeIcon={<Download size={14} />}
            loading={downloadReceiptIsPending}
            disabled={acceptIsPending || cancelIsPending}
            onClick={onDownloadReceipt}
          >
            Download receipt
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onInitiateRefund}>
            Initiate refund
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="subtle"
            className="flex-1"
            loading={cancelIsPending}
            disabled={acceptIsPending}
            onClick={onReject}
          >
            Reject order
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            loading={acceptIsPending}
            disabled={cancelIsPending}
            onClick={onAccept}
          >
            Accept order
          </Button>
        </>
      )}
    </div>
  )
}
