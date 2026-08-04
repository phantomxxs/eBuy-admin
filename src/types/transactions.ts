// Define enums for the different transaction properties
export enum TransactionType {
  REFUND = "Refund",
  PAYMENT = "Payment",
  // Add other transaction types as needed
}

export enum TransactionMethod {
  CARD = "Card",
  BANK_TRANSFER = "Bank Transfer",
  CASH = "Cash",
  // Add other payment methods as needed
}

export enum TransactionStatus {
  SUCCESSFUL = "Successful",
  PENDING = "Pending",
  FAILED = "Failed",
  // Add other statuses as needed
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  // Add other currencies as needed
}

// Define the Transaction interface
export interface Transaction {
  id: string
  orderId: string
  customer: string
  type: TransactionType
  method: TransactionMethod
  amount: number
  status: TransactionStatus
  date: string
}

export interface TransactionMetrics {
  totalRevenue: number
  totalTransactions: number
  successful: number
  pending: number
  failed: number
}

export interface RawTransaction {
  transaction_ref: string
  order_number: string
  customer_name: string
  type: string
  method: string
  amount: number
  status: string
  created_at: string
}

export interface RawTransactionMetrics {
  total_revenue: number
  total_transactions: number
  successful: number
  pending: number
  failed: number
}

export interface RawTransactionDetail {
  transaction_ref: string
  order_number: string
  order_id: number
  customer_name: string
  type: string
  method: string
  amount: number
  status: string
  created_at: string
  payment_reference: string
  currency: string
}

export interface TransactionQueryParams {
  currentPage?: number
  pageSize?: number | "all"
  search?: string
  type?: string
  status?: string
  payment_method?: string
  amount_min?: number
  amount_max?: number
  date_from?: string
  date_to?: string
}

export interface TransactionDetail {
  transactionRef: string
  orderNumber: string
  orderId: number
  customerName: string
  type: TransactionType
  method: TransactionMethod
  amount: number
  status: TransactionStatus
  createdAt: string
  paymentReference: string
  currency: Currency
}
