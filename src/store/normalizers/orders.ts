import type { OrderMetrics, RawOrderMetrics } from "@/types/orders"

export function normalizeOrderMetrics(raw: unknown): OrderMetrics {
  const m = raw as RawOrderMetrics
  return {
    total: m.total ?? m.total_orders ?? 0,
    paid: m.paid ?? m.paid_orders ?? 0,
    pending: m.pending ?? m.pending_orders ?? 0,
    processing: m.processing ?? m.processing_orders ?? 0,
    fulfilled: m.fulfilled ?? m.fulfilled_orders ?? 0,
    cancelled: m.cancelled ?? m.cancelled_orders ?? 0,
  }
}
