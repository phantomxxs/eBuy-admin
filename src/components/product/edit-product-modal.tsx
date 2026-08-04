import { useRef, useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X, Upload, Loader2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import Dropdown from "@/components/ui/dropdown"
import { productSchema, type ProductFormValues, validateImageFiles } from "@/validations/products"
import { validateField } from "@/lib/utils"
import CategorySearchInput from "@/components/ui/category-search-input"
import LocationSearchInput from "@/components/ui/location-search-input"
import SkinTypeSearchInput from "@/components/ui/skin-type-search-input"
import { useGetProductById } from "@/store/queries/products"
import {
  useUpdateProduct,
  useAddProductImages,
  useRemoveProductImage,
  useUpdateProductStatus,
} from "@/store/mutations/products"
import { Skeleton } from "@/components/ui/skeleton"
import { Archive } from "lucide-react"
import type { Product } from "@/types/products"
import { showAlert } from "@/store/alerts"

// ── Types ──────────────────────────────────────────────────────────────────────

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function EditProductModal(props: EditProductModalProps) {
  // Key-based remount resets the form when the product changes
  return <EditProductForm key={props.product?.id ?? "none"} {...props} />
}

function EditProductForm({ isOpen, onClose, product: productProp }: EditProductModalProps) {
  const updateProduct = useUpdateProduct()
  const updateStatus = useUpdateProductStatus()
  const addImages = useAddProductImages()

  const { data: fullProduct, isLoading: isLoadingProduct } = useGetProductById(
    productProp?.id ?? null,
  )

  const product = fullProduct ?? productProp

  const removeProductImage = useRemoveProductImage()

  const fileRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      name: productProp?.name ?? "",
      status: productProp?.status ?? "active",
      brandName: productProp?.brandName ?? "",
      category: productProp?.categoryIds?.map(String) ?? [],
      price: productProp?.price != null ? String(productProp.price) : "",
      sku: productProp?.sku ?? "",
      skinType: Array.isArray(productProp?.skinType)
        ? productProp.skinType.map((sk) => String(sk.skin_type_id))
        : productProp?.skinType
          ? [productProp.skinType]
          : ([] as string[]),
      stock: productProp?.stock != null ? String(productProp.stock) : "",
      lowStockAlert: productProp?.lowStockAlert != null ? String(productProp.lowStockAlert) : "",
      discount: productProp?.discount != null ? String(productProp.discount) : "",
      location: productProp?.locations?.map((l) => String(l.id)) ?? [],
      description: productProp?.description ?? "",
      ingredients: productProp?.ingredients ?? "",
      howToUse: productProp?.howToUse ?? "",
      weight: productProp?.weight != null ? String(productProp.weight) : "0",
    } satisfies ProductFormValues,
    onSubmit: ({ value }) => {
      if (!product) return
      const allCategories = value.category.includes("0")
      const allSkinTypes = (value.skinType ?? []).includes("0")
      const allLocations = (value.location ?? []).includes("0")
      updateProduct.mutate(
        {
          id: product.id,
          name: value.name.trim().replace(/\b\w/g, (c) => c.toUpperCase()),
          brandName: value.brandName || undefined,
          price: value.price ? parseFloat(value.price) : undefined,
          weight: value.weight ? parseFloat(value.weight) : undefined,
          categoryIds: allCategories
            ? []
            : value.category.length
              ? value.category.map((id) => parseInt(id))
              : undefined,
          locationIds: allLocations
            ? []
            : value.location?.length
              ? value.location.map((id) => parseInt(id))
              : undefined,
          sku: value.sku || undefined,
          skinType: allSkinTypes ? [] : (value.skinType ?? []),
          stockQty: value.stock ? parseInt(value.stock) : undefined,
          lowStockAlert: value.lowStockAlert ? parseInt(value.lowStockAlert) : undefined,
          discount: value.discount ? parseFloat(value.discount) : undefined,
          description: value.description || undefined,
          ingredients: value.ingredients || undefined,
          howToUse: value.howToUse || undefined,
          status: (value.status as "active" | "archived") ?? product.status,
          ...(allCategories && { allCategories: true }),
          ...(allSkinTypes && { allSkinTypes: true }),
          ...(allLocations && { allLocations: true }),
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Product updated successfully" })
            onClose()
          },
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (!isOpen || !product) return
    form.setFieldValue("name", product.name)
    form.setFieldValue("status", product.status ?? "active")
    form.setFieldValue("brandName", product.brandName ?? "")
    form.setFieldValue("category", product.categoryIds?.map(String) ?? [])
    form.setFieldValue("price", String(product.price))
    form.setFieldValue("sku", product.sku ?? "")
    form.setFieldValue(
      "skinType",
      Array.isArray(product.skinType)
        ? product.skinType.map((sk) => String(sk.skin_type_id))
        : product.skinType
          ? [product.skinType]
          : [],
    )
    form.setFieldValue("stock", product.stock != null ? String(product.stock) : "")
    form.setFieldValue(
      "lowStockAlert",
      product.lowStockAlert != null ? String(product.lowStockAlert) : "0",
    )
    form.setFieldValue("discount", product.discount != null ? String(product.discount) : "0")
    form.setFieldValue("location", product.locations?.map((l) => String(l.id)) ?? [])
    form.setFieldValue("description", product.description ?? "")
    form.setFieldValue("ingredients", product.ingredients ?? "")
    form.setFieldValue("howToUse", product.howToUse ?? "")
    form.setFieldValue("weight", product.weight != null ? String(product.weight) : "0")
  }, [product, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const error = validateImageFiles(files)
    if (error) {
      showAlert({ variant: "error", message: error })
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    if (!product) return
    addImages.mutate(
      { productId: product.id, images: files },
      { onError: (err) => showAlert({ variant: "error", message: err.message }) },
    )
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleRemoveExistingImage = (imageId: string | number) => {
    if (!product) return
    removeProductImage.mutate(
      { productId: product.id, imageId: String(imageId) },
      { onError: (error) => showAlert({ variant: "error", message: error.message }) },
    )
  }

  const customHeader = (
    <div className="border-brand/3 flex items-start justify-between border-b px-6 py-4">
      <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
        Edit product
      </h2>
      <button
        onClick={onClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )

  const isMutating = updateProduct.isPending || updateStatus.isPending || addImages.isPending
  const canActivate =
    product?.status === "archived" || product?.status === "inactive" || product?.status === "draft"

  const handleStatusToggle = () => {
    if (!product) return
    const newStatus = canActivate ? ("active" as const) : ("archived" as const)
    updateStatus.mutate(
      { id: product.id, status: newStatus },
      {
        onSuccess: () => {
          showAlert({
            variant: "success",
            message: canActivate ? "Product activated" : "Product archived",
          })
          onClose()
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const customFooter = (
    <div className="border-borderSubtle flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:gap-4">
      {canActivate ? (
        <Button
          variant="success"
          className="flex-1"
          loading={updateStatus.isPending}
          disabled={isMutating}
          onClick={handleStatusToggle}
        >
          Activate
        </Button>
      ) : (
        <Button
          variant="outline"
          className="flex-1"
          beforeIcon={<Archive size={14} />}
          loading={updateStatus.isPending}
          disabled={isMutating}
          onClick={handleStatusToggle}
        >
          Archive
        </Button>
      )}
      <Button
        variant="secondary"
        className="flex-1"
        loading={updateProduct.isPending}
        disabled={isMutating}
        onClick={() => form.handleSubmit()}
      >
        Save changes
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      position="right"
      width="640px"
      customHeader={customHeader}
      customFooter={customFooter}
      preventClose={updateProduct.isPending}
    >
      {isLoadingProduct ? (
        <div className="flex flex-col gap-4 px-6 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-6 py-4">
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

          {/* Brand name + Status */}
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

            <form.Field name="status">
              {(field) => (
                <Dropdown
                  label="Status"
                  value={field.state.value ?? "active"}
                  onChange={(v) => field.handleChange(v as "active" | "archived")}
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Archived", value: "archived" },
                  ]}
                  required
                />
              )}
            </form.Field>
          </div>

          {/* SKU */}
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

          {/* Category */}
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

          {/* Price + Weight */}
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

            <form.Field name="weight">
              {(field) => (
                <FormInput
                  label="Weight (lbs)"
                  placeholder="0.00"
                  type="number"
                  value={String(field.state.value) ?? ""}
                  onChange={(v) => field.handleChange(v)}
                />
              )}
            </form.Field>
          </div>

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
                  label="Discount (%)"
                  placeholder="0.00"
                  type="number"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]?.toString()}
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
              {(product?.galleryImages?.length ?? 0) > 0 && (
                <span className="text-brand/40 ml-1 font-normal">
                  ({product!.galleryImages!.length})
                </span>
              )}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Gallery images */}
            {(product?.galleryImages?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {product!.galleryImages!.map((img) => (
                  <div key={img.image_id} className="group relative">
                    <img
                      src={img.url}
                      alt="Product image"
                      className="border-brand/8 h-24 w-full rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.image_id)}
                      disabled={removeProductImage.isPending}
                      className="bg-brand/60 hover:bg-danger absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100 disabled:cursor-not-allowed"
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
              disabled={addImages.isPending}
              className="border-brand/8 hover:bg-brand/5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-white/20 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addImages.isPending ? (
                <Loader2 size={13} className="text-brand/40 animate-spin" />
              ) : (
                <Upload size={13} className="text-brand/40" />
              )}
              <span className="font-jakarta text-brand/50 text-sm">
                {addImages.isPending ? "Uploading…" : "Add images"}
              </span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
