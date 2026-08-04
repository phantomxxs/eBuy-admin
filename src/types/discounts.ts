// ── Status types ───────────────────────────────────────────────────────────────

export type DiscountStatus = "active" | "scheduled" | "expired" | "draft"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface RawDiscount {
  promotion_id: number
  name: string
  type: string
  discount_label: string
  applies_to_label: string
  used: number
  start_date: string
  end_date: string
  status: string
}

export interface RawDiscountDetail {
  promotion_id: number
  rule_id: number
  name: string
  type: string
  discount_value: number
  discount_label: string
  applies_to_category_ids: number[]
  applies_to_label: string
  customer_eligibility: string
  usage_limit: number
  times_used: number
  total_revenue: number
  avg_order_value: number
  start_date: string
  end_date: string
  status: string
  created_by: string
  updated_at: string
}

export interface RawDiscountMetrics {
  total_promotions: number
  active_promotions: number
  scheduled_promotions: number
  expired_promotions: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface Discount {
  id: string
  name: string
  type: string
  discountType: string
  discount: string
  appliesTo: string
  used: number
  duration: string
  startDate: string
  endDate: string
  status: DiscountStatus
}

export interface DiscountDetail extends Discount {
  ruleId: number
  discountValue: number
  appliesToCategoryIds: number[]
  customerEligibility: string
  usageLimit: number
  timesUsed: number
  totalRevenue: number
  avgOrderValue: number
  createdBy: string
  updatedAt: string
}

export interface DiscountMetrics {
  total: number
  active: number
  scheduled: number
  expired: number
}

// ── Payload types ──────────────────────────────────────────────────────────────

export interface CreateDiscountPayload {
  name: string
  discountType: string
  discountValue: number
  appliesToCategoryIds: number[]
  customerEligibility: string
  usageLimit: number
  startDate: string
  endDate: string
  saveMode: "activate" | "draft"
}

export interface UpdateDiscountPayload extends Partial<CreateDiscountPayload> {}

export interface ChangeDiscountStatusPayload {
  status: string
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface DiscountQueryParams {
  currentPage?: number
  pageSize?: number
  search?: string
  status?: string
  type?: string
  applies_to?: string
  valid_from?: string
  valid_to?: string
}
