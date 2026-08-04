import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import { makeBannerColumns, formatImpressions } from "@/components/table-columns/banners"
import { useGetBanners, useGetBannerMetrics } from "@/store/queries/banners"
import { useDeleteBanner, useExportBannersCSV } from "@/store/mutations/banners"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import CreateBannerModal from "@/components/banner/create-banner-modal"
import EditBannerModal from "@/components/banner/edit-banner-modal"
import BannerDetailModal from "@/components/banner/banner-detail-modal"
import MobileBannerCard from "@/components/banner/mobile-banner-card"
import PageSkeleton from "@/components/shared/page-skeleton"
import type { Banner } from "@/types/banners"

export default function BannersPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetBannerMetrics()
  const { data: bannersData, isLoading: isLoadingBanners } = useGetBanners({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    status: filters.status?.join(",") || undefined,
    placement: filters.placement?.join(",") || undefined,
    date_from: filters.date_from?.[0],
    date_to: filters.date_to?.[0],
  })
  const deleteBanner = useDeleteBanner()
  const exportCSV = useExportBannersCSV()

  const items = bannersData?.items ?? []
  const total = bannersData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openDetail = (banner: Banner) => {
    setSelectedBanner(banner)
    setShowDetail(true)
  }

  const columns = useMemo(
    () =>
      makeBannerColumns(
        openDetail,
        (banner) => {
          setSelectedBanner(banner)
          setShowEdit(true)
        },
        (banner) => setDeleteTarget(banner),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (isLoading) return <PageSkeleton metricCount={5} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Banners
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage promotional banners
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
        >
          Create banner
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "Total banners", value: metrics.total },
              { label: "Active", value: metrics.active },
              { label: "Scheduled", value: metrics.scheduled },
              { label: "Expired", value: metrics.expired },
              { label: "Total impressions", value: formatImpressions(metrics.totalImpressions) },
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
          placeholder="Search banners"
          exportProps={{
            currentData: items,
            filename: "banners",
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
            isLoading={isLoadingBanners}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "banners",
            }}
          />
        </div>

        <div className="space-y-2 px-4 py-4 lg:hidden">
          {items.map((banner) => (
            <MobileBannerCard key={banner.id} banner={banner} onView={() => openDetail(banner)} />
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

      <CreateBannerModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <EditBannerModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        banner={selectedBanner}
      />
      <BannerDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        banner={selectedBanner}
        onEdit={(b) => {
          setSelectedBanner(b)
          setShowEdit(true)
        }}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteBanner.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        entityType="banner"
        entityName={deleteTarget?.title}
        isLoading={deleteBanner.isPending}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter banners"
        fields={BANNER_FILTERS}
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

const BANNER_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Expired", value: "expired" },
    ],
  },
  {
    key: "placement",
    label: "Placement",
    options: [
      { label: "Homepage", value: "homepage" },
      { label: "Category page", value: "category_page" },
      { label: "Product page", value: "product_page" },
      { label: "Checkout", value: "checkout" },
    ],
  },
  { type: "date-range" as const, key: "date", label: "Start date" },
]
