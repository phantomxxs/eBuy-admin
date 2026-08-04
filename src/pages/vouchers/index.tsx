import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import type { Voucher } from "@/types/vouchers"
import { useGetVoucherMetrics, useGetVouchers } from "@/store/queries/vouchers"
import { useDeleteVoucher, useToggleVoucherStatus } from "@/store/mutations/vouchers"
import { VOUCHER_STATUS_CONFIG, makeVoucherColumns } from "@/components/table-columns/vouchers"
import CreateVoucherModal from "@/components/vouchers/create-voucher-modal"
import VoucherDetailModal from "@/components/vouchers/voucher-detail-modal"

export default function VouchersPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetVoucherMetrics()
  const { data: vouchersData, isLoading: isLoadingVouchersData } = useGetVouchers({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    status: filters.status?.join(",") || undefined,
  })
  const deleteVoucher = useDeleteVoucher()
  const toggleStatus = useToggleVoucherStatus()

  const items = vouchersData?.items ?? []
  const total = vouchersData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openDetail = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setShowDetail(true)
  }

  const columns = useMemo(
    () =>
      makeVoucherColumns(
        (voucher) => {
          setSelectedVoucher(voucher)
          setShowDetail(true)
        },
        (voucher) => {
          setSelectedVoucher(voucher)
          setShowDetail(true)
        },
        (voucher) => {
          const newStatus = voucher.status === "active" ? "inactive" : "active"
          toggleStatus.mutate({ id: voucher.id, status: newStatus })
        },
        (voucher) => setDeleteTarget(voucher),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Vouchers
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Create and manage voucher codes for your customers
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
        >
          Create voucher
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-4 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-4 lg:p-6">
          {(
            [
              { label: "Total vouchers", value: metrics.total },
              { label: "Active", value: metrics.active },
              { label: "Expired", value: metrics.expired },
              {
                label: "Total discounts applied",
                value: `₦${metrics.totalDiscountApplied.toLocaleString()}`,
              },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        <TableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Search vouchers"
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={Object.values(filters).reduce((s, v) => s + v.length, 0)}
        />

        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            isLoading={isLoadingVouchersData}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "vouchers",
            }}
          />
        </div>

        <div className="space-y-2 px-4 py-4 lg:hidden">
          {items.map((voucher) => (
            <MobileVoucherCard
              key={voucher.id}
              voucher={voucher}
              onView={() => openDetail(voucher)}
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

      <CreateVoucherModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <VoucherDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        voucher={selectedVoucher}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVoucher.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        entityType="voucher"
        entityName={deleteTarget?.code}
        isLoading={deleteVoucher.isPending}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter vouchers"
        fields={VOUCHER_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
    </div>
  )
}

// ── Filter config ──────────────────────────────────────────────────────────────

const VOUCHER_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Expired", value: "expired" },
      { label: "Exhausted", value: "exhausted" },
    ],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileVoucherCard = ({ voucher, onView }: { voucher: Voucher; onView: () => void }) => {
  const cfg = VOUCHER_STATUS_CONFIG[voucher.status] ?? {
    label: voucher.status,
    variant: "default" as const,
  }
  const discountLabel =
    voucher.discountType === "percentage"
      ? `${voucher.discountValue}%`
      : `₦${voucher.discountValue.toLocaleString()}`

  return (
    <button
      onClick={onView}
      className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex-1 pr-4">
        <p className="text-brand font-mono text-sm font-bold tracking-widest">{voucher.code}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="bg-brand/5 font-jakarta text-brand/70 rounded-md px-2 py-0.5 text-xs font-medium capitalize">
            {voucher.discountType === "percentage" ? "Percentage" : "Fixed"}
          </span>
          <span className="font-jakarta text-secondary text-xs font-semibold">{discountLabel}</span>
        </div>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          {voucher.usageCount.toLocaleString()} / {voucher.maxUsage.toLocaleString()} uses
        </p>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
