import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import { PAYMENT_STATUS, FULFILLMENT_STATUS } from "@/utils/orders"
import {
  makeOrderColumns,
  PAYMENT_CONFIG,
  FULFILLMENT_CONFIG,
  formatOrderPrice,
} from "@/components/table-columns/orders"
import { useGetOrders, useGetOrderMetrics } from "@/store/queries/orders"
import type { Order } from "@/types/orders"
import PageSkeleton from "@/components/shared/page-skeleton"
import OrderDetailModal from "@/components/order/order-detail-modal"
import WalkInOrderModal from "@/components/order/walk-in-order/walk-in-order-modal"
export default function OrdersPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: metricsData, isLoading } = useGetOrderMetrics()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [showWalkInOrder, setShowWalkInOrder] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrders({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    payment_status: filters.payment_status?.join(",") || undefined,
    fulfillment_status: filters.fulfillment_status?.join(",") || undefined,
    order_type: filters.order_type?.join(",") || undefined,
    store_location_id: filters.store_location_id?.join(",") || undefined,
    amount_min: filters.amount_min?.[0] ? Number(filters.amount_min[0]) : undefined,
    amount_max: filters.amount_max?.[0] ? Number(filters.amount_max[0]) : undefined,
    date_from: filters.date_from?.[0],
    date_to: filters.date_to?.[0],
  })
  const metrics = metricsData?.data
  const orders = ordersData?.items ?? []
  const total = ordersData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  const columns = makeOrderColumns((order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  })

  if (isLoading) return <PageSkeleton metricCount={5} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Orders
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Track and manage all customer orders across your stores
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowWalkInOrder(true)}
        >
          Create order
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-6 lg:p-6">
          {(
            [
              { label: "Total orders", value: metrics.total },
              { label: "Paid", value: metrics.paid },
              { label: "Pending", value: metrics.pending },
              { label: "Processing", value: metrics.processing },
              { label: "Fulfilled", value: metrics.fulfilled },
              { label: "Cancelled", value: metrics.cancelled },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        {/* Toolbar */}
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search orders, customers, stores"
          exportProps={{ currentData: orders, filename: "orders" }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={orders}
            getRowId={(row) => row.order_id}
            onRowClick={(row) => {
              setSelectedOrder(row)
              setShowOrderDetail(true)
            }}
            isLoading={isLoadingOrders}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "orders",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {orders.map((order) => (
            <MobileOrderCard
              key={order.order_id}
              order={order}
              onClick={() => {
                setSelectedOrder(order)
                setShowOrderDetail(true)
              }}
            />
          ))}
        </div>
      </div>

      <div className="lg:hidden">
        <FloatingPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s)
            setPage(1)
          }}
        />
      </div>

      {/* ── Modals ── */}
      <OrderDetailModal
        isOpen={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        order={selectedOrder}
      />

      <WalkInOrderModal isOpen={showWalkInOrder} onClose={() => setShowWalkInOrder(false)} />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter orders"
        fields={ORDER_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
    </div>
  )
}

// ── Filter config ───────────────────────────────────────────────────────────────

const ORDER_FILTERS = [
  {
    key: "payment_status",
    label: "Payment status",
    options: [
      { label: "Paid", value: PAYMENT_STATUS.PAID },
      { label: "Unpaid", value: PAYMENT_STATUS.UNPAID },
      { label: "Pending", value: PAYMENT_STATUS.PENDING },
      { label: "Failed", value: PAYMENT_STATUS.FAILED },
      { label: "Refunded", value: PAYMENT_STATUS.REFUNDED },
    ],
  },
  {
    key: "fulfillment_status",
    label: "Fulfillment status",
    options: [
      { label: "Pending", value: FULFILLMENT_STATUS.PENDING },
      { label: "Unfulfilled", value: FULFILLMENT_STATUS.UNFULFILLED },
      { label: "Fulfilled", value: FULFILLMENT_STATUS.FULFILLED },
      { label: "Partial", value: FULFILLMENT_STATUS.PARTIAL },
      { label: "Returned", value: FULFILLMENT_STATUS.RETURNED },
      { label: "Accepted", value: FULFILLMENT_STATUS.ACCEPTED },
      { label: "Processing", value: FULFILLMENT_STATUS.PROCESSING },
      { label: "Cancelled", value: FULFILLMENT_STATUS.CANCELLED },
      { label: "Delivered", value: FULFILLMENT_STATUS.DELIVERED },
    ],
  },
  {
    key: "order_type",
    label: "Order type",
    options: [
      { label: "Website", value: "website" },
      { label: "Walk-in", value: "walk_in" },
    ],
  },
  { type: "location-search" as const, key: "store_location_id", label: "Store location" },
  { type: "number-range" as const, key: "amount", label: "Order amount" },
  { type: "date-range" as const, key: "date", label: "Date purchased" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileOrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => {
  const payment = PAYMENT_CONFIG[order.payment_status]
  const fulfillment = FULFILLMENT_CONFIG[order.fulfillment_status]
  return (
    <div
      className="flex items-center justify-between rounded-lg border bg-white p-4"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <span className="font-jakarta text-primary text-sm font-bold">
            {order.customer_name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{order.customer_name}</p>
          <p className="font-jakarta text-primary text-xs">{order.order_id}</p>
          <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{order.created_at}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="font-jakarta text-brand text-sm font-bold">
          {formatOrderPrice(order.grand_total)}
        </p>
        <StatusBadge label={payment.label} variant={payment.variant} dot />
        <StatusBadge label={fulfillment.label} variant={fulfillment.variant} dot />
      </div>
    </div>
  )
}
