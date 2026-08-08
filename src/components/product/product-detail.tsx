import { useState } from "react"
import { X, Archive, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import Modal from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { WithTooltip } from "@/components/ui/tooltip"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { useGetProductById, useGetProductActivityLogs } from "@/store/queries/products"
import { formatPrice } from "@/utils/shared"
import type { ProductLocation, Product, ProductStatus } from "@/types/products"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProductDetailSheetProps {
  product: Product | null
  onClose: () => void
  onEdit?: (product: Product) => void
  onArchive?: (product: Product) => void
  onActivate?: (product: Product) => void
  onSetDraft?: (product: Product) => void
  isUpdatingStatus?: boolean
}

type Tab = "about" | "ingredients" | "activity"

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "warning" },
  draft: { label: "Draft", variant: "neutral" },
  archived: { label: "Archived", variant: "default" },
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function ProductDetailSheet({
  product: productProp,
  onClose,
  onEdit,
  onArchive,
  onActivate,
  isUpdatingStatus = false,
}: ProductDetailSheetProps) {
  const [tab, setTab] = useState<Tab>("about")

  const { data: fetchedProduct, isError, isLoading } = useGetProductById(productProp?.id ?? null)
  const product = !isError && fetchedProduct ? fetchedProduct : productProp

  const customHeader = product ? (
    <div className="border-brand/3 flex items-start justify-between border-b px-4 py-4 md:px-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em] md:text-base">
          {product.name}
        </h2>
        <p className="font-jakarta text-brand/60 text-xs font-medium tracking-[-0.04em] md:text-sm">
          {product.sku}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  ) : null

  const isArchivedOrInactive =
    product?.status === "archived" || product?.status === "inactive" || product?.status === "draft"

  const customFooter = product ? (
    <div className="border-borderSubtle flex flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:gap-3 md:px-6">
      {isArchivedOrInactive ? (
        <Button
          variant="success"
          onClick={() => onActivate?.(product)}
          loading={isUpdatingStatus}
          disabled={isUpdatingStatus}
          className="flex-1"
        >
          Activate
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => onArchive?.(product)}
          disabled={isUpdatingStatus}
          beforeIcon={<Archive size={14} />}
          className="flex-1"
        >
          Archive
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => onEdit?.(product)}
        disabled={isUpdatingStatus}
        beforeIcon={<Pencil size={14} />}
        className="flex-1"
      >
        Edit product
      </Button>
    </div>
  ) : null

  return (
    <Modal
      isOpen={!!productProp}
      onClose={onClose}
      variant="drawer"
      position="right"
      width="640px"
      customHeader={customHeader}
      customFooter={customFooter}
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center justify-between border-t border-b py-3 [&+&]:border-t-0"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : product ? (
        <>
          {/* ── Tabs ── */}
          <div className="no-scrollbar border-blur flex overflow-x-auto border-b px-4 md:px-6">
            {(
              [
                { key: "about", label: "About", fullLabel: "About product" },
                { key: "ingredients", label: "Ingredients", fullLabel: "Ingredients & How to use" },
                { key: "activity", label: "Activity", fullLabel: "Activity log" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "font-jakarta flex h-11 shrink-0 items-center justify-center px-3 text-sm tracking-[-0.04em] transition-colors md:h-11.25 md:px-4",
                  tab === t.key
                    ? "border-secondary text-brand border-b-2 font-semibold"
                    : "text-brand/60 hover:text-brand font-medium",
                )}
              >
                <span className="md:hidden">{t.label}</span>
                <span className="hidden md:inline">{t.fullLabel}</span>
              </button>
            ))}
          </div>

          {/* ── Scrollable content ── */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {tab === "about" && <AboutTab product={product} />}
            {tab === "ingredients" && <IngredientsTab product={product} />}
            {tab === "activity" && <ActivityTab productId={product.id} />}
          </div>
        </>
      ) : null}
    </Modal>
  )
}

// ── Tab contents ───────────────────────────────────────────────────────────────

const AboutTab = ({ product }: { product: Product }) => {
  const cfg = STATUS_CONFIG[product.status]
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Product name", value: product.name },
    { label: "Brand name", value: product.brandName ?? "—" },
    { label: "SKU", value: product.sku },
    { label: "Category", value: <CategoryCell product={product} /> },
    { label: "Price", value: formatPrice(product.price) },
    { label: "Stock level", value: product.stock },
    { label: "Location", value: <LocationCell locations={product.locations} /> },
    { label: "Low stock alert", value: product.lowStockAlert ?? "—" },
    { label: "Discount", value: product.discount != null ? `${product.discount}%` : "None" },
    {
      label: "Status",
      value: <StatusBadge label={cfg.label} variant={cfg.variant} dot />,
    },
    { label: "Created on", value: formatDateToCustomFormat(product.createdAt, true) },
  ]

  return (
    <div className="space-y-6">
      {/* Product image / gallery */}
      <ProductImageGallery product={product} />

      {/* Product info */}
      <div className="space-y-3">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          Product Information
        </p>
        <div>
          {fields.map((f) => (
            <div
              key={f.label}
              className="border-borderSubtle flex items-center justify-between border-t border-b py-3 [&+&]:border-t-0"
            >
              <span className="font-jakarta text-brand/60 text-sm">{f.label}</span>
              <span className="font-jakarta text-brand text-sm font-medium">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-3">
          <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
            Description
          </p>
          <p className="font-jakarta text-brand/70 text-sm leading-relaxed font-medium">
            {product.description}
          </p>
        </div>
      )}
    </div>
  )
}

const IngredientsTab = ({ product }: { product: Product }) => (
  <div className="space-y-6">
    {product.ingredients ? (
      <div className="space-y-3">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          Ingredients
        </p>
        <p className="font-jakarta text-brand/70 text-sm leading-relaxed font-medium">
          {product.ingredients}
        </p>
      </div>
    ) : (
      <p className="font-jakarta text-brand/40 text-sm">No ingredients listed.</p>
    )}
    {product.howToUse && (
      <div className="space-y-3">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          How to use
        </p>
        <p className="font-jakarta text-brand/70 text-sm leading-relaxed font-medium">
          {product.howToUse}
        </p>
      </div>
    )}
  </div>
)

const ActivityTab = ({ productId }: { productId: string }) => {
  const { data, isLoading } = useGetProductActivityLogs(productId)
  const logs = data?.items ?? []

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-borderSubtle flex items-start gap-3 border-b pb-3">
            <Skeleton className="mt-0.5 h-6 w-6 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        ))}
      </div>
    )

  if (!logs.length)
    return <p className="font-jakarta text-brand/40 text-sm">No activity recorded.</p>

  return (
    <div className="space-y-3">
      {logs.map((log, i) => (
        <div
          key={`${log.date}-${i}`}
          className="border-borderSubtle flex items-start gap-3 border-b pb-3 last:border-0"
        >
          <div className="bg-primary/10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            <div className="bg-primary h-1.5 w-1.5 rounded-full" />
          </div>
          <div>
            <p className="font-jakarta text-brand text-sm font-medium">{log.activity}</p>
            <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
              {log.by} · {formatDateToCustomFormat(log.date ?? "", true)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const ProductImageGallery = ({ product }: { product: Product }) => {
  const images = product.galleryImages?.filter((g) => g.url) ?? []
  const slides = images.length
    ? images.map((g) => g.url!)
    : product.imageUrl
      ? [product.imageUrl]
      : []
  const [index, setIndex] = useState(0)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  if (!slides.length) {
    return (
      <div className="border-borderSubtle flex h-45 items-center justify-center rounded border bg-gray-50">
        <span className="font-jakarta text-brand/30 text-sm">No image uploaded</span>
      </div>
    )
  }

  if (slides.length === 1) {
    return (
      <>
        <button
          onClick={() => setPreviewIndex(0)}
          className="border-borderSubtle w-full cursor-zoom-in overflow-hidden rounded border bg-gray-50"
        >
          <img src={slides[0]} alt={product.name} className="h-45 w-full object-contain" />
        </button>
        {previewIndex !== null && (
          <ImageLightbox
            slides={slides}
            index={previewIndex}
            onIndexChange={setPreviewIndex}
            onClose={() => setPreviewIndex(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <div className="border-borderSubtle relative overflow-hidden rounded border bg-gray-50">
          <button onClick={() => setPreviewIndex(index)} className="w-full cursor-zoom-in">
            <img
              key={index}
              src={slides[index]}
              alt={`${product.name} ${index + 1}`}
              className="h-45 w-full object-contain"
            />
          </button>
          <button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute top-1/2 left-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronLeft size={14} className="text-brand" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronRight size={14} className="text-brand" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {slides.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                "h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition-colors",
                i === index ? "border-secondary" : "border-transparent",
              )}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {previewIndex !== null && (
        <ImageLightbox
          slides={slides}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  )
}

const ImageLightbox = ({
  slides,
  index,
  onIndexChange,
  onClose,
}: {
  slides: string[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
}) => {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={18} />
      </button>

      {slides.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onIndexChange((index - 1 + slides.length) % slides.length)
          }}
          className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <img
        src={slides[index]}
        alt={`Preview ${index + 1}`}
        className="max-h-[85vh] max-w-[85vw] rounded object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {slides.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onIndexChange((index + 1) % slides.length)
          }}
          className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange(i)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CategoryCell = ({ product }: { product: Product }) => {
  const names = product.categoryNames.length
    ? product.categoryNames
    : product.category
      ? product.category.split(", ").filter(Boolean)
      : []
  if (!names.length) return <span>—</span>
  const visible = names.slice(0, 2)
  const overflow = names.slice(2)
  return (
    <span className="flex items-center gap-1">
      <span>{visible.join(", ")}</span>
      {overflow.length > 0 && (
        <WithTooltip
          trigger={
            <span className="text-brand/50 cursor-default text-xs">+{overflow.length} others</span>
          }
          content={overflow.join(", ")}
        />
      )}
    </span>
  )
}

const LocationCell = ({ locations }: { locations?: ProductLocation[] }) => {
  if (!locations?.length) return <span>—</span>

  const visible = locations.slice(0, 2)
  const overflow = locations.slice(2)

  return (
    <span className="flex items-center gap-1">
      <span>{visible.map((l) => l.name).join(", ")}</span>
      {overflow.length > 0 && (
        <WithTooltip
          trigger={
            <span className="text-brand/50 cursor-default text-xs">+{overflow.length} others</span>
          }
          content={overflow.map((l) => l.name).join(", ")}
        />
      )}
    </span>
  )
}
