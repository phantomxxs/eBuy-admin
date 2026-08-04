import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { X, Info } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import ProductSearchInput from "@/components/ui/product-search-input"
import { transferStockSchema, type TransferStockFormValues } from "@/validations/inventory"
import { validateField } from "@/lib/utils"
import { useCreateInventoryTransfer } from "@/store/mutations/inventory"
import LocationSearchInput from "@/components/ui/location-search-input"
import type { InventoryByProduct } from "@/types/inventory"

interface TransferStockModalProps {
  isOpen: boolean
  onClose: () => void
  product?: InventoryByProduct | null
}

const REASON_OPTIONS = [
  { label: "New location setup", value: "New location setup" },
  { label: "Low stock", value: "Low stock" },
  { label: "Seasonal rebalancing", value: "Seasonal rebalancing" },
  { label: "Customer request", value: "Customer request" },
]

export default function TransferStockModal({ isOpen, onClose, product }: TransferStockModalProps) {
  const transfer = useCreateInventoryTransfer()
  const [transferError, setTransferError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      product: product?.id ?? "",
      fromLocation: "",
      toLocation: "",
      units: "",
      reason: "",
      notes: "",
    } satisfies TransferStockFormValues,
    onSubmit: ({ value }) => {
      transfer.mutate(
        {
          productId: value.product,
          fromLocationId: value.fromLocation,
          toLocationId: value.toLocation,
          qty: Number(value.units),
          reason: value.reason,
          notes: value.notes || undefined,
        },
        {
          onSuccess: () => {
            setTransferError(null)
            onClose()
          },
          onError: (e) => setTransferError(e.message),
        },
      )
    },
  })

  useEffect(() => {
    if (!isOpen) return
    setTransferError(null)
    form.setFieldValue("product", product?.id ?? "")
    form.setFieldValue("fromLocation", "")
    form.setFieldValue("toLocation", "")
    form.setFieldValue("units", "")
    form.setFieldValue("reason", "")
    form.setFieldValue("notes", "")
  }, [product, isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={transfer.isPending}
      variant="dialog"
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">
            Transfer stock between locations
          </h2>
          <button onClick={onClose} className="text-brand/40 hover:text-brand rounded p-1">
            <X size={16} />
          </button>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          {transferError && (
            <p className="font-jakarta text-danger mb-3 text-sm">{transferError}</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={onClose}
              disabled={transfer.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              loading={transfer.isPending}
              onClick={() => {
                setTransferError(null)
                form.handleSubmit()
              }}
              className="flex-1"
            >
              Transfer stock
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="font-jakarta text-sm text-amber-800">
            Transfers move units from one location to another without changing total inventory. Both
            locations are updated simultaneously on confirmation.
          </p>
        </div>

        <form.Field
          name="product"
          validators={{
            onBlur: ({ value }) => validateField(transferStockSchema, "product", value),
          }}
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

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="fromLocation"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                if (!value) return "From location is required"
                const to = fieldApi.form.getFieldValue("toLocation")
                if (to && value === to) return "Cannot be the same as destination"
              },
            }}
          >
            {(field) => (
              <form.Subscribe selector={(s) => s.values.toLocation}>
                {(toLocation) => (
                  <LocationSearchInput
                    label="From location"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Search for a location…"
                    exclude={toLocation || undefined}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Subscribe>
            )}
          </form.Field>
          <form.Field
            name="toLocation"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                if (!value) return "To location is required"
                const from = fieldApi.form.getFieldValue("fromLocation")
                if (from && value === from) return "Cannot be the same as source"
              },
            }}
          >
            {(field) => (
              <form.Subscribe selector={(s) => s.values.fromLocation}>
                {(fromLocation) => (
                  <LocationSearchInput
                    label="To location"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Search for a location…"
                    exclude={fromLocation || undefined}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Subscribe>
            )}
          </form.Field>
        </div>

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

        <form.Field
          name="units"
          validators={{ onBlur: ({ value }) => validateField(transferStockSchema, "units", value) }}
        >
          {(field) => (
            <FormInput
              label="Units to transfer"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g 10"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field
          name="reason"
          validators={{
            onBlur: ({ value }) => validateField(transferStockSchema, "reason", value),
          }}
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
              placeholder="Add any additional notes here"
              rows={3}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
