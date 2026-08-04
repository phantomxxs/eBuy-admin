import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import {
  makeLocationColumns,
  locationStatusConfig,
  EnabledPill,
} from "@/components/table-columns/locations"
import { useGetLocations, useGetLocationMetrics } from "@/store/queries/locations"
import { useExportLocationsCSV, useDeleteLocation } from "@/store/mutations/locations"
import { showAlert } from "@/store/alerts"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import CreateLocationModal from "@/components/location/create-location-modal"
import LocationDetailModal from "@/components/location/location-detail-modal"
import EditLocationModal from "@/components/location/edit-location-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import type { Location } from "@/types/locations"

export default function LocationsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)
  const [editTarget, setEditTarget] = useState<Location | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetLocationMetrics()
  const { data: locationsData, isLoading: isLoadingLocations } = useGetLocations({
    search: debouncedSearch,
    pageSize,
    currentPage: page,
  })
  const exportCSV = useExportLocationsCSV()
  const deleteLocation = useDeleteLocation()

  const rawLocations = locationsData?.items ?? []
  const locations = filters.services?.length
    ? rawLocations.filter(
        (l) =>
          (filters.services!.includes("Pickup") && l.pickupEnabled) ||
          (filters.services!.includes("Walk-in") && l.walkInEnabled),
      )
    : rawLocations
  const totalCount = locationsData?.total_count ?? 0
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const columns = useMemo(
    () =>
      makeLocationColumns(
        (loc) => setEditTarget(loc),
        (loc) => setDeleteTarget(loc),
      ),
    [],
  )

  if (isLoading) return <PageSkeleton metricCount={3} />

  const openDetail = (location: Location) => {
    setSelectedLocation(location)
    setShowDetail(true)
  }

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Locations
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage your store locations
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
        >
          Add location
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "Total locations", value: metrics.total },
              { label: "Active", value: metrics.active },
              { label: "Inactive", value: metrics.inactive },
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
          placeholder="Search locations"
          exportProps={{
            currentData: locations,
            filename: "locations",
            onExportAll: () => exportCSV.mutate(),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table — row click opens detail */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={locations}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            isLoading={isLoadingLocations}
            pagination={{
              page,
              pageSize,
              total: totalCount,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "locations",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 py-2 lg:hidden">
          {locations.map((location) => (
            <MobileLocationCard
              key={location.id}
              location={location}
              onView={() => openDetail(location)}
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

      <CreateLocationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <LocationDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        location={selectedLocation}
      />
      <EditLocationModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        location={editTarget}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteLocation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            onError: (e) => showAlert({ variant: "error", message: e.message }),
          })
        }}
        isLoading={deleteLocation.isPending}
        entityType="location"
        entityName={deleteTarget?.name}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter locations"
        fields={LOCATION_FILTERS}
        values={filters}
        onApply={setFilters}
      />
    </div>
  )
}

// ── Filter config ───────────────────────────────────────────────────────────────

const LOCATION_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    key: "services",
    label: "Services",
    options: [
      { label: "Pickup", value: "Pickup" },
      { label: "Walk-in", value: "Walk-in" },
    ],
  },
  {
    key: "is_website",
    label: "Website orders",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileLocationCard = ({ location, onView }: { location: Location; onView: () => void }) => {
  const cfg = locationStatusConfig[location.status]
  return (
    <button
      onClick={onView}
      className="border-line flex w-full items-start justify-between rounded-lg bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <MapPin size={16} className="text-primary" />
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{location.name}</p>
          <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{location.storeId}</p>
          <p className="font-jakarta text-brand/50 mt-0.5 line-clamp-1 text-xs">
            {location.address}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <EnabledPill enabled={location.pickupEnabled} label="Pickup" />
            <EnabledPill enabled={location.walkInEnabled} label="Walk-in" />
          </div>
        </div>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
