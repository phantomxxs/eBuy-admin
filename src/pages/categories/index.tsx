import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Plus } from "lucide-react"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import AddCategoryModal from "@/components/category/add-category-modal"
import EditCategoryModal from "@/components/category/edit-category-modal"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { makeCategoryColumns, categoryStatusConfig } from "@/components/table-columns/categories"
import { useGetCategories, useGetCategoryMetrics } from "@/store/queries/categories"
import { useExportCategoriesCSV, useUpdateCategoryStatus } from "@/store/mutations/categories"
import type { Category } from "@/types/categories"
import PageSkeleton from "@/components/shared/page-skeleton"

export default function CategoriesPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetCategoryMetrics()
  const { data: categoriesData, isLoading: isLoadingCategoriesData } = useGetCategories({
    search: debouncedSearch,
    pageSize,
    currentPage: page,
    status: filters.status?.join(",") || undefined,
    date_from: filters.date_from?.[0],
    date_to: filters.date_to?.[0],
  })
  const exportCSV = useExportCategoriesCSV()
  const categories = categoriesData?.items ?? []
  const totalCount = categoriesData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const updateCategoryStatusMutation = useUpdateCategoryStatus()

  if (isLoading) return <PageSkeleton metricCount={2} />

  const columns = makeCategoryColumns(
    (cat) => {
      setSelectedCategory(cat)
      setShowEditModal(true)
    },
    (cat) => setDeactivateTarget(cat),
  )
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Categories
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage product categories
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowAddModal(true)}
        >
          Add category
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "Total categories", value: metrics.total_categories ?? 0 },
              { label: "Active categories", value: metrics.active_categories ?? 0 },
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
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Search categories"
          exportProps={{
            currentData: categories,
            filename: "categories",
            onExportAll: () => exportCSV.mutate(),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={categories}
            getRowId={(row) => String(row.category_id)}
            isLoading={isLoadingCategoriesData}
            pagination={{
              page,
              pageSize,
              total: totalCount,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "categories",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {categories.map((category) => (
            <MobileCategoryCard
              key={category.category_id}
              category={category}
              onEdit={() => {
                setSelectedCategory(category)
                setShowEditModal(true)
              }}
              onDeactivate={() => setDeactivateTarget(category)}
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

      <AddCategoryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
      />
      <DeleteConfirmModal
        isOpen={!!deactivateTarget}
        variant={deactivateTarget?.status === "active" ? "deactivate" : "reactivate"}
        entityType="category"
        entityName={deactivateTarget?.name}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (deactivateTarget) {
            const newStatus = deactivateTarget.status === "active" ? "inactive" : "active"
            updateCategoryStatusMutation.mutate({
              id: String(deactivateTarget.category_id),
              status: newStatus,
            })
          }
          setDeactivateTarget(null)
        }}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter categories"
        fields={CATEGORY_FILTERS}
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

const CATEGORY_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  { type: "date-range" as const, key: "date", label: "Date created" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileCategoryCard = ({
  category,
  onEdit,
  onDeactivate,
}: {
  category: Category
  onEdit: () => void
  onDeactivate: () => void
}) => {
  const cfg = categoryStatusConfig[category.status]
  return (
    <div className="border-line flex items-center justify-between rounded-lg bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{category.name}</p>
          <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
            {category.product_count} products · {formatDateToCustomFormat(category.created_at)}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge label={cfg.label} variant={cfg.variant} dot />
        <div className="flex items-center gap-3">
          <button onClick={onEdit} className="font-jakarta text-secondary text-xs font-semibold">
            Edit
          </button>
          <button
            onClick={onDeactivate}
            className={cn(
              "font-jakarta text-xs font-semibold",
              category.status === "active" ? "text-brand/60" : "text-statusSuccess",
            )}
          >
            {category.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  )
}
