import instance from "@/services/axios-instance"
import { ANALYTICS, ANALYTICS_EXPORT } from "@/services/apis"
import type { AnalyticsDashboard } from "@/types/analytics"

export interface AnalyticsParams {
  period?: string
  chartPeriod?: string
  categoryPeriod?: string
  topCategoriesLimit?: number
  topProductsLimit?: number
  locationIds?: string[]
}

function deriveChangeType(val: unknown): "up" | "down" {
  if (val === "down" || val === "decrease" || val === false) return "down"
  return "up"
}

function normalizeAnalytics(raw: unknown): AnalyticsDashboard {
  const d = (raw ?? {}) as Record<string, unknown>

  // Metrics: support both {metrics:[]} array format and flat top-level fields
  let metrics: AnalyticsDashboard["metrics"]
  if (Array.isArray(d.metrics)) {
    metrics = (d.metrics as Record<string, unknown>[]).map((m) => ({
      label: String(m.label ?? ""),
      value: String(m.value ?? "0"),
      change: String(m.change ?? "0%"),
      changeType: deriveChangeType(m.changeType ?? m.change_type),
    }))
  } else {
    metrics = [
      {
        label: "Total Revenue",
        value: String(d.total_revenue ?? "0"),
        change: String(d.revenue_change ?? d.total_revenue_change ?? "0%"),
        changeType: deriveChangeType(d.revenue_change_type ?? d.total_revenue_change_type),
      },
      {
        label: "Orders Completed",
        value: String(d.orders_completed ?? d.total_orders ?? "0"),
        change: String(d.orders_change ?? "0%"),
        changeType: deriveChangeType(d.orders_change_type),
      },
      {
        label: "New Customers",
        value: String(d.new_customers ?? d.total_customers ?? "0"),
        change: String(d.customers_change ?? "0%"),
        changeType: deriveChangeType(d.customers_change_type),
      },
      {
        label: "Avg. Order Value",
        value: String(d.average_order_value ?? d.avg_order_value ?? "0"),
        change: String(d.aov_change ?? "0%"),
        changeType: deriveChangeType(d.aov_change_type),
      },
    ]
  }

  // Revenue chart: supports flat array OR { data_points: [...] } object, top-level or nested
  const rawChart = d.revenueChart ?? d.revenue_chart ?? d.chart_data ?? d
  const chartPoints = Array.isArray(rawChart)
    ? (rawChart as Record<string, unknown>[])
    : Array.isArray((rawChart as Record<string, unknown>)?.data_points)
      ? ((rawChart as Record<string, unknown>).data_points as Record<string, unknown>[])
      : Array.isArray(d.data_points)
        ? (d.data_points as Record<string, unknown>[])
        : []
  const revenueChart = chartPoints.map((p) => ({
    day: String(p.day ?? p.date ?? p.label ?? ""),
    revenue: Number(p.revenue ?? p.amount ?? p.value ?? p.count ?? 0),
  }))

  // Avg order value + orders today for the revenue chart stats
  const avgOrderValue = Number(d.avgOrderValue ?? d.avg_order_value ?? d.average_order_value ?? 0)
  const ordersToday = Number(d.ordersToday ?? d.orders_today ?? 0)

  // Category revenue: supports categoryRevenue, category_revenue, revenue_by_category
  const rawCat = d.categoryRevenue ?? d.category_revenue ?? d.revenue_by_category
  const categoryRevenue = Array.isArray(rawCat)
    ? (rawCat as Record<string, unknown>[]).map((c) => ({
        name: String(c.name ?? c.category_name ?? ""),
        value: Number(c.value ?? c.percentage ?? 0),
        revenue: Number(c.revenue ?? c.revenue_amount ?? 0),
        color: String(c.color ?? "#D97706"),
      }))
    : []

  // Top products: supports topProducts, top_products, top_selling_products
  const rawTop = d.topProducts ?? d.top_products ?? d.top_selling_products
  const topProducts = Array.isArray(rawTop)
    ? (rawTop as Record<string, unknown>[]).map((p, i) => ({
        rank: Number(p.rank ?? i + 1),
        product: String(p.product ?? p.name ?? p.product_name ?? ""),
        category: String(p.category ?? p.category_name ?? ""),
        unitsSold: Number(p.unitsSold ?? p.units_sold ?? p.qty_sold ?? 0),
        revenue: Number(p.revenue ?? 0),
        growth: String(p.growth ?? p.growth_rate ?? "0%"),
        growthType: deriveChangeType(p.growthType ?? p.growth_type),
      }))
    : []

  return { metrics, revenueChart, avgOrderValue, ordersToday, categoryRevenue, topProducts }
}

export const getAnalytics = async (params: AnalyticsParams = {}): Promise<AnalyticsDashboard> => {
  const response = await instance.get(ANALYTICS, {
    params: {
      period: params.period ?? "30d",
      chartPeriod: params.chartPeriod ?? "30d",
      categoryPeriod: params.categoryPeriod ?? "30d",
      topCategoriesLimit: params.topCategoriesLimit ?? 5,
      topProductsLimit: params.topProductsLimit ?? 5,
      ...(params.locationIds?.length &&
        Object.fromEntries(params.locationIds.map((id, i) => [`locationIds[${i}]`, id]))),
    },
  })
  return normalizeAnalytics(response.data)
}

export const exportAnalytics = async (
  params: AnalyticsParams = {},
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(ANALYTICS_EXPORT, {
    params: {
      period: params.period ?? "30d",
      chartPeriod: params.chartPeriod ?? "30d",
      categoryPeriod: params.categoryPeriod ?? "30d",
      ...(params.locationIds?.length &&
        Object.fromEntries(params.locationIds.map((id, i) => [`locationIds[${i}]`, id]))),
    },
  })
  return response.data
}
