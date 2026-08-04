export interface AnalyticsMetric {
  label: string
  value: string
  change: string
  changeType: "up" | "down"
}

export interface RevenueDataPoint {
  day: string
  revenue: number
}

export interface CategoryRevenue {
  name: string
  value: number
  revenue: number
  color: string
}

export interface TopProduct {
  rank: number
  product: string
  category: string
  unitsSold: number
  revenue: number
  growth: string
  growthType: "up" | "down"
}

export interface AnalyticsDashboard {
  metrics: AnalyticsMetric[]
  revenueChart: RevenueDataPoint[]
  avgOrderValue: number
  ordersToday: number
  categoryRevenue: CategoryRevenue[]
  topProducts: TopProduct[]
}
