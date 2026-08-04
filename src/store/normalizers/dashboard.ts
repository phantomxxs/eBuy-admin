import type {
  DashboardMetricItem,
  LowStockItem,
  ActionOrder,
  RecentOrder,
  RawDashboardStats,
  RawLowStockItem,
  RawActionOrder,
  RawRecentOrder,
} from "@/types/dashboard"

function formatChange(value: unknown): { change: string; changeType: "up" | "down" } | undefined {
  if (value === undefined || value === null) return undefined
  const n = Number(value)
  if (isNaN(n)) return undefined
  return { change: `${n >= 0 ? "+" : ""}${n}%`, changeType: n >= 0 ? "up" : "down" }
}

export function normalizeDashboardMetrics(stats: RawDashboardStats): DashboardMetricItem[] {
  const fieldMap: Array<{ keys: string[]; changeKey?: string; label: string }> = [
    {
      keys: ["total_orders", "totalOrders"],
      changeKey: "total_orders_change",
      label: "Total orders",
    },
    {
      keys: ["revenue", "total_revenue", "totalRevenue"],
      changeKey: "revenue_change",
      label: "Revenue",
    },
    {
      keys: ["total_customers", "active_customers", "activeCustomers"],
      changeKey: "total_customers_change",
      label: "Total customers",
    },
    {
      keys: ["active_products", "total_products", "totalProducts"],
      changeKey: "active_products_change",
      label: "Active products",
    },
    {
      keys: ["pending_orders", "pendingOrders"],
      changeKey: "pending_orders_since_yesterday",
      label: "Pending orders",
    },
    {
      keys: ["active_promotions", "activePromotions"],
      changeKey: "promotions_expiring_this_week",
      label: "Active promotions",
    },
  ]
  const metrics: DashboardMetricItem[] = []
  for (const { keys, changeKey, label } of fieldMap) {
    for (const key of keys) {
      if (stats[key] !== undefined) {
        const changeMeta = changeKey ? formatChange(stats[changeKey]) : undefined
        metrics.push({ label, value: stats[key] as string | number, ...changeMeta })
        break
      }
    }
  }
  return metrics
}

export function normalizeLowStockItem(raw: unknown): LowStockItem {
  const r = raw as RawLowStockItem
  return {
    product: r.product ?? r.product_name ?? r.name ?? "",
    sku: r.sku ?? "",
    stock: r.stock ?? r.stock_qty ?? 0,
    stockStatus: (r.stockStatus ?? r.stock_status ?? "low") as LowStockItem["stockStatus"],
    location: r.location ?? r.location_name ?? "",
  }
}

export function normalizeActionOrder(raw: unknown): ActionOrder {
  const r = raw as RawActionOrder
  return {
    id: String(r.id ?? r.order_id ?? ""),
    customer: r.customer ?? r.customer_name ?? "",
    items: r.items ?? r.item_names ?? r.items_summary ?? "",
  }
}
