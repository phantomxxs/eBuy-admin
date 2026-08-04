import type { Order } from "./orders"

export interface RawDashboardStats {
  [key: string]: unknown
}

export interface RawRevenueDataPoint {
  label?: string
  value?: number
  day?: string
  date?: string
  orders?: number
  count?: number
}

export interface RawRevenueChart {
  avg_order_value?: number
  avgOrderValue?: number
  orders_today?: number
  ordersToday?: number
  data_points?: RawRevenueDataPoint[]
  data?: RawRevenueDataPoint[]
}

export interface RawLowStockItem {
  product?: string
  product_name?: string
  name?: string
  sku?: string
  stock?: number
  stock_qty?: number
  stock_status?: string
  stockStatus?: string
  location?: string
  location_name?: string
}

export interface RawActionOrder {
  id?: string
  order_id?: string
  customer?: string
  customer_name?: string
  items?: string
  item_names?: string
  items_summary?: string
}

export interface RawRecentOrder {
  id?: string
  order_id?: string
  customer?: string
  customer_name?: string
  amount?: number
  total_amount?: number
  status?: string
}

export interface DashboardMetricItem {
  label: string
  value: string | number
  change?: string
  changeType?: "up" | "down"
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: OrderStatus
}

export interface RevenueDataPoint {
  day: string
  orders: number
}

export type StockLevel = "low" | "critical"

export interface LowStockItem {
  product: string
  sku: string
  stock: number
  stockStatus: StockLevel
  location: string
}

export interface ActionOrder {
  id: string
  customer: string
  items: string
}

export interface RevenueChartData {
  avgOrderValue: number
  ordersToday: number
  data: RevenueDataPoint[]
}

export interface RevenueChartParams {
  period?: string
  startDate?: string
  endDate?: string
}

export interface DashboardData {
  metrics: DashboardMetricItem[]
  recentOrders: Order[]
  revenueChart: RevenueChartData
  lowStockAlerts: LowStockItem[]
  ordersRequiringAction: ActionOrder[]
}
