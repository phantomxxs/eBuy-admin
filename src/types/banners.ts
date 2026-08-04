// ── Status types ───────────────────────────────────────────────────────────────

export type BannerStatus = "active" | "scheduled" | "expired" | "inactive" | "draft"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface RawBanner {
  banner_id: number
  name: string
  type: string
  type_label: string
  placement: string
  placement_label: string
  target_audience: string
  target_audience_label: string
  image_url?: string
  is_hero_banner?: boolean
  impressions: number
  ctr: number
  start_date: string
  end_date: string
  status: string
}

export interface RawBannerDetail {
  banner_id: number
  name: string
  type: string
  type_label: string
  placement: string
  placement_label: string
  target_audience: string
  target_audience_label: string
  image_url?: string
  is_hero_banner?: boolean
  cta_label: string
  cta_link: string
  start_date: string
  end_date: string
  status: string
  admin_status: string
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  conversion_rate: number
  created_by: string
  updated_at: string
}

export interface RawBannerMetrics {
  total_banners: number
  active_banners: number
  scheduled_banners: number
  inactive_banners: number
  expired_banners: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface Banner {
  id: string
  title: string
  duration: string
  startDate: string
  endDate: string
  type: string
  typeValue: string
  placement: string
  placementValue: string
  targetCustomers: string
  targetAudienceValue: string
  imageUrl?: string
  isHeroBanner: boolean
  impressions: number
  ctr: string
  status: BannerStatus
}

export interface BannerDetail extends Banner {
  ctaLabel: string
  ctaLink: string
  adminStatus: string
  clicks: number
  conversions: number
  conversionRate: number
  createdBy: string
  updatedAt: string
}

export interface BannerMetrics {
  total: number
  active: number
  scheduled: number
  inactive: number
  expired: number
  totalImpressions: number
}

// ── Payload types ──────────────────────────────────────────────────────────────

export interface CreateBannerPayload {
  name: string
  bannerType: string
  placement: string
  targetAudience: string
  isHeroBanner: boolean
  image?: File
  ctaLabel?: string
  ctaLink?: string
  startDate: string
  endDate: string
  saveMode?: string
}

export interface UpdateBannerPayload extends Partial<Omit<CreateBannerPayload, "image">> {}

export interface ChangeBannerStatusPayload {
  status: string
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface BannerQueryParams {
  currentPage?: number
  pageSize?: number
  search?: string
  status?: string
  type?: string
  placement?: string
  date_from?: string
  date_to?: string
}
