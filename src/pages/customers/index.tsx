import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useQueryState } from "nuqs"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import { cn } from "@/lib/utils"
import {
  makeCustomerColumns,
  customerStatusConfig,
  formatCustomerPrice,
} from "@/components/table-columns/customers"
import { useGetCustomers, useGetCustomerMetrics } from "@/store/queries/customers"
import { useExportCustomersCSV, useExportCustomersExcel } from "@/store/mutations/customers"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import CustomerDetailModal from "@/components/customer/customer-detail-modal"
import GuestDetailModal from "@/components/customer/guest-detail-modal"
import BulkActionPanel from "@/components/customer/bulk-action-panel"
import SendCampaignModal from "@/components/customer/send-campaign-modal"
import CampaignsTab from "@/components/customer/campaigns-tab"
import PageSkeleton from "@/components/shared/page-skeleton"
import type { CustomerDetail, CustomerMetrics } from "@/types/customers"
import { CustomerStatus } from "@/lib/constants"
import { getInitials } from "@/store/normalizers/customers"

const PAGE_TABS = ["Customers", "Campaigns"] as const
type PageTab = (typeof PAGE_TABS)[number]

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useQueryState<PageTab>("tab", {
    defaultValue: "Customers",
    parse: (v) => (PAGE_TABS.includes(v as PageTab) ? (v as PageTab) : "Customers"),
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<CustomerDetail | null>(null)
  const [showGuestDetail, setShowGuestDetail] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ name: string } | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [showCampaign, setShowCampaign] = useState(false)

  const { data: metrics, isLoading } = useGetCustomerMetrics()
  const { data: customersData, isLoading: isLoadingCustomerData } = useGetCustomers({
    search: debouncedSearch,
    pageSize,
    currentPage: page,
    status: filters.status?.join(",") || undefined,
    customer_type: filters.customer_type?.join(",") || undefined,
  })
  const exportCSV = useExportCustomersCSV()
  const exportExcel = useExportCustomersExcel()

  const customers = customersData?.items ?? []
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [clearSelectionToken, setClearSelectionToken] = useState(0)

  const openDetail = (customer: CustomerDetail) => {
    if (customer.customer_type === CustomerStatus.GUEST) {
      setSelectedGuest(customer)
      setShowGuestDetail(true)
    } else {
      setSelectedCustomer(customer)
      setShowDetail(true)
    }
  }

  const columns = useMemo(
    () =>
      makeCustomerColumns(
        (customer) => openDetail(customer),
        (customer) => setDeleteTarget({ name: customer.customer_name }),
      ),
    [],
  )

  if (isLoading || isLoadingCustomerData) return <PageSkeleton metricCount={7} />

  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  const selectedCustomers = customers.filter((c) => selectedIds.includes(String(c.entity_id)))

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Customers
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            All registered and guest customers across your stores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => exportExcel.mutate({})}
            loading={exportExcel.isPending}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            beforeIcon={<Megaphone size={14} />}
            onClick={() => setShowCampaign(true)}
          >
            Send campaign
          </Button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-4 lg:p-6">
          {CUSTOMER_METRICS(metrics).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:mt-6 lg:rounded-xl lg:border lg:bg-white">
        {/* ── Page tabs ── */}
        <div className="border-borderSubtle no-scrollbar flex gap-0 overflow-x-auto border-b px-4">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-jakarta shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-brand/50 hover:text-brand border-transparent",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Customers" && (
          <>
            <TableToolbar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search customers by name, email, or ID"
              exportProps={{
                currentData: customers,
                filename: "customers",
                onExportAll: () =>
                  exportCSV.mutate({
                    search: debouncedSearch,
                    status: filters.status?.join(",") || undefined,
                  }),
              }}
              onFilterClick={() => setShowFilter(true)}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Desktop table */}
            <div className="hidden lg:block">
              <DataTable
                columns={columns}
                data={customers}
                getRowId={(row) => row.customer_id}
                onRowClick={openDetail}
                isLoading={isLoadingCustomerData}
                onSelectionChange={setSelectedIds}
                clearSelectionToken={clearSelectionToken}
                rowSelectionActions={
                  <BulkActionPanel
                    selectedCustomers={selectedCustomers}
                    onComplete={() => setClearSelectionToken((t) => t + 1)}
                  />
                }
                pagination={{
                  page,
                  pageSize,
                  total: customersData?.total_count ?? 0,
                  onPageChange: setPage,
                  onPageSizeChange: (s) => {
                    setPageSize(s)
                    setPage(1)
                  },
                  entityLabel: "customers",
                }}
              />
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 px-4 lg:hidden">
              {customers.map((customer) => (
                <MobileCustomerCard
                  key={customer.entity_id}
                  customer={customer}
                  onView={() => openDetail(customer)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "Campaigns" && <CampaignsTab />}
      </div>

      {activeTab === "Customers" && (
        <div className="lg:hidden">
          <FloatingPagination
            page={page}
            totalPages={Math.max(1, Math.ceil((customersData?.total_count ?? 0) / pageSize))}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              setPage((p) =>
                Math.min(
                  Math.max(1, Math.ceil((customersData?.total_count ?? 0) / pageSize)),
                  p + 1,
                ),
              )
            }
            pageSize={pageSize}
            onPageSizeChange={(s) => {
              setPageSize(s)
              setPage(1)
            }}
          />
        </div>
      )}

      <CustomerDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        customer={selectedCustomer}
      />
      <GuestDetailModal
        isOpen={showGuestDetail}
        onClose={() => setShowGuestDetail(false)}
        customer={selectedGuest}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
        entityType="customer"
        entityName={deleteTarget?.name}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter customers"
        fields={CUSTOMER_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
      <SendCampaignModal isOpen={showCampaign} onClose={() => setShowCampaign(false)} />
    </div>
  )
}

// ── Config ──────────────────────────────────────────────────────────────────────

const CUSTOMER_METRICS = (m: CustomerMetrics) => [
  { label: "Total customers", value: m.total },
  { label: "Active", value: m.active },
  { label: "Inactive", value: m.suspended },
  { label: "Guest", value: m.guest },
  { label: "New (last 7 days)", value: m.newLast7Days },
  { label: "With pending orders", value: m.withPendingOrders },
  { label: "Store pickup orders", value: m.withStorePickupOrders },
]

// ── Filter config ───────────────────────────────────────────────────────────────

const CUSTOMER_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "customer_type",
    label: "Customer type",
    options: [
      { label: "Registered", value: "registered" },
      { label: "Guest", value: "guest" },
    ],
  },
  {
    key: "has_orders",
    label: "Has orders",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  { type: "number-range" as const, key: "spend", label: "Total spend" },
  { type: "date-range" as const, key: "last_purchase", label: "Last purchase date" },
  { type: "date-range" as const, key: "member_since", label: "Member since" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileCustomerCard = ({
  customer,
  onView,
}: {
  customer: CustomerDetail
  onView: () => void
}) => {
  const cfg = customerStatusConfig[customer.status]
  return (
    <button
      onClick={onView}
      className="flex w-full items-start justify-between rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <span className="font-jakarta text-primary text-sm font-bold">
            {getInitials(customer.customer_name)}
          </span>
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{customer.customer_name}</p>
          <p className="font-jakarta text-brand/50 text-xs">{customer.email}</p>
          <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
            {customer.order_count} orders · {formatCustomerPrice(customer.total_spend)}
          </p>
        </div>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
