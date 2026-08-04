import { ArrowRight, Download, Plus, MapPin } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import DataTable, { StatusBadge } from "@/components/ui/data-table"
import { MetricCard } from "@/components/dashboard/metric-card"
import { lowStockColumns } from "@/components/table-columns/dashboard-low-stock"
import { actionOrderColumns } from "@/components/table-columns/dashboard-action-orders"
import { recentOrderColumns } from "@/components/table-columns/dashboard-recent-orders"
import { formatPrice } from "@/utils/shared"
import type {
  RecentOrder,
  LowStockItem,
  ActionOrder,
  OrderStatus,
  StockLevel,
} from "@/types/dashboard"

// ── Hardcoded preview data ─────────────────────────────────────────────────────

const METRICS = [
  { label: "Total orders", value: 1284, change: "+12%", changeType: "up" as const },
  { label: "Total revenue", value: "₦48.2M", change: "+8.4%", changeType: "up" as const },
  { label: "Active customers", value: 392, change: "+5.1%", changeType: "up" as const },
  { label: "Pending orders", value: 27, change: "-3.2%", changeType: "down" as const },
  { label: "Fulfilled today", value: 64, change: "+18%", changeType: "up" as const },
  { label: "Total products", value: 318, change: "+2", changeType: "up" as const },
]

const RECENT_ORDERS: RecentOrder[] = [
  { id: "TUL-00421", customer: "Amaka Okafor", amount: 44100, status: "processing" },
  { id: "TUL-00420", customer: "Tochi Nwofor", amount: 18500, status: "pending" },
  { id: "TUL-00419", customer: "Chidera Eze", amount: 72000, status: "delivered" },
  { id: "TUL-00418", customer: "Ngozi Adeyemi", amount: 31200, status: "shipped" },
  { id: "TUL-00417", customer: "Emeka Obiora", amount: 9800, status: "cancelled" },
]

const REVENUE_CHART = {
  avgOrderValue: 37450,
  ordersToday: 12,
  data: [
    { day: "Mon", orders: 24 },
    { day: "Tue", orders: 31 },
    { day: "Wed", orders: 18 },
    { day: "Thu", orders: 42 },
    { day: "Fri", orders: 38 },
    { day: "Sat", orders: 55 },
    { day: "Sun", orders: 29 },
  ],
}

const LOW_STOCK: LowStockItem[] = [
  {
    product: "CeraVe Moisturising Cream 454g",
    sku: "CRV-MC454",
    stock: 3,
    stockStatus: "critical",
    location: "Lekki",
  },
  {
    product: "The Ordinary Niacinamide 10%",
    sku: "TO-NIA10",
    stock: 7,
    stockStatus: "low",
    location: "VI",
  },
  {
    product: "La Roche-Posay Toleriane",
    sku: "LRP-TOL60",
    stock: 4,
    stockStatus: "low",
    location: "Ikeja",
  },
  {
    product: "Neutrogena Hydro Boost Gel",
    sku: "NTG-HB50",
    stock: 2,
    stockStatus: "critical",
    location: "Lekki",
  },
]

const ACTION_ORDERS: ActionOrder[] = [
  { id: "TUL-00415", customer: "Bola Adesanya", items: "2 items · Serum, Toner" },
  { id: "TUL-00413", customer: "Yewande Lawal", items: "1 item · Moisturiser" },
  { id: "TUL-00411", customer: "Emeka Obiora", items: "3 items · Cleanser, SPF, Oil" },
  { id: "TUL-00409", customer: "Sade Adekunle", items: "1 item · Eye Cream" },
]

// ── Order status config ────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "success" | "warning" | "info" | "neutral" | "error" | "default" }
> = {
  delivered: { label: "Delivered", variant: "success" },
  processing: { label: "Processing", variant: "info" },
  shipped: { label: "Shipped", variant: "warning" },
  pending: { label: "Pending", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "error" },
}

const STOCK_CONFIG: Record<StockLevel, { label: string; variant: "warning" | "error" }> = {
  low: { label: "Low", variant: "warning" },
  critical: { label: "Critical", variant: "error" },
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DashboardPreview() {
  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Good morning, Adaeze 👋
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Here's what's happening in your store today
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Button variant="subtle" beforeIcon={<Download size={14} />}>
            Download report
          </Button>
          <Button variant="secondary" beforeIcon={<Plus size={14} />}>
            New order
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        {/* ── Metric cards ── */}
        <div className="hidden grid-cols-2 gap-3 sm:grid-cols-3 md:grid xl:grid-cols-6">
          {METRICS.map((m, i) => (
            <MetricCard
              key={m.label}
              index={i}
              label={m.label}
              value={m.value}
              change={m.change}
              changeType={m.changeType}
            />
          ))}
        </div>

        {/* ── Middle row: Recent orders + Revenue chart ── */}
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[1fr_440px]">
          {/* Recent orders */}
          <div className="border-borderSubtle order-2 overflow-hidden rounded-xl border bg-white xl:order-1">
            <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
              <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                Recent orders
              </span>
              <span className="font-jakarta text-primary flex items-center gap-1 text-xs font-medium">
                View all <ArrowRight size={12} />
              </span>
            </div>
            <div className="hidden lg:block">
              <DataTable
                columns={recentOrderColumns}
                data={RECENT_ORDERS}
                getRowId={(row) => row.id}
              />
            </div>
            <div className="divide-borderSubtle divide-y lg:hidden">
              {RECENT_ORDERS.map((order) => (
                <RecentOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Revenue chart */}
          <div className="border-borderSubtle order-1 overflow-hidden rounded-xl border bg-white xl:order-2">
            <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
              <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                Revenue
              </span>
              <span className="font-jakarta text-brand/50 text-xs font-medium">Last 7 days</span>
            </div>
            <div className="border-borderSubtle grid grid-cols-2 border-b">
              <div className="border-borderSubtle border-r px-4 py-4">
                <p className="font-jakarta text-brand/50 text-xs font-medium">Avg. order value</p>
                <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
                  {formatPrice(REVENUE_CHART.avgOrderValue)}
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="font-jakarta text-brand/50 text-xs font-medium">Orders today</p>
                <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
                  {REVENUE_CHART.ordersToday}
                </p>
              </div>
            </div>
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={REVENUE_CHART.data} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fill: "var(--color-chartAxis)",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 10,
                      fill: "var(--color-chartAxis)",
                    }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Inter",
                      fontSize: 12,
                      border: "1px solid var(--color-borderSubtle)",
                      borderRadius: 8,
                      boxShadow: "var(--shadow-tooltip)",
                    }}
                    cursor={{ fill: "var(--color-brand-ghost, rgba(55,0,32,0.03))" }}
                  />
                  <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Low stock + Orders requiring action ── */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
          {/* Low stock alerts */}
          <div className="border-borderSubtle order-2 overflow-hidden rounded-xl border bg-white lg:order-1">
            <div className="border-borderSubtle border-b px-4 py-3.5">
              <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                Low stock alerts
              </span>
            </div>
            <div className="hidden lg:block">
              <DataTable columns={lowStockColumns} data={LOW_STOCK} getRowId={(row) => row.sku} />
            </div>
            <div className="divide-borderSubtle divide-y lg:hidden">
              {LOW_STOCK.map((item) => (
                <LowStockCard key={item.sku} item={item} />
              ))}
            </div>
          </div>

          {/* Orders requiring action */}
          <div className="border-borderSubtle order-1 overflow-hidden rounded-xl border bg-white lg:order-2">
            <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
              <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                Orders requiring action
              </span>
              <span className="font-jakarta text-primary flex items-center gap-1 text-xs font-medium">
                View all <ArrowRight size={12} />
              </span>
            </div>
            <div className="hidden lg:block">
              <DataTable
                columns={actionOrderColumns}
                data={ACTION_ORDERS}
                getRowId={(row) => row.id}
              />
            </div>
            <div className="divide-borderSubtle divide-y lg:hidden">
              {ACTION_ORDERS.map((order) => (
                <ActionOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const RecentOrderCard = ({ order }: { order: RecentOrder }) => {
  const cfg = ORDER_STATUS_CONFIG[order.status]
  const initials = order.customer
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="bg-primary/10 text-primary font-jakarta flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
        {initials}
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-jakarta text-brand text-sm font-semibold">{order.customer}</span>
          <span className="font-jakarta text-brand/50 text-xs">{order.id}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-jakarta text-brand text-sm font-semibold">
            {formatPrice(order.amount)}
          </span>
          <StatusBadge label={cfg.label} variant={cfg.variant} dot />
        </div>
      </div>
    </div>
  )
}

const LowStockCard = ({ item }: { item: LowStockItem }) => {
  const cfg = STOCK_CONFIG[item.stockStatus]
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <span className="font-jakarta text-brand text-sm leading-snug font-medium">
          {item.product}
        </span>
        <StatusBadge label={String(item.stock)} variant={cfg.variant} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-jakarta text-brand/50 text-xs">{item.sku}</span>
          <span className="font-jakarta text-brand/50 flex items-center gap-0.5 text-xs">
            <MapPin size={10} className="shrink-0" />
            {item.location}
          </span>
        </div>
        <button className="font-jakarta text-primary text-xs font-semibold">Restock</button>
      </div>
    </div>
  )
}

const ActionOrderCard = ({ order }: { order: ActionOrder }) => (
  <div className="flex items-center justify-between px-4 py-3.5">
    <div className="flex flex-col gap-0.5">
      <span className="font-jakarta text-primary text-sm font-semibold">{order.id}</span>
      <span className="font-jakarta text-brand/60 text-xs">
        {order.customer} · {order.items}
      </span>
    </div>
    <button className="font-jakarta text-primary text-xs font-semibold">Accept</button>
  </div>
)
