import type {
  Transaction,
  TransactionMetrics,
  RawTransaction,
  RawTransactionMetrics,
} from "@/types/transactions"

export function normalizeTransaction(raw: RawTransaction): Transaction {
  return {
    id: raw.transaction_ref,
    orderId: raw.order_number,
    customer: raw.customer_name,
    type: raw.type as Transaction["type"],
    method: raw.method as Transaction["method"],
    amount: raw.amount,
    status: raw.status as Transaction["status"],
    date: raw.created_at,
  }
}

export function normalizeTransactionMetrics(raw: RawTransactionMetrics): TransactionMetrics {
  return {
    totalRevenue: raw.total_revenue ?? 0,
    totalTransactions: raw.total_transactions ?? 0,
    successful: raw.successful ?? 0,
    pending: raw.pending ?? 0,
    failed: raw.failed ?? 0,
  }
}
