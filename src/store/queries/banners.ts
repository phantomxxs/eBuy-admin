import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getBanners, getBannerMetrics, getBannerById } from "../requests/banners"
import { GET_BANNERS_KEY, GET_BANNER_METRICS_KEY, GET_BANNER_BY_ID_KEY } from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { BannerQueryParams } from "@/types/banners"

export const useGetBanners = (params: BannerQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.BANNERS_VIEW))
  return useQuery({
    queryKey: [GET_BANNERS_KEY, params],
    queryFn: () => getBanners(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetBannerMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.BANNERS_VIEW))
  return useQuery({
    queryKey: [GET_BANNER_METRICS_KEY],
    queryFn: getBannerMetrics,
    enabled: canView,
  })
}

export const useGetBannerById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.BANNERS_VIEW))
  return useQuery({
    queryKey: [GET_BANNER_BY_ID_KEY, id],
    queryFn: () => getBannerById(id!),
    enabled: !!id && canView,
  })
}
