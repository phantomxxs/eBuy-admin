import type { PaymentStatus } from "@/types/orders"

export const PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const

export const FULFILLMENT_STATUS = {
  PENDING: "pending",
  UNFULFILLED: "unfulfilled",
  FULFILLED: "fulfilled",
  PARTIAL: "partial",
  RETURNED: "returned",
  ACCEPTED: "accepted",
  PROCESSING: "processing",
  CANCELLED: "cancelled",
  DELIVERED: "delivered",
} as const

export const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "success" | "warning" | "error" | "neutral" | "default" }
> = {
  [PAYMENT_STATUS.PAID]: { label: "Paid", variant: "success" },
  [PAYMENT_STATUS.UNPAID]: { label: "Unpaid", variant: "warning" },
  [PAYMENT_STATUS.PENDING]: { label: "Pending", variant: "warning" },
  [PAYMENT_STATUS.FAILED]: { label: "Failed", variant: "error" },
  [PAYMENT_STATUS.REFUNDED]: { label: "Refunded", variant: "neutral" },
}

export const FULFILLMENT_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "info" | "neutral" | "default" }
> = {
  [FULFILLMENT_STATUS.PENDING]: { label: "Pending", variant: "warning" },
  [FULFILLMENT_STATUS.FULFILLED]: { label: "Fulfilled", variant: "success" },
  [FULFILLMENT_STATUS.DELIVERED]: { label: "Delivered", variant: "success" },
  [FULFILLMENT_STATUS.UNFULFILLED]: { label: "Unfulfilled", variant: "neutral" },
  [FULFILLMENT_STATUS.PARTIAL]: { label: "Partial", variant: "warning" },
  [FULFILLMENT_STATUS.RETURNED]: { label: "Returned", variant: "info" },
  [FULFILLMENT_STATUS.ACCEPTED]: { label: "Accepted", variant: "info" },
  [FULFILLMENT_STATUS.PROCESSING]: { label: "Processing", variant: "warning" },
  [FULFILLMENT_STATUS.CANCELLED]: { label: "Cancelled", variant: "default" },
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  website: "Website",
  walk_in: "Walk-in",
  pos: "POS",
  app: "App",
  marketplace: "Marketplace",
}

export function formatOrderType(raw: string): string {
  return ORDER_TYPE_LABELS[raw] ?? raw
}
