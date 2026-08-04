import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getAnalytics } from "../requests/analytics"
import { GET_ANALYTICS_KEY } from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { AnalyticsParams } from "../requests/analytics"

export const useGetAnalytics = (params: AnalyticsParams = {}) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.ANALYTICS_VIEW))
  return useQuery({
    queryKey: [GET_ANALYTICS_KEY, params],
    queryFn: () => getAnalytics(params),
    placeholderData: keepPreviousData,
    enabled: canView,
  })
}
