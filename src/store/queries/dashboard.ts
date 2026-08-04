import { useQuery } from "@tanstack/react-query"
import { getDashboard, getRevenueChart } from "../requests/dashboard"
import { GET_DASHBOARD_KEY, GET_REVENUE_CHART_KEY } from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"
import type { RevenueChartParams } from "@/types/dashboard"

export const useGetDashboard = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.DASHBOARD_VIEW_METRICS))
  return useQuery({
    queryKey: [GET_DASHBOARD_KEY],
    queryFn: getDashboard,
    enabled: canView,
  })
}

export const useGetRevenueChart = (params: RevenueChartParams) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.DASHBOARD_VIEW_REVENUE))
  return useQuery({
    queryKey: [GET_REVENUE_CHART_KEY, params],
    queryFn: () => getRevenueChart(params),
    enabled: canView,
  })
}
