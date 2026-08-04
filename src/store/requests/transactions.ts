import instance from "@/services/axios-instance"
import {
  TRANSACTIONS,
  TRANSACTION_METRICS,
  TRANSACTION_EXPORT,
  TRANSACTION_BY_ID,
  TRANSACTION_RECEIPT,
} from "@/services/apis"
import type {
  Transaction,
  TransactionDetail,
  TransactionMetrics,
  RawTransaction,
  RawTransactionDetail,
  RawTransactionMetrics,
} from "@/types/transactions"
import type { PaginatedApiResponse } from "@/types/utils"
import type { TransactionQueryParams } from "@/types/transactions"
import { normalizeTransaction, normalizeTransactionMetrics } from "@/store/normalizers/transactions"

function normalizeTransactionDetail(raw: RawTransactionDetail): TransactionDetail {
  return {
    transactionRef: raw.transaction_ref,
    orderNumber: raw.order_number,
    orderId: raw.order_id,
    customerName: raw.customer_name,
    type: raw.type as TransactionDetail["type"],
    method: raw.method as TransactionDetail["method"],
    amount: raw.amount,
    status: raw.status as TransactionDetail["status"],
    createdAt: raw.created_at,
    paymentReference: raw.payment_reference,
    currency: raw.currency as TransactionDetail["currency"],
  }
}

export const getTransactions = async (
  params: TransactionQueryParams,
): PaginatedApiResponse<Transaction> => {
  const response = await instance.get(TRANSACTIONS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.payment_method && { payment_method: params.payment_method }),
      ...(params.amount_min != null && { amount_min: params.amount_min }),
      ...(params.amount_max != null && { amount_max: params.amount_max }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
    },
  })
  const raw = response.data
  return {
    ...raw,
    items: (raw.items as RawTransaction[]).map(normalizeTransaction),
  }
}

export const getTransactionMetrics = async (): Promise<TransactionMetrics> => {
  const response = await instance.get(TRANSACTION_METRICS)
  return normalizeTransactionMetrics(response.data as RawTransactionMetrics)
}

export const getTransactionByRef = async (ref: string): Promise<TransactionDetail> => {
  const response = await instance.get(TRANSACTION_BY_ID(ref))
  return normalizeTransactionDetail(response.data as RawTransactionDetail)
}

export const exportTransactionsCSV = async (): Promise<{
  download_url: string
  filename: string
}> => {
  const response = await instance.get(TRANSACTION_EXPORT)
  return response.data
}

export const getTransactionReceipt = async (
  ref: string,
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(TRANSACTION_RECEIPT(ref))
  return response.data
}
