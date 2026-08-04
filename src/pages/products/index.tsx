import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useDebounce } from "@/hooks/useDebounce"
import { showAlert } from "@/store/alerts"
import { Plus, List, BookOpen } from "lucide-react"
import ProductDetailSheet from "@/components/product/product-detail"
import AddProductModal from "@/components/product/add-product-modal"
import MasterCatalogImportModal from "@/components/product/master-catalog-import-modal"
import EditProductModal from "@/components/product/edit-product-modal"
import BulkUploadModal from "@/components/product/bulk-upload-modal"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues, type FilterField } from "@/components/shared/filter-modal"
import { makeProductColumns } from "@/components/table-columns/products"
import { useGetProductMetrics, useGetProducts } from "@/store/queries/products"
import {
  useDeleteProduct,
  useUpdateProductStatus,
  useExportProductsCSV,
} from "@/store/mutations/products"
import type { Product } from "@/types/products"
import PageSkeleton from "@/components/shared/page-skeleton"
import { ROUTES } from "@/lib/routes"
import { formatPrice } from "@/utils/shared"
import { formatDateToCustomFormat } from "@/lib/utils"

export default function ProductsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCatalogImport, setShowCatalogImport] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null)
  const [draftTarget, setDraftTarget] = useState<Product | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading: isLoadingMetrics } = useGetProductMetrics()
  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts({
    currentPage: page,
    pageSize,
    search: debouncedSearch,
    status: filters.status?.join(",") || undefined,
    category: filters.category_id?.join(",") || undefined,
    locationId: filters.location_id?.join(",") || undefined,
    skinType: filters.skin_type?.join(",") || undefined,
    stockStatus: filters.stock_status?.join(",") || undefined,
    priceMin: filters.price_min?.[0] ? Number(filters.price_min[0]) : undefined,
    priceMax: filters.price_max?.[0] ? Number(filters.price_max[0]) : undefined,
    dateFrom: filters.date_from?.[0],
    dateTo: filters.date_to?.[0],
  })
  const deleteProductMutation = useDeleteProduct()
  const updateProductStatusMutation = useUpdateProductStatus()
  const exportCSV = useExportProductsCSV()

  const products = productsData?.items ?? []
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)
  const totalCount = productsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  if (isLoadingMetrics || isLoadingProducts) return <PageSkeleton metricCount={5} />

  const columns = makeProductColumns(
    (p) => {
      setSelectedProduct(p)
      setShowEditModal(true)
    },
    (p) => setArchiveTarget(p),
    (p) =>
      updateProductStatusMutation.mutate(
        { id: p.id, status: "active" },
        {
          onError: () =>
            showAlert({
              variant: "error",
              message: "Failed to activate product. Please try again.",
            }),
        },
      ),
  )

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Products
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage your catalog
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="subtle"
            className="flex-1"
            beforeIcon={<List size={14} />}
            onClick={() => navigate({ to: ROUTES.productsBulkUpload })}
          >
            Import jobs
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            beforeIcon={<BookOpen size={14} />}
            onClick={() => setShowCatalogImport(true)}
          >
            Import from catalog
          </Button>
          {/* <Button
            variant="subtle"
            className="flex-1"
            beforeIcon={<Upload size={14} />}
            onClick={() => setShowBulkUpload(true)}
          >
            Bulk upload
          </Button> */}
          <Button
            variant="secondary"
            className="flex-1"
            beforeIcon={<Plus size={14} />}
            onClick={() => setShowAddModal(true)}
          >
            Add product
          </Button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-6 lg:p-6">
          {(
            [
              { label: "Total products", value: metrics.total },
              { label: "Active products", value: metrics.active },
              { label: "Inactive products", value: metrics.inactive },
              { label: "Draft products", value: metrics.draft },
              { label: "Archived products", value: metrics.archived },
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
          placeholder="Search products"
          exportProps={{
            currentData: products.map((p) => ({
              Name: p.name,
              SKU: p.sku,
              Category: p.categoryNames.length ? p.categoryNames.join(", ") : p.category,
              Price: formatPrice(p.price),
              Stock: p.stock,
              Status: p.status,
              "Created on": formatDateToCustomFormat(p.createdAt),
            })),
            filename: "products",
            onExportAll: () => exportCSV.mutate(),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={products}
            getRowId={(row) => row.id}
            onRowClick={(row) => setDetailProduct(row)}
            isLoading={isLoadingProducts}
            pagination={{
              page,
              pageSize,
              total: totalCount,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "products",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {products.map((product) => (
            <MobileProductCard
              key={product.id}
              product={product}
              onClick={() => setDetailProduct(product)}
            />
          ))}
        </div>

        {/* Footer */}
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

      <ProductDetailSheet
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(p) => {
          setDetailProduct(null)
          setSelectedProduct(p)
          setShowEditModal(true)
        }}
        onArchive={(p) => {
          setDetailProduct(null)
          setArchiveTarget(p)
        }}
        onActivate={(p) => {
          updateProductStatusMutation.mutate(
            { id: p.id, status: "active" },
            {
              onSuccess: () => setDetailProduct(null),
              onError: () =>
                showAlert({
                  variant: "error",
                  message: "Failed to activate product. Please try again.",
                }),
            },
          )
        }}
        isUpdatingStatus={updateProductStatusMutation.isPending}
        onSetDraft={(p) => {
          setDetailProduct(null)
          setDraftTarget(p)
        }}
      />
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onQueued={() => {
          setShowBulkUpload(false)
          navigate({ to: ROUTES.productsBulkUpload })
        }}
      />
      <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <MasterCatalogImportModal
        isOpen={showCatalogImport}
        onClose={() => setShowCatalogImport(false)}
      />
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        entityType="product"
        entityName={deleteTarget?.name ?? ""}
        isLoading={deleteProductMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget)
            deleteProductMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
        }}
      />
      <DeleteConfirmModal
        isOpen={!!archiveTarget}
        variant="archive"
        entityType="product"
        entityName={archiveTarget?.name}
        isLoading={updateProductStatusMutation.isPending}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget)
            updateProductStatusMutation.mutate(
              { id: archiveTarget.id, status: "archived" },
              {
                onSuccess: () => setArchiveTarget(null),
                onError: () =>
                  showAlert({
                    variant: "error",
                    message: "Failed to archive product. Please try again.",
                  }),
              },
            )
        }}
      />
      <DeleteConfirmModal
        isOpen={!!draftTarget}
        variant="deactivate"
        entityType="product"
        entityName={draftTarget?.name}
        isLoading={updateProductStatusMutation.isPending}
        onClose={() => setDraftTarget(null)}
        onConfirm={() => {
          if (draftTarget)
            updateProductStatusMutation.mutate(
              { id: draftTarget.id, status: "draft" },
              {
                onSuccess: () => setDraftTarget(null),
                onError: () =>
                  showAlert({
                    variant: "error",
                    message: "Failed to set product to draft. Please try again.",
                  }),
              },
            )
        }}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter products"
        fields={PRODUCT_FILTERS}
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

const PRODUCT_FILTERS: FilterField[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Draft", value: "draft" },
      { label: "Archived", value: "archived" },
    ],
  },
  { type: "category-search", key: "category_id", label: "Category" },
  { type: "skin-type-search", key: "skin_type", label: "Skin type" },
  { type: "location-search", key: "location_id", label: "Location" },
  {
    key: "stock_status",
    label: "Stock status",
    options: [
      { label: "In stock", value: "in_stock" },
      { label: "Low stock", value: "low_stock" },
      { label: "Out of stock", value: "out_of_stock" },
    ],
  },
  { type: "number-range", key: "price", label: "Price" },
  { type: "date-range", key: "date", label: "Date added" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const },
  inactive: { label: "Inactive", variant: "warning" as const },
  draft: { label: "Draft", variant: "neutral" as const },
  archived: { label: "Archived", variant: "default" as const },
}

const MobileProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => (
  <div
    className="border-line flex items-center justify-between rounded-lg border bg-white p-4"
    onClick={onClick}
  >
    <div className="flex-1 pr-4">
      <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{product.name}</p>
      <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
        {product.sku} · {product.category}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <p className="font-jakarta text-brand text-sm font-semibold">
          {formatPrice(product.price)}
        </p>
        <span className="font-jakarta text-brand/40 text-xs">·</span>
        <p className="font-jakarta text-brand/50 text-xs">{product.stock} in stock</p>
      </div>
    </div>
    <StatusBadge
      label={STATUS_CONFIG[product.status].label}
      variant={STATUS_CONFIG[product.status].variant}
      dot
    />
  </div>
)
