import type { DiscountQueryParams } from "@/types/discounts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { GET_DISCOUNT_BY_ID_KEY, GET_DISCOUNT_METRICS_KEY, GET_DISCOUNTS_KEY } from "../query-keys"
import { getDiscountById, getDiscountMetrics, getDiscounts } from "../requests/discounts"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"

export const useGetDiscounts = (params: DiscountQueryParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PROMOTIONS_VIEW))
  return useQuery({
    queryKey: [GET_DISCOUNTS_KEY, params],
    queryFn: () => getDiscounts(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}

export const useGetDiscountMetrics = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PROMOTIONS_VIEW))
  return useQuery({
    queryKey: [GET_DISCOUNT_METRICS_KEY],
    queryFn: getDiscountMetrics,
    enabled: canView,
  })
}

export const useGetDiscountById = (id: string | null) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.PROMOTIONS_VIEW))
  return useQuery({
    queryKey: [GET_DISCOUNT_BY_ID_KEY, id],
    queryFn: () => getDiscountById(id!),
    enabled: !!id && canView,
  })
}
