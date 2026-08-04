export type VoucherDiscountType = "percentage" | "fixed_amount"
export type VoucherStatus = "active" | "inactive" | "expired" | "exhausted" | "scheduled"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface RawVoucher {
  voucher_id: number
  code: string
  type: VoucherDiscountType
  discount_value?: number
  value_label: string
  usage_limit: number
  used_count: number
  is_unlimited: boolean
  per_customer_usage_limit: number
  usage_percentage?: number
  valid_from: string
  valid_to: string
  status: VoucherStatus
  rule_id?: number
  coupon_id?: number
  created_by?: string
  created_at?: string
  updated_at?: string
  total_discounts_applied?: number
}

export interface RawVoucherMetrics {
  total_vouchers: number
  active_vouchers: number
  expired_vouchers: number
  total_discount_applied: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface Voucher {
  id: string
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  maxUsage: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt?: string
  status: VoucherStatus
}

export interface VoucherMetrics {
  total: number
  active: number
  expired: number
  totalDiscountApplied: number
}

// ── Payload types ──────────────────────────────────────────────────────────────
export interface CreateVoucherPayload {
  code?: string
  discountType: VoucherDiscountType
  discountValue: number
  maximumUsage: number
  startDate: string
  endDate: string
  saveMode: "inactive" | "activate"
}

export interface UpdateVoucherPayload extends Partial<CreateVoucherPayload> {
  id: string
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface GetVouchersParams {
  search?: string
  status?: string
  currentPage?: number
  pageSize?: number
}
