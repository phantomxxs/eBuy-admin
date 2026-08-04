import type {
  Banner,
  BannerDetail,
  BannerMetrics,
  BannerStatus,
  RawBanner,
  RawBannerDetail,
  RawBannerMetrics,
} from "@/types/banners"

function formatDuration(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  return `${fmt(startDate)} – ${fmt(endDate)}`
}

function formatCtr(ctr: number): string {
  return `${(ctr * 100).toFixed(1)}%`
}

function normalizeStatus(raw: string): BannerStatus {
  const s = raw.toLowerCase()
  if (s === "active" || s === "scheduled" || s === "expired" || s === "inactive" || s === "draft")
    return s
  return "draft"
}

export function normalizeBanner(raw: RawBanner): Banner {
  return {
    id: String(raw.banner_id),
    title: raw.name,
    duration: formatDuration(raw.start_date, raw.end_date),
    startDate: raw.start_date,
    endDate: raw.end_date,
    type: raw.type_label,
    typeValue: raw.type,
    placement: raw.placement_label,
    placementValue: raw.placement,
    targetCustomers: raw.target_audience_label,
    targetAudienceValue: raw.target_audience,
    imageUrl: raw.image_url,
    isHeroBanner: raw.is_hero_banner ?? false,
    impressions: raw.impressions ?? 0,
    ctr: formatCtr(raw.ctr ?? 0),
    status: normalizeStatus(raw.status),
  }
}

export function normalizeBannerDetail(raw: RawBannerDetail): BannerDetail {
  return {
    ...normalizeBanner(raw as RawBanner),
    ctaLabel: raw.cta_label ?? "",
    ctaLink: raw.cta_link ?? "",
    adminStatus: raw.admin_status ?? raw.status,
    clicks: raw.clicks ?? 0,
    conversions: raw.conversions ?? 0,
    conversionRate: raw.conversion_rate ?? 0,
    createdBy: raw.created_by,
    updatedAt: raw.updated_at,
  }
}

export function normalizeBannerMetrics(raw: RawBannerMetrics): BannerMetrics {
  return {
    total: raw.total_banners ?? 0,
    active: raw.active_banners ?? 0,
    scheduled: raw.scheduled_banners ?? 0,
    inactive: raw.inactive_banners ?? 0,
    expired: raw.expired_banners ?? 0,
    totalImpressions: 0,
  }
}
