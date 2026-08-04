import { useState } from "react"
import { X, ExternalLink } from "lucide-react"
import { formatCurrency, formatDateToCustomFormat } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { useGetOrderById } from "@/store/queries/orders"
import { useAcceptOrder, useCancelOrder, useDownloadOrderReceipt } from "@/store/mutations/orders"
import { PAYMENT_CONFIG, FULFILLMENT_CONFIG } from "@/components/table-columns/orders"
import { PAYMENT_STATUS, FULFILLMENT_STATUS, formatOrderType } from "@/utils/orders"
import { showAlert } from "@/store/alerts"
import type { Order } from "@/types/orders"
import ProcessRefundModal from "./process-refund-modal"
import CustomerLinkButton from "./customer-link-button"
import OrderStatusBanner from "./order-status-banner"
import OrderFooterActions from "./order-footer-actions"
import OrderDetailSkeleton from "./order-detail-skeleton"
import { OrderSection, DetailRow, StepItem } from "./order-section"

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order: rowOrder,
}: OrderDetailModalProps) {
  const {
    data: fetchedOrder,
    isLoading,
    refetch,
  } = useGetOrderById(isOpen ? (rowOrder?.order_id ?? null) : null)
  const [showProcessRefund, setShowProcessRefund] = useState(false)

  const acceptOrder = useAcceptOrder()
  const cancelOrder = useCancelOrder()
  const downloadReceipt = useDownloadOrderReceipt()

  if (!rowOrder) return null

  // Derive display values — prefer fetched detail, fall back to row data
  const customerName = fetchedOrder?.customer.name ?? rowOrder.customer_name
  const orderId = fetchedOrder?.increment_id ?? rowOrder.order_id
  const grandTotal = fetchedOrder?.grand_total ?? rowOrder.grand_total
  const paymentStatus = fetchedOrder?.payment_status ?? rowOrder.payment_status
  const fulfillmentStatus = fetchedOrder?.fulfillment_status ?? rowOrder.fulfillment_status
  const createdAt = fetchedOrder?.created_at ?? rowOrder.created_at
  const paymentMethod = fetchedOrder?.payment_method ?? "Paystack"
  const orderType = fetchedOrder?.order_type ?? rowOrder.order_type

  const isFulfilledOrDelivered =
    fulfillmentStatus === FULFILLMENT_STATUS.FULFILLED ||
    fulfillmentStatus === FULFILLMENT_STATUS.DELIVERED
  const isAccepted =
    fulfillmentStatus === FULFILLMENT_STATUS.ACCEPTED ||
    fulfillmentStatus === FULFILLMENT_STATUS.PROCESSING
  const isCancelled = fulfillmentStatus === FULFILLMENT_STATUS.CANCELLED
  const isRefunded = paymentStatus === PAYMENT_STATUS.REFUNDED

  const handleAccept = () => {
    acceptOrder.mutate(rowOrder.order_id, {
      onSuccess: () => {
        showAlert({ variant: "success", message: "Order accepted" })
        onClose()
      },
      onError: (error) => showAlert({ variant: "error", message: error.message }),
    })
  }

  const handleReject = () => {
    cancelOrder.mutate(
      { id: rowOrder.order_id, reason: "Rejected by admin" },
      {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Order rejected" })
          onClose()
        },
        onError: (error) => showAlert({ variant: "error", message: error.message }),
      },
    )
  }

  const customHeader = (
    <div className="border-borderSubtle border-b px-4 py-4 md:px-6 md:py-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold">Order {orderId}</h2>
          <p className="font-jakarta text-brand/50 mt-0.5 text-sm">
            {customerName} · {formatDateToCustomFormat(createdAt, true)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand rounded p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <OrderFooterActions
      isFulfilledOrDelivered={isFulfilledOrDelivered}
      isAccepted={isAccepted}
      isCancelled={isCancelled}
      isRefunded={isRefunded}
      acceptIsPending={acceptOrder.isPending}
      cancelIsPending={cancelOrder.isPending}
      downloadReceiptIsPending={downloadReceipt.isPending}
      onClose={onClose}
      onInitiateRefund={() => setShowProcessRefund(true)}
      onAccept={handleAccept}
      onReject={handleReject}
      onDownloadReceipt={() => downloadReceipt.mutate(rowOrder.order_id)}
    />
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={acceptOrder.isPending || cancelOrder.isPending}
      customHeader={customHeader}
      customFooter={customFooter}
      width="652px"
    >
      {fetchedOrder && (
        <ProcessRefundModal
          isOpen={showProcessRefund}
          onClose={() => setShowProcessRefund(false)}
          onSuccess={() => refetch()}
          order={fetchedOrder}
        />
      )}

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : (
        <div className="divide-borderSubtle divide-y px-4 md:px-6">
          {/* Banners */}
          {(isFulfilledOrDelivered || isAccepted || isCancelled || isRefunded) && (
            <div className="py-4">
              <OrderStatusBanner
                isFulfilledOrDelivered={isFulfilledOrDelivered}
                isAccepted={isAccepted}
                isCancelled={isCancelled}
                isRefunded={isRefunded}
                fulfillmentStatus={fulfillmentStatus}
                grandTotal={grandTotal}
                createdAt={createdAt}
              />
            </div>
          )}

          {/* ORDER INFORMATION */}
          <OrderSection title="Order information" defaultOpen>
            <DetailRow label="Order ID" value={orderId} />
            {!isFulfilledOrDelivered && (
              <DetailRow
                label="Order type"
                value={
                  <StatusBadge label={formatOrderType(orderType ?? "website")} variant="info" dot />
                }
              />
            )}
            <DetailRow
              label="Customer"
              value={
                <CustomerLinkButton
                  customerId={fetchedOrder?.customer.customer_id}
                  name={customerName}
                />
              }
            />
            <DetailRow label="Total" value={formatCurrency(grandTotal)} />
            <DetailRow label="Payment method" value={paymentMethod} />
            <DetailRow
              label="Paid"
              value={
                <StatusBadge
                  label={PAYMENT_CONFIG[paymentStatus].label}
                  variant={PAYMENT_CONFIG[paymentStatus].variant}
                  dot
                />
              }
            />
            <DetailRow
              label="Fulfilment"
              value={
                isRefunded ? (
                  <StatusBadge label="Cancelled" variant="error" dot />
                ) : (
                  <StatusBadge
                    label={FULFILLMENT_CONFIG[fulfillmentStatus].label}
                    variant={FULFILLMENT_CONFIG[fulfillmentStatus].variant}
                    dot
                  />
                )
              }
            />
            <DetailRow label="Purchased on" value={formatDateToCustomFormat(createdAt)} />
            {isRefunded && <DetailRow label="Cancellation reason" value="Out of stock" />}
          </OrderSection>

          {/* ORDER ITEMS */}
          <OrderSection title={`Order items (${fetchedOrder?.items.length ?? 0})`}>
            {fetchedOrder?.items.map((item) => (
              <div
                key={item.sku}
                className="border-borderSubtle flex items-center justify-between border-b py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    {item.brand && (
                      <span className="font-jakarta text-brand/50 text-xs">{item.brand}</span>
                    )}
                    <span className="flex min-w-0 items-center gap-2">
                      <WithTooltip
                        trigger={
                          <span className="font-jakarta text-brand max-w-52 truncate text-sm font-medium">
                            {item.name}
                          </span>
                        }
                        content={item.name}
                      />
                      <span className="font-jakarta text-brand/50 text-sm">x{item.qty}</span>
                    </span>
                  </span>
                </span>
                <span className="font-jakarta text-brand shrink-0 text-sm font-medium">
                  {formatCurrency(item.row_total)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <span className="font-jakarta text-brand text-sm font-bold">Total</span>
              <span className="font-jakarta text-brand text-sm font-bold">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </OrderSection>

          {/* FULFILMENT PROGRESS / REFUND DETAILS */}
          {isRefunded ? (
            <OrderSection title="Refund details">
              <DetailRow label="Refund amount" value={formatCurrency(grandTotal)} />
              <DetailRow
                label="Refund status"
                value={<StatusBadge label="Refunded" variant="neutral" dot />}
              />
              <DetailRow label="Refund method" value={paymentMethod} />
            </OrderSection>
          ) : (
            <OrderSection title="Fulfilment progress">
              <div className="flex items-start justify-between py-2">
                {(fetchedOrder?.fulfillment_progress ?? []).map((step, i, arr) => (
                  <StepItem
                    key={step.step}
                    label={step.step}
                    timestamp={step.completed ? step.date : undefined}
                    isDone={step.completed}
                    isLast={i === arr.length - 1}
                  />
                ))}
              </div>
            </OrderSection>
          )}

          {/* SHIPMENT */}
          {fetchedOrder?.shipment && (
            <OrderSection title="Shipment">
              <DetailRow label="Courier" value={fetchedOrder.shipment.courier_name} />
              <DetailRow label="Tracking ID" value={fetchedOrder.shipment.shipbubble_order_id} />
              <DetailRow
                label="Status"
                value={
                  <StatusBadge
                    label={
                      fetchedOrder.shipment.status.charAt(0).toUpperCase() +
                      fetchedOrder.shipment.status.slice(1)
                    }
                    variant={
                      fetchedOrder.shipment.status === "delivered"
                        ? "success"
                        : fetchedOrder.shipment.status === "cancelled"
                          ? "error"
                          : "info"
                    }
                    dot
                  />
                }
              />
              <DetailRow
                label="Shipping fee"
                value={formatCurrency(fetchedOrder.shipment.shipping_fee)}
              />
              <DetailRow
                label="Track shipment"
                value={
                  <a
                    href={fetchedOrder.shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    View tracking
                    <ExternalLink size={12} />
                  </a>
                }
              />
            </OrderSection>
          )}
        </div>
      )}
    </Modal>
  )
}
