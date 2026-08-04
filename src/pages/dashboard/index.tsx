import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowRight, Download, Plus } from "lucide-react"
import WalkInOrderModal from "@/components/order/walk-in-order/walk-in-order-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import DataTable from "@/components/ui/data-table"
import { useGetDashboard } from "@/store/queries/dashboard"
import { useAcceptOrder } from "@/store/mutations/orders"
import { ROUTES } from "@/lib/routes"
import { MetricCard, MobileDashboardMetricCard } from "@/components/dashboard/metric-card"
import RevenueChartCard from "@/components/dashboard/revenue-chart-card"
import RecentOrderCard from "@/components/dashboard/recent-order-card"
import LowStockCard from "@/components/dashboard/low-stock-card"
import ActionOrderCard from "@/components/dashboard/action-order-card"
import QuickActions from "@/components/dashboard/quick-actions"
import { lowStockColumns } from "@/components/table-columns/dashboard-low-stock"
import { recentOrderColumns } from "@/components/table-columns/dashboard-recent-orders"
import { useUserStore } from "@/store/user"
import { showAlert } from "@/store/alerts"
import type { ActionOrder } from "@/types/dashboard"
import { actionOrderColumns } from "@/components/table-columns/dashboard-action-orders"

export default function DashboardPage() {
  const { user } = useUserStore()
  const firstName = user?.firstname ?? "there"
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const { data, isLoading } = useGetDashboard()
  const dashboard = data?.data
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const acceptOrder = useAcceptOrder()

  const handleAccept = (order: ActionOrder) => {
    setAcceptingId(order.id)
    acceptOrder.mutate(order.id, {
      onSuccess: () => showAlert({ variant: "success", message: `Order ${order.id} accepted` }),
      onError: (e) => showAlert({ variant: "error", message: e.message }),
      onSettled: () => setAcceptingId(null),
    })
  }

  return (
    <div className="page-bg min-h-full">
      <WalkInOrderModal isOpen={newOrderOpen} onClose={() => setNewOrderOpen(false)} />

      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Good morning, {firstName} 👋
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Here's what's happening in your store today, {today}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Button variant="subtle" beforeIcon={<Download size={14} />}>
            <span className="hidden sm:inline">Download report</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            variant="secondary"
            beforeIcon={<Plus size={14} />}
            onClick={() => setNewOrderOpen(true)}
          >
            New order
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        {/* ── Metric cards ── */}
        {isLoading ? (
          <>
            <div className="no-scrollbar flex gap-3 overflow-x-auto md:hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border-borderSubtle h-20.5 w-37.5 shrink-0 rounded-xl border bg-white p-4"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-5 w-16" />
                </div>
              ))}
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid-cols-3 md:grid xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-borderSubtle rounded-xl border bg-white p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-5 w-16" />
                  <Skeleton className="mt-2 h-3 w-12" />
                </div>
              ))}
            </div>
          </>
        ) : dashboard ? (
          <>
            <div className="no-scrollbar flex gap-3 overflow-x-auto md:hidden">
              {dashboard.metrics.map((m, i) => (
                <MobileDashboardMetricCard
                  key={m.label}
                  metric={m}
                  index={i}
                  currency={m.label.toLowerCase().includes("revenue")}
                />
              ))}
            </div>
            <div className="hidden grid-cols-2 gap-3 sm:grid-cols-3 md:grid xl:grid-cols-6">
              {dashboard.metrics.map((m, i) => (
                <MetricCard
                  key={m.label}
                  index={i}
                  label={m.label}
                  value={m.value}
                  change={m.change}
                  changeType={m.changeType}
                  currency={m.label.toLowerCase().includes("revenue")}
                />
              ))}
            </div>
          </>
        ) : null}

        {/* ── Middle row: Recent orders + Revenue chart ── */}
        {isLoading ? (
          <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[1fr_440px]">
            <div className="border-borderSubtle order-2 overflow-hidden rounded-xl border bg-white xl:order-1">
              <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-14" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="border-borderSubtle flex items-center gap-3 border-b px-4 py-3.5"
                >
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex flex-1 items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-borderSubtle order-1 overflow-hidden rounded-xl border bg-white xl:order-2">
              <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="border-borderSubtle grid grid-cols-2 border-b">
                <div className="border-borderSubtle border-r px-4 py-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-5 w-20" />
                </div>
                <div className="px-4 py-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-5 w-10" />
                </div>
              </div>
              <div className="flex items-end gap-1.5 px-4 py-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: `${40 + Math.sin(i) * 30 + 30}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : dashboard ? (
          <div className="flex flex-col gap-4 xl:grid xl:h-78.5 xl:grid-cols-[1fr_540px]">
            <div className="border-borderSubtle order-2 overflow-hidden rounded-xl border bg-white xl:order-1">
              <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
                <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                  Recent orders
                </span>
                <Link
                  to={ROUTES.orders}
                  className="font-jakarta text-primary flex items-center gap-1 text-xs font-medium no-underline hover:underline"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="hidden lg:block">
                <DataTable
                  columns={recentOrderColumns}
                  data={dashboard.recentOrders?.slice(0, 3)}
                  getRowId={(row) => row.order_id}
                />
              </div>
              <div className="divide-borderSubtle divide-y lg:hidden">
                {dashboard.recentOrders.map((order) => (
                  <RecentOrderCard key={order.order_id} order={order} />
                ))}
              </div>
            </div>
            <RevenueChartCard />
          </div>
        ) : null}

        {/* ── Quick actions (mobile-only) ── */}
        <div className="lg:hidden">
          <QuickActions />
        </div>

        {/* ── Bottom row: Low stock + Orders requiring action ── */}
        {isLoading ? (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="border-borderSubtle overflow-hidden rounded-xl border bg-white"
              >
                <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-14" />
                </div>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5"
                  >
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : dashboard ? (
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            {/* LOW STOCK ITEMS */}
            <div className="border-borderSubtle order-2 overflow-hidden rounded-xl border bg-white lg:order-1">
              <div className="border-borderSubtle border-b px-4 py-3.5">
                <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                  Low stock alerts
                </span>
              </div>
              <div className="hidden lg:block">
                <DataTable
                  columns={lowStockColumns}
                  data={dashboard.lowStockAlerts}
                  getRowId={(row) => row.sku}
                />
              </div>
              <div className="divide-borderSubtle divide-y lg:hidden">
                {dashboard.lowStockAlerts.map((item) => (
                  <LowStockCard key={item.sku} item={item} />
                ))}
              </div>
            </div>

            {/* PENDING ORDERS */}
            <div className="border-borderSubtle order-1 overflow-hidden rounded-xl border bg-white lg:order-2">
              <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
                <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                  Orders requiring action
                </span>
                <Link
                  to={ROUTES.orders}
                  className="font-jakarta text-primary flex items-center gap-1 text-xs font-medium no-underline hover:underline"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="hidden lg:block">
                <DataTable
                  columns={actionOrderColumns}
                  data={dashboard.ordersRequiringAction}
                  getRowId={(row) => row.id}
                />
              </div>
              <div className="divide-borderSubtle divide-y lg:hidden">
                {dashboard.ordersRequiringAction.map((order) => (
                  <ActionOrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAccept}
                    isAccepting={acceptingId === order.id}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
