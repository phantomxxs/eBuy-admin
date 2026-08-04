import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X, Info } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import ProductSearchInput from "@/components/ui/product-search-input"
import { adjustStockSchema, type AdjustStockFormValues } from "@/validations/inventory"
import { validateField } from "@/lib/utils"
import { useAdjustStock } from "@/store/mutations/inventory"
import LocationSearchInput from "@/components/ui/location-search-input"
import { showAlert } from "@/store/alerts"
import type { InventoryByProduct } from "@/types/inventory"

interface AdjustStockModalProps {
  isOpen: boolean
  onClose: () => void
  product?: InventoryByProduct | null
}

const ADJUSTMENT_TYPE_OPTIONS = [
  { label: "Add units (restock)", value: "add" },
  { label: "Remove units", value: "remove" },
]

const REASON_OPTIONS = [
  { label: "New stock received from supplier", value: "New stock received from supplier" },
  { label: "Customer return", value: "Customer return" },
  { label: "Stock count correction", value: "Stock count correction" },
]

export default function AdjustStockModal({ isOpen, onClose, product }: AdjustStockModalProps) {
  const adjustStock = useAdjustStock()

  const form = useForm({
    defaultValues: {
      product: product?.id ?? "",
      location: "",
      adjustmentType: "",
      units: "5",
      price: "",
      reason: "",
      notes: "",
    } satisfies AdjustStockFormValues,
    onSubmit: ({ value }) => {
      adjustStock.mutate(
        {
          adjustmentType: value.adjustmentType as "add" | "remove" | "set",
          reason: value.reason,
          notes: value.notes ?? "",
          items: [
            {
              productId: Number(value.product),
              locationId: Number(value.location),
              qty: Number(value.units),
              price: value.price ? Number(value.price) : undefined,
            },
          ],
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Stock adjusted successfully" })
            onClose()
          },
          onError: () =>
            showAlert({
              variant: "error",
              message: "Failed to adjust stock. Please try again.",
            }),
        },
      )
    },
  })

  useEffect(() => {
    if (!isOpen) return
    form.setFieldValue("product", product?.id ?? "")
    form.setFieldValue("location", "")
    form.setFieldValue("adjustmentType", "")
    form.setFieldValue("units", "5")
    form.setFieldValue("price", "")
    form.setFieldValue("reason", "")
    form.setFieldValue("notes", "")
  }, [product, isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={adjustStock.isPending}
      variant="dialog"
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">Adjust stock level</h2>
          <button onClick={onClose} className="text-brand/40 hover:text-brand rounded p-1">
            <X size={16} />
          </button>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={onClose}
              disabled={adjustStock.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              loading={adjustStock.isPending}
              onClick={() => form.handleSubmit()}
              className="flex-1"
            >
              Confirm adjustment
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="font-jakarta text-sm text-amber-800">
            All adjustments are logged permanently in the Audit Log. Provide a reason for the
            change.
          </p>
        </div>

        <form.Field
          name="product"
          validators={{ onBlur: ({ value }) => validateField(adjustStockSchema, "product", value) }}
        >
          {(field) => (
            <ProductSearchInput
              label="Product"
              value={field.state.value}
              displayValue={product?.product}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Search for a product…"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field
          name="location"
          validators={{
            onBlur: ({ value }) => validateField(adjustStockSchema, "location", value),
          }}
        >
          {(field) => (
            <LocationSearchInput
              label="Location"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Search for a location…"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {product && (
          <div className="border-borderSubtle rounded-lg border bg-gray-50 p-4">
            <div className="flex justify-between py-1">
              <span className="font-jakarta text-brand/50 text-sm">Total stock</span>
              <span className="font-jakarta text-brand text-sm font-medium">
                {product.qty} units
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-jakarta text-brand/50 text-sm">Low stock threshold</span>
              <span className="font-jakarta text-brand text-sm font-medium">
                {product.lowStockAlert}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="adjustmentType"
            validators={{
              onBlur: ({ value }) => validateField(adjustStockSchema, "adjustmentType", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Adjustment type"
                options={ADJUSTMENT_TYPE_OPTIONS}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Select type"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="units"
            validators={{ onBlur: ({ value }) => validateField(adjustStockSchema, "units", value) }}
          >
            {(field) => (
              <FormInput
                label="Units to add"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="0"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="price">
          {(field) => (
            <FormInput
              label="Price (₦)"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              placeholder="0.00"
            />
          )}
        </form.Field>
        <form.Field
          name="reason"
          validators={{ onBlur: ({ value }) => validateField(adjustStockSchema, "reason", value) }}
        >
          {(field) => (
            <Dropdown
              label="Reason"
              options={REASON_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select a reason"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field name="notes">
          {(field) => (
            <FormTextarea
              label="Additional notes"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              placeholder="e.g supplier invoice number"
              rows={3}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
