import type { RawVoucher, RawVoucherMetrics, Voucher, VoucherMetrics } from "@/types/vouchers"

function parseValueLabel(valueLabel: string, type: string): number {
  if (type === "percentage") return parseFloat(valueLabel.replace("%", "")) || 0
  return parseFloat(valueLabel.replace(/[₦,\s]/g, "")) || 0
}

export function normalizeVoucher(raw: RawVoucher): Voucher {
  return {
    id: String(raw.voucher_id),
    code: raw.code,
    discountType: raw.type,
    discountValue: raw.discount_value ?? parseValueLabel(raw.value_label, raw.type),
    maxUsage: raw.usage_limit,
    usageCount: raw.used_count,
    startDate: raw.valid_from,
    endDate: raw.valid_to,
    isActive: raw.status === "active",
    createdAt: raw.created_at,
    status: raw.status,
  }
}

export function normalizeVoucherMetrics(raw: RawVoucherMetrics): VoucherMetrics {
  return {
    total: raw.total_vouchers ?? 0,
    active: raw.active_vouchers ?? 0,
    expired: raw.expired_vouchers ?? 0,
    totalDiscountApplied: raw.total_discount_applied ?? 0,
  }
}
