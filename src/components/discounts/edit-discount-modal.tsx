import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import Dropdown from "@/components/ui/dropdown"
import { DatePicker } from "@/components/ui/date-picker"
import { validateField } from "@/lib/utils"
import CategorySearchInput from "@/components/ui/category-search-input"
import type { Discount, DiscountDetail } from "@/types/discounts"
import { editDiscountSchema, type EditDiscountFormValues } from "@/validations/discounts"
import { useUpdateDiscount } from "@/store/mutations/discounts"

interface Props {
  isOpen: boolean
  onClose: () => void
  discount: DiscountDetail | Discount | null
}

const TYPE_OPTIONS = [
  { label: "Percentage off", value: "percentage_off" },
  { label: "Fixed amount", value: "fixed_amount" },
  // { label: "Free shipping", value: "free_shipping" },
  // { label: "BOGO", value: "bogo" },
]

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Draft", value: "draft" },
  { label: "Expired", value: "expired" },
]

export default function EditDiscountModal({ isOpen, onClose, discount }: Props) {
  const updateDiscount = useUpdateDiscount()

  const form = useForm({
    defaultValues: {
      name: "",
      discountType: "",
      discount: "",
      categoryIds: [] as string[],
      status: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
    } satisfies EditDiscountFormValues,
    onSubmit: ({ value }) => {
      if (!discount) return
      const allCategories = (value.categoryIds ?? []).includes("0")
      updateDiscount.mutate(
        {
          id: discount.id,
          payload: {
            name: value.name,
            discountType: value.discountType,
            discountValue: Number(value.discount) || 0,
            appliesToCategoryIds: allCategories ? [] : (value.categoryIds ?? []).map(Number),
            usageLimit: Number(value.usageLimit) || 0,
            startDate: value.startDate,
            endDate: value.endDate,
            ...(allCategories && { allCategories: true }),
          },
        },
        { onSuccess: onClose },
      )
    },
  })

  useEffect(() => {
    if (!discount || !isOpen) return
    form.setFieldValue("name", discount.name)
    form.setFieldValue("discountType", discount.discountType)
    form.setFieldValue(
      "discount",
      "discountValue" in discount ? String(discount.discountValue) : discount.discount,
    )
    form.setFieldValue("status", discount.status)
    form.setFieldValue("startDate", discount.startDate)
    form.setFieldValue("endDate", discount.endDate)
    const ids = "appliesToCategoryIds" in discount ? discount.appliesToCategoryIds.map(String) : []
    form.setFieldValue("categoryIds", ids)
    if ("usageLimit" in discount) {
      form.setFieldValue("usageLimit", String(discount.usageLimit ?? ""))
    }
  }, [discount, isOpen])

  if (!discount) return null

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Edit discount
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {discount.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex gap-3">
        <Button
          variant="subtle"
          onClick={onClose}
          disabled={updateDiscount.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSubmit()}
          loading={updateDiscount.isPending}
          className="flex-1"
        >
          Save changes
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      customFooter={customFooter}
      preventClose={updateDiscount.isPending}
      width="560px"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <SectionLabel title="DISCOUNT DETAILS" />

        <form.Field
          name="name"
          validators={{ onBlur: ({ value }) => validateField(editDiscountSchema, "name", value) }}
        >
          {(field) => (
            <FormInput
              label="Discount name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Enter discount name"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="discountType"
            validators={{
              onBlur: ({ value }) => validateField(editDiscountSchema, "discountType", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Discount type"
                options={TYPE_OPTIONS}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Select type"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="discount"
            validators={{
              onBlur: ({ value }) => validateField(editDiscountSchema, "discount", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Discount value"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="e.g. 10"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field name="categoryIds">
            {(field) => (
              <CategorySearchInput
                multiple
                showAllOption
                label="Applies to (categories)"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Search categories…"
              />
            )}
          </form.Field>
          <form.Field name="usageLimit">
            {(field) => (
              <FormInput
                label="Usage limit"
                type="number"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                placeholder="0 = unlimited"
              />
            )}
          </form.Field>
        </div>

        <SectionLabel title="SCHEDULE" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="startDate"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Start date is required"
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">Start date</label>
                <DatePicker
                  value={field.state.value ?? ""}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick start date"
                />
                {field.state.meta.errors[0] && (
                  <p className="font-jakarta text-destructive text-xs">
                    {field.state.meta.errors[0].toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="endDate"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                const start = fieldApi.form.getFieldValue("startDate")
                if (!value) return "End date is required"
                if (start && value <= start) return "End date must be after start date"
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">End date</label>
                <DatePicker
                  value={field.state.value ?? ""}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick end date"
                  minDate={
                    form.getFieldValue("startDate")
                      ? new Date(form.getFieldValue("startDate") + "T00:00:00")
                      : undefined
                  }
                />
                {field.state.meta.errors[0] && (
                  <p className="font-jakarta text-destructive text-xs">
                    {field.state.meta.errors[0].toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <SectionLabel title="STATUS" />

        <form.Field
          name="status"
          validators={{
            onBlur: ({ value }) => validateField(editDiscountSchema, "status", value),
          }}
        >
          {(field) => (
            <Dropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select status"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wide uppercase">
    {title}
  </p>
)
