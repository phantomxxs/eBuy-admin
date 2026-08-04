import { useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { X, Upload, BookOpen } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import { productSchema, type ProductFormValues, validateImageFiles } from "@/validations/products"
import { validateField } from "@/lib/utils"
import CategorySearchInput from "@/components/ui/category-search-input"
import LocationSearchInput from "@/components/ui/location-search-input"
import SkinTypeSearchInput from "@/components/ui/skin-type-search-input"
import { useCreateProduct } from "@/store/mutations/products"
import { showAlert } from "@/store/alerts"
import MasterCatalogImportModal from "./master-catalog-import-modal"
import type { MasterCatalogProduct } from "@/types/products"

// Re-export for consumers that reference ProductFormData
export type { ProductFormValues as ProductFormData }

// ── Types ──────────────────────────────────────────────────────────────────────

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const createProduct = useCreateProduct()

  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const submitStatusRef = useRef<"active" | "draft">("active")
  const [showCatalog, setShowCatalog] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      brandName: "",
      category: [] as string[],
      price: "",
      sku: "",
      skinType: [] as string[],
      stock: "",
      lowStockAlert: "0",
      discount: "0",
      location: [] as string[],
      description: "",
      ingredients: "",
      howToUse: "",
      weight: "",
    } satisfies ProductFormValues,
    onSubmit: ({ value }) => {
      const discountValue = parseFloat(value.discount == "None" ? "0" : value.discount)
      const allCategories = value.category.includes("0")
      const allSkinTypes = value.skinType.includes("0")
      const allLocations = (value.location ?? []).includes("0")
      const payload = {
        name: value.name.trim().replace(/\b\w/g, (c) => c.toUpperCase()),
        price: parseFloat(value.price),
        categoryIds: allCategories ? [] : value.category.map((id) => parseInt(id)),
        brand: value.brandName ?? "",
        skinType: allSkinTypes ? [] : (value.skinType ?? []),
        stockQty: value.stock ? parseInt(value.stock) : 0,
        lowStockAlert: value.lowStockAlert ? parseInt(value.lowStockAlert) : 0,
        discount: discountValue,
        description: value.description ?? "",
        ingredients: value.ingredients ?? "",
        howToUse: value.howToUse ?? "",
        weight: value.weight ? parseFloat(value.weight) : undefined,
        status: submitStatusRef.current,
        locationIds: allLocations ? [] : (value.location ?? []).map((id) => parseInt(id)),
        ...(allCategories && { allCategories: true }),
        ...(allSkinTypes && { allSkinTypes: true }),
        ...(allLocations && { allLocations: true }),
      }
      createProduct.mutate(
        { payload, images: imageFiles.length ? imageFiles : undefined },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Product created successfully" })
            handleClose()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  const handleClose = () => {
    form.reset()
    setImageFiles([])
    setImagePreviews([])
    onClose()
  }

  const handlePrefill = (product: MasterCatalogProduct) => {
    if (product.name) form.setFieldValue("name", product.name)
    if (product.brandName ?? product.brand)
      form.setFieldValue("brandName", (product.brandName ?? product.brand)!)
    if (product.description) form.setFieldValue("description", product.description)
    if (product.ingredients?.length)
      form.setFieldValue("ingredients", product.ingredients.join(", "))
    if (product.howToUse) form.setFieldValue("howToUse", product.howToUse)
    if (product.weight) form.setFieldValue("weight", String(product.weight))
    if (product.sku) form.setFieldValue("sku", product.sku)
    setShowCatalog(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const error = validateImageFiles(files)
    if (error) {
      showAlert({ variant: "error", message: error })
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    setImageFiles((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    if (fileRef.current) fileRef.current.value = ""
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (status: "active" | "draft") => {
    submitStatusRef.current = status
    form.handleSubmit()
  }

  const customHeader = (
    <div className="border-brand/3 flex items-start justify-between border-b px-6 py-4">
      <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
        Add new product
      </h2>
      <button
        onClick={handleClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:gap-4">
      <Button
        variant="outline"
        className="flex-1"
        loading={createProduct.isPending && submitStatusRef.current === "draft"}
        disabled={createProduct.isPending}
        onClick={() => handleSubmit("draft")}
      >
        Save as draft
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        loading={createProduct.isPending && submitStatusRef.current === "active"}
        disabled={createProduct.isPending}
        onClick={() => handleSubmit("active")}
      >
        Add product
      </Button>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        variant="drawer"
        position="right"
        width="640px"
        customHeader={customHeader}
        customFooter={customFooter}
        preventClose={createProduct.isPending}
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          {/* Import from catalog banner */}
          <button
            type="button"
            onClick={() => setShowCatalog(true)}
            className="border-primary/20 bg-primary/5 hover:bg-primary/8 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
          >
            <BookOpen size={16} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-jakarta text-primary text-sm font-semibold">Import from catalog</p>
              <p className="font-jakarta text-brand/50 text-xs">
                Search 100k+ products and prefill this form
              </p>
            </div>
          </button>

          {/* Product name */}
          <form.Field
            name="name"
            validators={{ onBlur: ({ value }) => validateField(productSchema, "name", value) }}
          >
            {(field) => (
              <FormInput
                label="Product name"
                placeholder="Enter product name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
                required
              />
            )}
          </form.Field>

          {/* Brand name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="brandName"
              validators={{
                onBlur: ({ value }) => validateField(productSchema, "brandName", value),
              }}
            >
              {(field) => (
                <FormInput
                  label="Brand name"
                  placeholder="Enter brand name"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]?.toString()}
                  required
                />
              )}
            </form.Field>

            <form.Field
              name="category"
              validators={{
                onChange: ({ value }) => validateField(productSchema, "category", value),
              }}
            >
              {(field) => (
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
          </div>

          {/* Price + SKU */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="price"
              validators={{ onBlur: ({ value }) => validateField(productSchema, "price", value) }}
            >
              {(field) => (
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
              {(field) => (
                <FormInput
                  label="SKU"
                  placeholder="Auto-generated if left blank"
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>

          {/* Weight */}
          <form.Field
            name="weight"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Weight is required"
                const n = parseFloat(value)
                if (isNaN(n) || n < 0.01) return "Weight must be at least 0.01 lbs"
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Weight (lbs)"
                placeholder="0.00"
                type="number"
                value={field.state.value ?? ""}
                onChange={(v) => field.handleChange(v)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
                required
              />
            )}
          </form.Field>

          {/* Skin type */}
          <form.Field
            name="skinType"
            validators={{
              onChange: ({ value }) => validateField(productSchema, "skinType", value),
            }}
          >
            {(field) => (
              <SkinTypeSearchInput
                multiple
                showAllOption
                label="Skin type"
                placeholder="Search skin types…"
                value={field.state.value}
                onChange={field.handleChange}
                error={field.state.meta.errors[0]?.toString()}
                required
              />
            )}
          </form.Field>

          {/* Stock + Low stock alert */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="stock"
              validators={{ onBlur: ({ value }) => validateField(productSchema, "stock", value) }}
            >
              {(field) => (
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

            <form.Field
              name="lowStockAlert"
              validators={{
                onBlur: ({ value }) => validateField(productSchema, "lowStockAlert", value),
              }}
            >
              {(field) => (
                <FormInput
                  label="Low stock alert"
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
          </div>

          {/* Discount + Location */}
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="discount"
              validators={{
                onBlur: ({ value }) => validateField(productSchema, "discount", value),
              }}
            >
              {(field) => (
                <FormInput
                  label="Discount (0)"
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

            <form.Field
              name="location"
              validators={{
                onChange: ({ value }) => validateField(productSchema, "location", value),
              }}
            >
              {(field) => (
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
          </div>

          {/* Description */}
          <form.Field
            name="description"
            validators={{
              onBlur: ({ value }) => validateField(productSchema, "description", value),
            }}
          >
            {(field) => (
              <FormTextarea
                label="Description"
                placeholder="What does this product do"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
                required
              />
            )}
          </form.Field>

          {/* Ingredients */}
          <form.Field
            name="ingredients"
            validators={{
              onBlur: ({ value }) => validateField(productSchema, "ingredients", value),
            }}
          >
            {(field) => (
              <FormTextarea
                label="Ingredients"
                placeholder="e.g aqua (water), sodium hyaluronate, "
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
                required
              />
            )}
          </form.Field>

          {/* How to use */}
          <form.Field name="howToUse">
            {(field) => (
              <FormTextarea
                label="How to use"
                placeholder="Application instructions e.g after cleansing, apply"
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          {/* Product images */}
          <div className="flex flex-col gap-1.5">
            <label className="font-jakarta text-brand text-xs font-semibold">
              Product images
              {imagePreviews.length > 0 && (
                <span className="text-brand/40 ml-1 font-normal">({imagePreviews.length})</span>
              )}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={src}
                      alt={`Product image ${i + 1}`}
                      className="border-brand/8 h-24 w-full rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="bg-brand/60 hover:bg-danger absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border-brand/8 hover:bg-brand/5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-white/20 transition-colors"
            >
              <Upload size={13} className="text-brand/40" />
              <span className="font-jakarta text-brand/50 text-sm">
                {imagePreviews.length > 0 ? "Add more images" : "Upload product images"}
              </span>
            </button>
          </div>
        </div>
      </Modal>

      <MasterCatalogImportModal
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
        onPrefill={handlePrefill}
      />
    </>
  )
}
