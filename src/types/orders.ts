export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "unpaid"
export type FulfillmentStatus =
  | "pending"
  | "unfulfilled"
  | "fulfilled"
  | "partial"
  | "returned"
  | "accepted"
  | "processing"
  | "cancelled"
  | "delivered"

export interface Order {
  order_id: string
  increment_id: string
  customer_name: string
  items_summary: string
  qty: number
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  order_type: string
  grand_total: number
  created_at: string
}

export interface OrderDetailItem {
  name: string
  sku: string
  qty: number
  price: number
  row_total: number
  image?: string
  brand?: string
}

export interface OrderDetailFulfillmentStep {
  step: string
  date?: string
  completed: boolean
}

export interface OrderDetailShipment {
  shipbubble_order_id: string
  courier_name: string
  courier_id: string
  service_code: string
  tracking_url: string
  status: string
  shipping_fee: number
}

export interface OrderDetailCustomer {
  name: string
  email: string
  customer_id?: number
}

export interface OrderDetail {
  order_id: number
  increment_id: string
  order_type: string
  customer: OrderDetailCustomer
  grand_total: number
  payment_method: string
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  store: string
  created_at: string
  items: OrderDetailItem[]
  fulfillment_progress: OrderDetailFulfillmentStep[]
  shipment?: OrderDetailShipment
}

export interface OrderMetrics {
  total: number
  paid: number
  pending: number
  processing: number
  fulfilled: number
  cancelled: number
}

export interface OrderQueryParams {
  currentPage?: number
  pageSize?: number | "all"
  search?: string
  payment_status?: string
  fulfillment_status?: string
  order_type?: string
  store_location_id?: string
  amount_min?: number
  amount_max?: number
  date_from?: string
  date_to?: string
}

export interface CancelOrderPayload {
  reason: string
}

export interface ProcessRefundPayload {
  refundType: "full" | "partial"
  reason: string
  notes?: string
}

export interface UpdateFulfillmentPayload {
  status: string
}

export interface WalkInOrderItem {
  productId: number
  qty: number
}

export interface WalkInCartItem {
  productId: number
  name: string
  price: number
  originalPrice?: number
  qty: number
  imageUrl?: string
}

export interface CreateWalkInOrderPayload {
  storeLocationId: number
  servedBy: string
  paymentMethod: string
  paymentStatus: string
  fulfillmentStatus?: string
  items: WalkInOrderItem[]
  orderNotes?: string
  customerId?: string
  guestFirstname?: string
  guestLastname?: string
  guestEmail?: string
  guestPhoneNumber?: string
  discountId?: string
}

export interface TransferOrderPayload {
  bankCode: string
  accountNumber: string
  amount: number
  reason?: string
}

export interface Bank {
  id: string
  name: string
  code: string
}

export interface RawOrderMetrics {
  total?: number
  total_orders?: number
  paid?: number
  paid_orders?: number
  pending?: number
  pending_orders?: number
  processing?: number
  processing_orders?: number
  fulfilled?: number
  fulfilled_orders?: number
  cancelled?: number
  cancelled_orders?: number
}
