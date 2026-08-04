import type {
  Campaign,
  CampaignDetail,
  CustomerMetrics,
  RawCampaign,
  RawCampaignDetail,
  RawCustomerMetrics,
} from "@/types/customers"

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function normalizeCustomerMetrics(raw: RawCustomerMetrics): CustomerMetrics {
  return {
    total: raw.total_customers ?? 0,
    active: raw.active_customers ?? 0,
    suspended: raw.suspended_customers ?? 0,
    guest: raw.guest_customers ?? 0,
    newLast7Days: raw.new_customers_last7_days ?? 0,
    withPendingOrders: raw.with_pending_orders ?? 0,
    withStorePickupOrders: raw.with_store_pickup_orders ?? 0,
  }
}

export function normalizeCampaign(raw: RawCampaign): Campaign {
  return {
    id: raw.campaign_id,
    subject: raw.subject,
    message: raw.message,
    status: raw.status,
    recipientCount: raw.recipient_count ?? 0,
    sentCount: raw.sent_count ?? 0,
    createdAt: raw.created_at,
  }
}

export function normalizeCampaignDetail(raw: RawCampaignDetail): CampaignDetail {
  return {
    ...normalizeCampaign(raw),
    failedCount: raw.failed_count ?? 0,
    lastError: raw.last_error,
    updatedAt: raw.updated_at,
  }
}
