import instance from "@/services/axios-instance"
import {
  BANNERS,
  BANNER_METRICS,
  BANNER_BY_ID,
  BANNER_STATUS,
  BANNER_EXPORT,
  BANNER_CREATE_WITH_IMAGE,
} from "@/services/apis"
import type {
  Banner,
  BannerDetail,
  BannerMetrics,
  BannerQueryParams,
  CreateBannerPayload,
  UpdateBannerPayload,
  ChangeBannerStatusPayload,
} from "@/types/banners"
import type { PaginatedApiResponse } from "@/types/utils"
import {
  normalizeBanner,
  normalizeBannerDetail,
  normalizeBannerMetrics,
} from "../normalizers/banners"

export const getBanners = async (params: BannerQueryParams = {}): PaginatedApiResponse<Banner> => {
  const response = await instance.get(BANNERS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.placement && { placement: params.placement }),
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
    },
  })
  const body = response.data
  return {
    ...body,
    items: (body.items ?? []).map(normalizeBanner),
  }
}

export const getBannerMetrics = async (): Promise<BannerMetrics> => {
  const response = await instance.get(BANNER_METRICS)
  return normalizeBannerMetrics(response.data)
}

export const getBannerById = async (id: string): Promise<BannerDetail> => {
  const response = await instance.get(BANNER_BY_ID(id))
  return normalizeBannerDetail(response.data)
}

export const createBanner = async (payload: CreateBannerPayload): Promise<Banner> => {
  if (payload.image) {
    const fd = new FormData()
    fd.append("name", payload.name)
    fd.append("bannerType", payload.bannerType)
    fd.append("placement", payload.placement)
    fd.append("targetAudience", payload.targetAudience)
    fd.append("isHeroBanner", String(payload.isHeroBanner))
    fd.append("image", payload.image)
    if (payload.ctaLabel) fd.append("ctaLabel", payload.ctaLabel)
    if (payload.ctaLink) fd.append("ctaLink", payload.ctaLink)
    fd.append("startDate", payload.startDate)
    fd.append("endDate", payload.endDate)
    if (payload.saveMode) fd.append("saveMode", payload.saveMode)
    const response = await instance.post(BANNER_CREATE_WITH_IMAGE, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return normalizeBanner(response.data)
  }
  const { image: _image, ...rest } = payload
  const response = await instance.post(BANNERS, rest)
  return normalizeBanner(response.data)
}

export const updateBanner = async (id: string, payload: UpdateBannerPayload): Promise<Banner> => {
  const response = await instance.put(BANNER_BY_ID(id), payload)
  return normalizeBanner(response.data)
}

export const changeBannerStatus = async (
  id: string,
  payload: ChangeBannerStatusPayload,
): Promise<Banner> => {
  const response = await instance.put(BANNER_STATUS(id), payload)
  return normalizeBanner(response.data)
}

export const deleteBanner = async (id: string): Promise<null> => {
  const response = await instance.delete(BANNER_BY_ID(id))
  return response.data
}

export const exportBannersCSV = async (): Promise<{ url: string }> => {
  const response = await instance.get(BANNER_EXPORT)
  return response.data
}
