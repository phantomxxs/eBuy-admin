import type { CustomerStatus } from "@/lib/constants"

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus]

export interface CustomerAddress {
  label: string
  street: string
  city: string
  region: string
  type: string
}

export interface Customer {
  id: string
  entityId: number
  name: string
  customerType: string
  email: string
  orders: number
  totalSpend: number
  lastPurchase: string
  status: CustomerStatus
  initials: string
}

export interface RawCustomer {
  customer_id: string
  entity_id: number
  customer_name: string
  customer_type: string
  email: string
  order_count: number
  total_spend: number
  last_purchase: string
  status: string
}

export interface RawCustomerDetail extends RawCustomer {
  member_since: string
  marketing_consent: string
  last_activity: string
  addresses: CustomerAddress[]
}

export interface CustomerMetrics {
  total: number
  active: number
  suspended: number
  guest: number
  newLast7Days: number
  withPendingOrders: number
  withStorePickupOrders: number
}

export interface RawCustomerMetrics {
  total_customers?: number
  active_customers?: number
  suspended_customers?: number
  guest_customers?: number
  new_customers_last7_days?: number
  with_pending_orders?: number
  with_store_pickup_orders?: number
}

export interface CustomerNote {
  id: string
  note: string
  createdAt: string
  createdBy?: string
}

export interface CustomerPurchaseSummary {
  totalOrders: number
  totalSpend: number
  averageOrderValue: number
  lastOrderDate: string
}

export interface UpdateCustomerStatusPayload {
  status: CustomerStatus
}

export interface DirectEmailPayload {
  subject: string
  message: string
}

export interface UpdateCustomerProfilePayload {
  firstname: string
  lastname: string
  email: string
  phoneNumber?: string
  isSubscribed?: boolean
}

export interface CustomerCampaignPayload {
  subject: string
  message: string
  customerIds?: number[]
  guestEmails?: string[]
  search?: string
  status?: string
  registeredOnly?: boolean
  guestOnly?: boolean
}

export interface CustomerBulkActionPayload {
  action: string
  customerIds: number[]
  guestEmails?: string[]
  subject?: string
  message?: string
}

export interface RawCampaign {
  campaign_id: string
  subject: string
  message: string
  status: string
  recipient_count: number
  sent_count?: number
  created_at: string
}

export interface Campaign {
  id: string
  subject: string
  message: string
  status: string
  recipientCount: number
  sentCount: number
  createdAt: string
}

export interface GetCustomerCampaignsParams {
  currentPage?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface GetCustomersParams {
  currentPage?: number
  pageSize?: number
  search?: string
  status?: string
  customer_type?: string
}

export interface RawCampaignDetail extends RawCampaign {
  failed_count?: number
  last_error?: string
  updated_at?: string
}

export interface CampaignDetail extends Campaign {
  failedCount: number
  lastError?: string
  updatedAt?: string
}

export const AddressType = {
  BILLING: "Billing",
  SHIPPING: "Shipping",
} as const

export const CustomerType = {
  GUEST: "Guest",
  REGISTERED: "Registered",
} as const

export const MarketingConsent = {
  UNKNOWN: "Unknown",
  OPTED_IN: "Opted In",
  OPTED_OUT: "Opted Out",
} as const

export type AddressType = (typeof AddressType)[keyof typeof AddressType]
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType]
export type MarketingConsent = (typeof MarketingConsent)[keyof typeof MarketingConsent]

export interface Address {
  label: string
  street: string
  city: string
  region: string
  type: AddressType
}

export interface CustomerDetail {
  customer_id: string
  customer_name: string
  email: string
  phone: string
  customer_type: CustomerType
  member_since: string
  marketing_consent: MarketingConsent
  last_purchase: string
  last_activity: string
  order_count: number
  total_spend: number
  status: CustomerStatus
  addresses: Address[]
  entity_id: number
}

export interface ExportCustomersParams {
  search?: string
  status?: string
}
