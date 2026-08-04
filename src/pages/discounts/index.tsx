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
import type { Discount } from "@/types/discounts"
import { useGetDiscountMetrics, useGetDiscounts } from "@/store/queries/discounts"
import {
  useChangeDiscountStatus,
  useDeleteDiscount,
  useExportDiscountsCSV,
} from "@/store/mutations/discounts"
import { discountStatusConfig, makeDiscountColumns } from "@/components/table-columns/discounts"
import CreateDiscountModal from "@/components/discounts/create-discount-modal"
import DiscountDetailModal from "@/components/discounts/discount-detail-modal"

export default function DiscountsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetDiscountMetrics()
  const { data: discountsData, isLoading: isLoadingDiscountData } = useGetDiscounts({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    status: filters.status?.join(",") || undefined,
    type: filters.type?.join(",") || undefined,
    applies_to: filters.applies_to?.join(",") || undefined,
    valid_from: filters.valid_from?.[0],
    valid_to: filters.valid_to?.[0],
  })
  const deleteDiscount = useDeleteDiscount()
  const changeStatus = useChangeDiscountStatus()
  const exportCSV = useExportDiscountsCSV()

  const items = discountsData?.items ?? []
  const total = discountsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openDetail = (discount: Discount) => {
    setSelectedDiscount(discount)
    setShowDetail(true)
  }

  const columns = useMemo(
    () =>
      makeDiscountColumns(
        (discount) => {
          setSelectedDiscount(discount)
          setShowDetail(true)
        },
        (discount) => changeStatus.mutate({ id: discount.id, payload: { status: "draft" } }),
        (discount) => changeStatus.mutate({ id: discount.id, payload: { status: "active" } }),
        (discount) => setDeleteTarget(discount),
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
            Discounts
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Create and manage discountal campaigns
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
        >
          Create discount
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "Total discounts", value: metrics.total },
              { label: "Active", value: metrics.active },
              { label: "Scheduled", value: metrics.scheduled },
              { label: "Expired", value: metrics.expired },
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
          placeholder="Search discounts"
          exportProps={{
            currentData: items,
            filename: "discounts",
            onExportAll: () => exportCSV.mutate(),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={Object.values(filters).reduce((s, v) => s + v.length, 0)}
        />

        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            isLoading={isLoadingDiscountData}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "discounts",
            }}
          />
        </div>

        <div className="space-y-2 px-4 py-4 lg:hidden">
          {items.map((discount) => (
            <MobilePromoCard
              key={discount.id}
              discount={discount}
              onView={() => openDetail(discount)}
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

      <CreateDiscountModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <DiscountDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        discount={selectedDiscount}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteDiscount.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        entityType="discount"
        entityName={deleteTarget?.name}
        isLoading={deleteDiscount.isPending}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter discounts"
        fields={DISCOUNT_FILTERS}
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

const DISCOUNT_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Expired", value: "expired" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    key: "type",
    label: "Type",
    options: [
      { label: "Percentage", value: "percentage" },
      { label: "Fixed", value: "fixed" },
      // { label: "BOGO", value: "bogo" },
      // { label: "Free shipping", value: "free_shipping" },
    ],
  },
  {
    key: "applies_to",
    label: "Applies to",
    options: [
      { label: "All products", value: "all_products" },
      { label: "Category", value: "category" },
      { label: "Specific products", value: "specific_products" },
    ],
  },
  { type: "date-range" as const, key: "valid", label: "Validity window" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobilePromoCard = ({ discount, onView }: { discount: Discount; onView: () => void }) => {
  const cfg = discountStatusConfig[discount.status]
  return (
    <button
      onClick={onView}
      className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex-1 pr-4">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">
          {discount.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="bg-brand/5 font-jakarta text-brand/70 rounded-md px-2 py-0.5 text-xs font-medium">
            {discount.type}
          </span>
          <span className="font-jakarta text-secondary text-xs font-semibold">
            {discount.discount}
          </span>
        </div>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{discount.duration}</p>
        <p className="font-jakarta text-brand/50 text-xs">
          {discount.used.toLocaleString()} uses · {discount.appliesTo}
        </p>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
