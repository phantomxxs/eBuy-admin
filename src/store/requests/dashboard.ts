import instance from "@/services/axios-instance"
import {
  DASHBOARD_STATS,
  DASHBOARD_REVENUE_CHART,
  DASHBOARD_LOW_STOCK,
  DASHBOARD_PENDING_ORDERS,
  ORDERS,
} from "@/services/apis"
import type {
  DashboardData,
  RevenueDataPoint,
  RevenueChartData,
  RevenueChartParams,
  RawDashboardStats,
  RawRevenueChart,
} from "@/types/dashboard"
import type { ApiResponse } from "@/types/utils"
import {
  normalizeDashboardMetrics,
  normalizeLowStockItem,
  normalizeActionOrder,
} from "@/store/normalizers/dashboard"
import type { Order } from "@/types/orders"

export const getDashboard = async (): Promise<ApiResponse<DashboardData>> => {
  const [statsRes, chartRes, lowStockRes, pendingOrdersRes, recentOrdersRes] = await Promise.all([
    instance.get(DASHBOARD_STATS),
    instance.get(DASHBOARD_REVENUE_CHART, { params: { period: "7d" } }),
    instance.get(DASHBOARD_LOW_STOCK, { params: { pageSize: 5 } }),
    instance.get(DASHBOARD_PENDING_ORDERS, { params: { pageSize: 5 } }),
    instance.get(ORDERS, {
      params: { pageSize: 5, currentPage: 1, sortBy: "created_at", sortDir: "DESC" },
    }),
  ])

  const stats = statsRes.data as RawDashboardStats
  const chart = chartRes.data as RawRevenueChart
  const lowStockBody = lowStockRes.data
  const pendingBody = pendingOrdersRes.data
  const recentBody = recentOrdersRes.data

  const lowStockItems: unknown[] = Array.isArray(lowStockBody?.items)
    ? lowStockBody.items
    : Array.isArray(lowStockBody)
      ? lowStockBody
      : []
  const pendingItems: unknown[] = Array.isArray(pendingBody?.items)
    ? pendingBody.items
    : Array.isArray(pendingBody)
      ? pendingBody
      : []
  const rawRecentItems: unknown[] = Array.isArray(recentBody?.items)
    ? recentBody.items
    : Array.isArray(recentBody)
      ? recentBody
      : []
  const recentItems: Order[] = rawRecentItems.map((o) => {
    const r = (o ?? {}) as Record<string, unknown>
    return {
      ...(r as unknown as Order),
      grand_total: Number(r.grand_total ?? r.total ?? r.base_grand_total ?? 0),
    }
  })

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const rawPoints = chart?.data_points ?? chart?.data ?? []
  const rawChartData: RevenueDataPoint[] = rawPoints.map((d) => ({
    day: d.label ?? d.day ?? d.date ?? "",
    orders: d.value ?? d.orders ?? d.count ?? 0,
  }))
  const chartData: RevenueDataPoint[] =
    rawChartData.length > 0 ? rawChartData : DAYS.map((day) => ({ day, orders: 0 }))

  const data: DashboardData = {
    metrics: normalizeDashboardMetrics(stats),
    recentOrders: recentItems,
    revenueChart: {
      avgOrderValue: chart?.avg_order_value ?? chart?.avgOrderValue ?? 0,
      ordersToday: chart?.orders_today ?? chart?.ordersToday ?? 0,
      data: chartData,
    },
    lowStockAlerts: lowStockItems.map(normalizeLowStockItem),
    ordersRequiringAction: pendingItems.map(normalizeActionOrder),
  }

  return {
    data,
    message: "Dashboard fetched successfully",
    status: 200,
    type: "success",
    url: DASHBOARD_STATS,
  }
}

export const getRevenueChart = async (
  params: RevenueChartParams,
): Promise<ApiResponse<RevenueChartData>> => {
  const queryParams =
    params.startDate && params.endDate
      ? { start_date: params.startDate, end_date: params.endDate }
      : { period: params.period ?? "7d" }
  const res = await instance.get(DASHBOARD_REVENUE_CHART, { params: queryParams })
  const chart = res.data as RawRevenueChart

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const rawPoints = chart?.data_points ?? chart?.data ?? []
  const rawData: RevenueDataPoint[] = rawPoints.map((d) => ({
    day: d.label ?? d.day ?? d.date ?? "",
    orders: d.value ?? d.orders ?? d.count ?? 0,
  }))
  const data: RevenueChartData = {
    avgOrderValue: chart?.avg_order_value ?? chart?.avgOrderValue ?? 0,
    ordersToday: chart?.orders_today ?? chart?.ordersToday ?? 0,
    data: rawData.length > 0 ? rawData : DAYS.map((day) => ({ day, orders: 0 })),
  }
  return {
    data,
    message: "Revenue chart fetched",
    status: 200,
    type: "success",
    url: DASHBOARD_REVENUE_CHART,
  }
}
