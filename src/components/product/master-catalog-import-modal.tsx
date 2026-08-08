import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Search, X, Package, ArrowLeft, CheckCircle2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Pagination from "@/components/ui/pagination"
import FormInput from "@/components/ui/form-input"
import LocationSearchInput from "@/components/ui/location-search-input"
import CategorySearchInput from "@/components/ui/category-search-input"
import { useSearchMasterCatalog, useGetMasterCatalogById } from "@/store/queries/products"
import { useImportFromMasterCatalog } from "@/store/mutations/products"
import { showAlert } from "@/store/alerts"
import {
  masterCatalogImportSchema,
  type MasterCatalogImportFormValues,
} from "@/validations/products"
import { validateField, cn } from "@/lib/utils"
import { WithTooltip } from "@/components/ui/tooltip"
import { useDebounce } from "@/hooks/useDebounce"
import type { MasterCatalogProduct } from "@/types/products"
import Dropdown from "../ui/dropdown"

// ── Types ──────────────────────────────────────────────────────────────────────

interface MasterCatalogImportModalProps {
  isOpen: boolean
  onClose: () => void
  /** When provided, "Use product" prefills the add-product form instead of importing */
  onPrefill?: (product: MasterCatalogProduct) => void
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function MasterCatalogImportModal({
  isOpen,
  onClose,
  onPrefill,
}: MasterCatalogImportModalProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Record<number, MasterCatalogProduct>>({})
  const [showImportConfig, setShowImportConfig] = useState(false)

  const debouncedSearch = useDebounce(search)
  const isPrefillMode = !!onPrefill

  const {
    data: catalogData,
    isLoading,
    isFetching,
  } = useSearchMasterCatalog({
    search: debouncedSearch || undefined,
    pageSize: 20,
    currentPage: page,
  })

  const products = catalogData?.items ?? []
  const totalCount = catalogData?.total_count ?? 0
  const totalPages = catalogData?.total_pages ?? 1
  const selectedList = Object.values(selected)
  const selectedCount = selectedList.length

  const toggleSelect = (product: MasterCatalogProduct) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[product.id]) delete next[product.id]
      else next[product.id] = product
      return next
    })
  }

  const removeFromSelection = (id: number) => {
    setSelected((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleClose = () => {
    setSearch("")
    setPage(1)
    setDetailId(null)
    setSelected({})
    setShowImportConfig(false)
    onClose()
  }

  const customHeader = (
    <div className="border-brand/3 flex items-center justify-between border-b px-6 py-4">
      <div>
        <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
          {isPrefillMode ? "Import from catalog" : "Master Catalog"}
        </h2>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          {totalCount > 0 ? `${totalCount.toLocaleString()} products found` : "Search the catalog"}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )

  const customFooter =
    !isPrefillMode && selectedCount > 0 ? (
      <div className="border-borderSubtle border-t px-6 py-4">
        <Button variant="secondary" className="w-full" onClick={() => setShowImportConfig(true)}>
          Import {selectedCount} product{selectedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    ) : undefined

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        variant="dialog"
        width="800px"
        customHeader={customHeader}
        customFooter={customFooter}
      >
        <div className="flex flex-col gap-4 p-6">
          {/* Search */}
          <div className="border-borderSubtle flex h-10 items-center gap-2 rounded-lg border bg-white px-3">
            <Search size={14} className="text-brand/40 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by product name, brand, or SKU…"
              className="font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-sm focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Selected tray — persists across searches */}
          {!isPrefillMode && selectedCount > 0 && (
            <div className="bg-primary/5 border-primary/15 rounded-xl border p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="font-jakarta text-primary text-xs font-semibold">
                  {selectedCount} selected
                </p>
                <button
                  type="button"
                  onClick={() => setSelected({})}
                  className="font-jakarta text-brand/40 hover:text-danger text-xs transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {selectedList.map((p) => (
                  <div
                    key={p.id}
                    className="border-primary/15 flex w-48 shrink-0 items-center gap-2.5 rounded-lg border bg-white p-2.5"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="border-brand/8 h-9 w-9 shrink-0 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="border-brand/8 bg-brand/5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border">
                        <Package size={13} className="text-brand/30" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <WithTooltip
                        trigger={
                          <p className="font-jakarta text-brand line-clamp-1 text-xs font-semibold">
                            {p.name}
                          </p>
                        }
                        content={p.name}
                      />
                      <p className="font-jakarta text-brand/50 mt-0.5 truncate text-xs">
                        {p.brandName ?? p.brand ?? "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromSelection(p.id)}
                      className="text-brand/30 hover:text-danger shrink-0 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {isLoading || isFetching ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="border-line flex items-center gap-3 rounded-xl border bg-white p-3.5"
                >
                  <div className="bg-brand/8 h-11 w-11 shrink-0 animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-brand/8 h-3.5 w-2/3 animate-pulse rounded-full" />
                    <div className="bg-brand/5 h-3 w-1/3 animate-pulse rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Package size={32} className="text-brand/20" />
              <p className="font-jakarta text-brand/50 text-sm">
                {debouncedSearch
                  ? `No products found for "${debouncedSearch}"`
                  : "Start searching the catalog"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((product) => (
                <CatalogProductRow
                  key={product.id}
                  product={product}
                  isPrefillMode={isPrefillMode}
                  isSelected={!!selected[product.id]}
                  onToggleSelect={toggleSelect}
                  onViewDetail={() => setDetailId(product.id)}
                />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      </Modal>

      {/* Detail modal — single product view + single import */}
      <CatalogDetailModal
        productId={detailId}
        onClose={() => setDetailId(null)}
        onPrefill={
          onPrefill
            ? (p) => {
                onPrefill(p)
                handleClose()
              }
            : undefined
        }
        onImportSuccess={() => {
          setDetailId(null)
          handleClose()
        }}
      />

      {/* Bulk import config modal */}
      {!isPrefillMode && (
        <BulkImportConfigModal
          products={selectedList}
          isOpen={showImportConfig}
          onClose={() => setShowImportConfig(false)}
          onSuccess={() => {
            setShowImportConfig(false)
            handleClose()
          }}
        />
      )}
    </>
  )
}

// ── Product row ────────────────────────────────────────────────────────────────

const CatalogProductRow = ({
  product,
  isPrefillMode,
  isSelected,
  onToggleSelect,
  onViewDetail,
}: {
  product: MasterCatalogProduct
  isPrefillMode: boolean
  isSelected: boolean
  onToggleSelect: (p: MasterCatalogProduct) => void
  onViewDetail: () => void
}) => (
  <div
    className={cn(
      "border-line hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3.5 transition-colors",
      isSelected && "border-primary/30 bg-primary/5",
      product.alreadyInInventory && "opacity-60",
    )}
    onClick={onViewDetail}
  >
    {/* Checkbox — import mode only */}
    {!isPrefillMode && (
      <div
        onClick={(e) => {
          e.stopPropagation()
          onToggleSelect(product)
        }}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          isSelected ? "border-primary bg-primary text-white" : "border-input",
        )}
      >
        {isSelected && (
          <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
            <path
              d="M1 4l2.5 2.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    )}

    {/* Image */}
    {product.imageUrl ? (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="border-brand/8 h-11 w-11 shrink-0 rounded-lg border object-cover"
      />
    ) : (
      <div className="border-brand/8 bg-brand/5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border">
        <Package size={16} className="text-brand/30" />
      </div>
    )}

    {/* Info */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{product.name}</p>
        {product.alreadyInInventory && (
          <span className="font-jakarta text-statusSuccess bg-statusSuccessBg border-statusSuccessBorder flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 size={10} />
            In inventory
          </span>
        )}
      </div>
      <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
        {[product.brandName, product.category, product.sizeVolume].filter(Boolean).join(" · ")}
      </p>
    </div>

    <p className="font-jakarta text-brand/30 shrink-0 text-xs">View →</p>
  </div>
)

// ── Detail modal — single product view + single import ─────────────────────────

interface CatalogDetailModalProps {
  productId: number | null
  onClose: () => void
  onPrefill?: (product: MasterCatalogProduct) => void
  onImportSuccess: () => void
}

function CatalogDetailModal({
  productId,
  onClose,
  onPrefill,
  onImportSuccess,
}: CatalogDetailModalProps) {
  const { data: product, isLoading } = useGetMasterCatalogById(productId)
  const importMutation = useImportFromMasterCatalog()
  const isPrefillMode = !!onPrefill

  const form = useForm({
    defaultValues: {
      price: "",
      stockQty: "",
      location: [] as string[],
      category: [] as string[],
      sku: "",
      lowStockAlert: "0",
      discount: "0",
      status: "active",
    } satisfies MasterCatalogImportFormValues,
    onSubmit: ({ value }) => {
      if (!product) return
      const allLocations = value.location.includes("0")
      const allCategories = value.category.includes("0")
      importMutation.mutate(
        {
          masterProductId: product.id,
          price: parseFloat(value.price),
          stockQty: parseInt(value.stockQty),
          locationIds: allLocations ? [] : value.location.map(Number),
          categoryIds: allCategories ? [] : value.category.map(Number),
          allLocations: allLocations || undefined,
          allCategories: allCategories || undefined,
          sku: value.sku || undefined,
          lowStockAlert: value.lowStockAlert ? parseInt(value.lowStockAlert) : undefined,
          discount: value.discount ? parseFloat(value.discount) : undefined,
          status: value.status,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Product imported successfully" })
            onImportSuccess()
          },
          onError: (err) => showAlert({ variant: "error", message: err.message }),
        },
      )
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const customHeader = (
    <div className="border-brand/3 flex items-center gap-3 border-b px-6 py-4">
      <button
        onClick={handleClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <ArrowLeft size={16} />
      </button>
      <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
        {isPrefillMode ? "Product details" : "Import product"}
      </h2>
    </div>
  )

  const customFooter = isPrefillMode ? (
    <div className="border-borderSubtle flex gap-3 border-t px-6 py-4">
      <Button variant="outline" className="flex-1" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        disabled={!product || isLoading}
        onClick={() => {
          if (product) onPrefill!(product)
        }}
      >
        Use this product
      </Button>
    </div>
  ) : (
    <div className="border-borderSubtle flex gap-3 border-t px-6 py-4">
      <Button
        variant="outline"
        className="flex-1"
        disabled={importMutation.isPending}
        onClick={handleClose}
      >
        Cancel
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        loading={importMutation.isPending}
        onClick={() => form.handleSubmit()}
      >
        Import product
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={productId != null}
      onClose={handleClose}
      variant="dialog"
      width="600px"
      customHeader={customHeader}
      customFooter={customFooter}
      preventClose={importMutation.isPending}
    >
      {isLoading || !product ? (
        <div className="flex flex-col gap-5 p-6">
          {/* Image strip skeleton */}
          <div className="flex gap-2">
            <div className="bg-brand/8 h-40 w-40 shrink-0 animate-pulse rounded-xl" />
            <div className="bg-brand/5 h-40 w-40 shrink-0 animate-pulse rounded-xl" />
          </div>
          {/* Name + meta skeleton */}
          <div className="space-y-2">
            <div className="bg-brand/8 h-4 w-3/5 animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-2/5 animate-pulse rounded-full" />
          </div>
          {/* Description skeleton */}
          <div className="space-y-1.5">
            <div className="bg-brand/8 h-3 w-16 animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-full animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-4/5 animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-2/3 animate-pulse rounded-full" />
          </div>
          {/* Ingredients skeleton */}
          <div className="space-y-1.5">
            <div className="bg-brand/8 h-3 w-20 animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-full animate-pulse rounded-full" />
            <div className="bg-brand/5 h-3 w-1/2 animate-pulse rounded-full" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6">
          <ProductInfoBlock product={product} />

          {!isPrefillMode && (
            <>
              <div className="border-brand/6 border-t" />
              <p className="font-jakarta text-brand text-sm font-semibold">Store configuration</p>
              <ImportConfigFields form={form} />
            </>
          )}
        </div>
      )}
    </Modal>
  )
}

// ── Bulk import config modal ───────────────────────────────────────────────────

interface BulkImportConfigModalProps {
  products: MasterCatalogProduct[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function BulkImportConfigModal({
  products,
  isOpen,
  onClose,
  onSuccess,
}: BulkImportConfigModalProps) {
  const importMutation = useImportFromMasterCatalog()
  const [isImporting, setIsImporting] = useState(false)

  const form = useForm({
    defaultValues: {
      price: "",
      stockQty: "",
      location: [] as string[],
      category: [] as string[],
      sku: "",
      lowStockAlert: "0",
      discount: "0",
      status: "active",
    } satisfies MasterCatalogImportFormValues,
    onSubmit: async ({ value }) => {
      setIsImporting(true)
      const allLocations = value.location.includes("0")
      const allCategories = value.category.includes("0")
      try {
        await Promise.all(
          products.map((p) =>
            importMutation.mutateAsync({
              masterProductId: p.id,
              price: parseFloat(value.price),
              stockQty: parseInt(value.stockQty),
              locationIds: allLocations ? [] : value.location.map(Number),
              categoryIds: allCategories ? [] : value.category.map(Number),
              allLocations: allLocations || undefined,
              allCategories: allCategories || undefined,
              sku: value.sku || undefined,
              lowStockAlert: value.lowStockAlert ? parseInt(value.lowStockAlert) : undefined,
              discount: value.discount ? parseFloat(value.discount) : undefined,
              status: value.status,
            }),
          ),
        )
        showAlert({
          variant: "success",
          message: `${products.length} product${products.length !== 1 ? "s" : ""} imported successfully`,
        })
        onSuccess()
      } catch (err: unknown) {
        showAlert({
          variant: "error",
          message: err instanceof Error ? err.message : "Import failed",
        })
      } finally {
        setIsImporting(false)
      }
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const customHeader = (
    <div className="border-brand/3 flex items-center gap-3 border-b px-6 py-4">
      <button
        onClick={handleClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <ArrowLeft size={16} />
      </button>
      <div>
        <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
          Import {products.length} product{products.length !== 1 ? "s" : ""}
        </h2>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          These settings will apply to all selected products
        </p>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle flex gap-3 border-t px-6 py-4">
      <Button variant="outline" className="flex-1" disabled={isImporting} onClick={handleClose}>
        Cancel
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        loading={isImporting}
        onClick={() => form.handleSubmit()}
      >
        Import {products.length} product{products.length !== 1 ? "s" : ""}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="dialog"
      width="560px"
      customHeader={customHeader}
      customFooter={customFooter}
      preventClose={isImporting}
    >
      <div className="flex flex-col gap-4 p-6">
        <ImportConfigFields form={form} />
      </div>
    </Modal>
  )
}

// ── Shared import config fields ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImportConfigFields({ form }: { form: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="price"
          validators={{
            onBlur: ({ value }: { value: string }) =>
              validateField(masterCatalogImportSchema, "price", value),
          }}
        >
          {(field: any) => (
            <FormInput
              label="Price (₦)"
              placeholder="0.00"
              type="number"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
              required
            />
          )}
        </form.Field>

        <form.Field name="sku">
          {(field: any) => (
            <FormInput
              label="SKU"
              placeholder="Auto-generated if blank"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="stockQty"
          validators={{
            onBlur: ({ value }: { value: string }) =>
              validateField(masterCatalogImportSchema, "stockQty", value),
          }}
        >
          {(field: any) => (
            <FormInput
              label="Stock quantity"
              placeholder="0"
              type="number"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
              required
            />
          )}
        </form.Field>

        <form.Field name="lowStockAlert">
          {(field: any) => (
            <FormInput
              label="Low stock alert"
              placeholder="0"
              type="number"
              value={field.state.value ?? 0}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="discount">
          {(field: any) => (
            <FormInput
              label="Discount (%)"
              placeholder="0"
              type="number"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Field
          name="status"
          validators={{
            onChange: ({ value }: { value: string }) =>
              validateField(masterCatalogImportSchema, "status", value),
          }}
        >
          {(field: any) => (
            <Dropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errors[0]?.toString()}
              required
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="category"
        validators={{
          onChange: ({ value }: { value: string[] }) =>
            validateField(masterCatalogImportSchema, "category", value),
        }}
      >
        {(field: any) => (
          <CategorySearchInput
            multiple
            showAllOption
            label="Category"
            placeholder="Search categories…"
            value={field.state.value}
            onChange={field.handleChange}
            error={field.state.meta.errors[0]?.toString()}
            required
          />
        )}
      </form.Field>

      <form.Field
        name="location"
        validators={{
          onChange: ({ value }: { value: string[] }) =>
            validateField(masterCatalogImportSchema, "location", value),
        }}
      >
        {(field: any) => (
          <LocationSearchInput
            multiple
            showAllOption
            label="Location"
            placeholder="Search locations…"
            value={field.state.value}
            onChange={field.handleChange}
            error={field.state.meta.errors[0]?.toString()}
            required
          />
        )}
      </form.Field>
    </>
  )
}

// ── Product info block ─────────────────────────────────────────────────────────

const ProductInfoBlock = ({ product }: { product: MasterCatalogProduct }) => (
  <div className="flex flex-col gap-4">
    {product.imageUrl && (
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="border-brand/8 h-40 w-40 shrink-0 rounded-xl border object-cover"
        />
        {product.galleryImages?.slice(0, 3).map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`${product.name} ${i + 2}`}
            className="border-brand/8 h-40 w-40 shrink-0 rounded-xl border object-cover"
          />
        ))}
      </div>
    )}

    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-brand leading-snug font-semibold">{product.name}</h3>
        {product.alreadyInInventory && (
          <span className="font-jakarta text-statusSuccess bg-statusSuccessBg border-statusSuccessBorder flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 size={10} />
            In inventory
          </span>
        )}
      </div>
      <p className="font-jakarta text-brand/50 mt-1 text-sm">
        {[product.brandName, product.category, product.sizeVolume].filter(Boolean).join(" · ")}
      </p>
    </div>

    <div className="flex flex-col gap-3">
      {product.description && <DetailField label="Description" value={product.description} />}
      {(product.ingredients?.length ?? 0) > 0 && (
        <DetailField label="Ingredients" value={product.ingredients!.join(", ")} />
      )}
      {product.howToUse && <DetailField label="How to use" value={product.howToUse} />}
      {product.weight != null && <DetailField label="Weight" value={`${product.weight}g`} />}
    </div>
  </div>
)

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="font-jakarta text-brand text-xs font-semibold">{label}</p>
    <p className="font-jakarta text-brand/60 mt-1 text-sm leading-[160%]">{value}</p>
  </div>
)

// ── Data ───────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
]
