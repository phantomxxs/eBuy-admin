import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { X, Info, Plus } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import { bulkAdjustSchema, type BulkAdjustFormValues } from "@/validations/inventory"
import { cn, validateField } from "@/lib/utils"
import { useAdjustStock } from "@/store/mutations/inventory"
import ProductSearchInput from "@/components/ui/product-search-input"
import LocationSearchInput from "@/components/ui/location-search-input"
import { showAlert } from "@/store/alerts"

interface BulkAdjustModalProps {
  isOpen: boolean
  onClose: () => void
}

interface BulkRow {
  id: string
  product: string
  location: string
  units: string
  price: string
}

const ADJUSTMENT_TYPE_OPTIONS = [
  { label: "Add units (restock)", value: "add" },
  { label: "Remove units", value: "remove" },
]

const REASON_OPTIONS = [
  { label: "New stock received from supplier", value: "New stock received from supplier" },
  { label: "Customer return", value: "Customer return" },
  { label: "Stock count correction", value: "Stock count correction" },
  { label: "Damaged goods", value: "Damaged goods" },
]

const DEFAULT_ROW = (): BulkRow => ({
  id: String(Date.now()),
  product: "",
  location: "",
  units: "5",
  price: "0.00",
})

interface RowErrors {
  product?: string
  location?: string
  units?: string
}

export default function BulkAdjustModal({ isOpen, onClose }: BulkAdjustModalProps) {
  const adjustStock = useAdjustStock()

  const [rows, setRows] = useState<BulkRow[]>([DEFAULT_ROW()])
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({})

  const updateRow = (id: string, field: keyof BulkRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    if (field === "product" || field === "location" || field === "units") {
      setRowErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value ? undefined : prev[id]?.[field] },
      }))
    }
  }

  const form = useForm({
    defaultValues: {
      adjustmentType: "",
      reason: "",
      notes: "",
    } satisfies BulkAdjustFormValues,
    onSubmit: ({ value }) => {
      const errors: Record<string, RowErrors> = {}
      rows.forEach((r) => {
        const e: RowErrors = {}
        if (!r.product) e.product = "Product is required"
        if (!r.location) e.location = "Location is required"
        if (!r.units) e.units = "Units is required"
        if (Object.keys(e).length) errors[r.id] = e
      })
      if (Object.keys(errors).length) {
        setRowErrors(errors)
        return
      }
      adjustStock.mutate(
        {
          adjustmentType: value.adjustmentType as "add" | "remove" | "set",
          reason: value.reason,
          notes: value.notes || "",
          items: rows.map((r: BulkRow) => ({
            productId: Number(r.product),
            locationId: Number(r.location),
            qty: Number(r.units),
            costPrice: Number(r.price) > 0 ? Number(r.price) : undefined,
          })),
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Bulk adjustment applied successfully" })
            onClose()
          },
          onError: () =>
            showAlert({
              variant: "error",
              message: "Failed to apply bulk adjustment. Please try again.",
            }),
        },
      )
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={adjustStock.isPending}
      variant="dialog"
      className="p-0"
      width="768px"
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">
            Bulk adjust stock level
          </h2>
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
            Each row is one adjustment. Changes with the same reason and timestamp are grouped as a
            single audit batch. All are permanent and cannot be undone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="adjustmentType"
            validators={{
              onBlur: ({ value }) => validateField(bulkAdjustSchema, "adjustmentType", value),
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
            name="reason"
            validators={{ onBlur: ({ value }) => validateField(bulkAdjustSchema, "reason", value) }}
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
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const selectedElsewhere = rows
              .filter((r) => r.id !== row.id && r.product)
              .map((r) => r.product)
            const errs = rowErrors[row.id]
            return (
              <div key={row.id} className="flex items-end gap-2">
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <ProductSearchInput
                    label="Product"
                    value={row.product}
                    onChange={(val) => updateRow(row.id, "product", val)}
                    placeholder="Search product…"
                    excludeIds={selectedElsewhere}
                    error={errs?.product}
                  />
                  <LocationSearchInput
                    label="Location"
                    value={row.location}
                    onChange={(val) => updateRow(row.id, "location", val)}
                    placeholder="Search location…"
                    error={errs?.location}
                  />
                  <FormInput
                    label="Units to add"
                    value={row.units}
                    onChange={(val) => updateRow(row.id, "units", val)}
                    placeholder="0"
                    error={errs?.units}
                  />
                  <FormInput
                    label="Price (₦)"
                    value={row.price}
                    onChange={(val) => updateRow(row.id, "price", val)}
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                  disabled={rows.length === 1}
                  className={cn(
                    "text-brand/30 hover:text-danger shrink-0 transition-colors disabled:pointer-events-none disabled:opacity-0",
                    errs ? "mb-4.5" : "mb-2.5",
                  )}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setRows((prev) => [...prev, DEFAULT_ROW()])}
          className="font-jakarta text-primary mt-1 flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <Plus size={14} />
          Add product to adjust
        </button>

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
