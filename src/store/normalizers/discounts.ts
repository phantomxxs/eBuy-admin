import type {
  Discount,
  DiscountDetail,
  DiscountMetrics,
  DiscountStatus,
  RawDiscount,
  RawDiscountDetail,
  RawDiscountMetrics,
} from "@/types/discounts"

const TYPE_LABELS: Record<string, string> = {
  percentage_off: "Percentage off",
  fixed_amount: "Fixed amount",
  // free_shipping: "Free shipping",
  // bogo: "BOGO",
}

function formatDuration(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

function normalizeStatus(raw: string): DiscountStatus {
  const s = raw.toLowerCase()
  if (s === "active" || s === "scheduled" || s === "expired" || s === "draft") return s
  return "draft"
}

export function normalizeDiscount(raw: RawDiscount): Discount {
  return {
    id: String(raw.promotion_id),
    name: raw.name,
    type: TYPE_LABELS[raw.type] ?? raw.type,
    discountType: raw.type,
    discount: raw.discount_label,
    appliesTo: raw.applies_to_label,
    used: raw.used ?? 0,
    duration: formatDuration(raw.start_date, raw.end_date),
    startDate: raw.start_date,
    endDate: raw.end_date,
    status: normalizeStatus(raw.status),
  }
}

export function normalizeDiscountDetail(raw: RawDiscountDetail): DiscountDetail {
  const base = normalizeDiscount({
    promotion_id: raw.promotion_id,
    name: raw.name,
    type: raw.type,
    discount_label: raw.discount_label,
    applies_to_label: raw.applies_to_label,
    used: raw.times_used ?? 0,
    start_date: raw.start_date,
    end_date: raw.end_date,
    status: raw.status,
  })
  return {
    ...base,
    ruleId: raw.rule_id,
    discountValue: raw.discount_value,
    appliesToCategoryIds: raw.applies_to_category_ids ?? [],
    customerEligibility: raw.customer_eligibility,
    usageLimit: raw.usage_limit,
    timesUsed: raw.times_used,
    totalRevenue: raw.total_revenue,
    avgOrderValue: raw.avg_order_value,
    createdBy: raw.created_by,
    updatedAt: raw.updated_at,
  }
}

export function normalizeDiscountMetrics(raw: RawDiscountMetrics): DiscountMetrics {
  return {
    total: raw.total_promotions ?? 0,
    active: raw.active_promotions ?? 0,
    scheduled: raw.scheduled_promotions ?? 0,
    expired: raw.expired_promotions ?? 0,
  }
}
