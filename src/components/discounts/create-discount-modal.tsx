import { useRef } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { DatePicker } from "@/components/ui/date-picker"
import { useForm } from "@tanstack/react-form"
import { useCreateDiscount } from "@/store/mutations/discounts"
import CategorySearchInput from "@/components/ui/category-search-input"
import { validateField } from "@/lib/utils"
import { createDiscountSchema, type CreateDiscountFormValues } from "@/validations/discounts"
import type { CreateDiscountPayload } from "@/types/discounts"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage off", value: "percentage_off" },
  { label: "Fixed amount", value: "fixed_amount" },
  // { label: "Free shipping", value: "free_shipping" },
  // { label: "BOGO", value: "bogo" },
]

const ELIGIBILITY_OPTIONS = [
  { label: "All customers", value: "all_customers" },
  { label: "New customers", value: "new_customers" },
  { label: "VIP customers", value: "vip_customers" },
]

export default function CreateDiscountModal({ isOpen, onClose }: Props) {
  const createDiscount = useCreateDiscount()
  const saveModeRef = useRef<"activate" | "draft">("activate")

  const form = useForm({
    defaultValues: {
      name: "",
      discountType: "",
      discountValue: "",
      categoryIds: [] as string[],
      startDate: "",
      endDate: "",
      customerEligibility: "",
      usageLimit: "1",
    } satisfies CreateDiscountFormValues,
    onSubmit: ({ value }) => {
      const allCategories = value.categoryIds.includes("0")
      const payload: CreateDiscountPayload = {
        name: value.name,
        discountType: value.discountType,
        discountValue: Number(value.discountValue),
        appliesToCategoryIds: allCategories ? [] : value.categoryIds.map(Number),
        customerEligibility: value.customerEligibility || "all_customers",
        usageLimit: Number(value.usageLimit) || 0,
        startDate: value.startDate,
        endDate: value.endDate,
        saveMode: saveModeRef.current,
        ...(allCategories && { allCategories: true }),
      }
      createDiscount.mutate(payload, { onSuccess: onClose })
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title="Create discount"
      className="p-0"
      width="625px"
      preventClose={createDiscount.isPending}
      customFooter={
        <div className="border-borderSubtle flex gap-2 border-t px-6 py-4">
          <Button
            variant="subtle"
            onClick={() => {
              saveModeRef.current = "draft"
              void form.handleSubmit()
            }}
            disabled={createDiscount.isPending}
            className="flex-1"
          >
            Save as draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              saveModeRef.current = "activate"
              void form.handleSubmit()
            }}
            loading={createDiscount.isPending}
            className="flex-1"
          >
            Create &amp; activate
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => validateField(createDiscountSchema, "name", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Discount name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. Summer Sale 20%"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="discountType"
            validators={{
              onBlur: ({ value }) => validateField(createDiscountSchema, "discountType", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Discount type"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Select type"
                options={DISCOUNT_TYPE_OPTIONS}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="discountValue"
            validators={{
              onBlur: ({ value }) => validateField(createDiscountSchema, "discountValue", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Discount value"
                type="number"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="e.g. 20"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="startDate"
            validators={{
              onBlur: ({ value }) => validateField(createDiscountSchema, "startDate", value),
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">Start date</label>
                <DatePicker
                  value={field.state.value}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick start date"
                  minDate={new Date()}
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
                if (start && value < start) return "End date must be on or after start date"
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">End date</label>
                <DatePicker
                  value={field.state.value}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick end date"
                  minDate={
                    form.getFieldValue("startDate")
                      ? new Date(form.getFieldValue("startDate") + "T00:00:00")
                      : new Date()
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

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="customerEligibility">
            {(field) => (
              <Dropdown
                label="Customer eligibility"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select eligibility"
                options={ELIGIBILITY_OPTIONS}
              />
            )}
          </form.Field>
          <form.Field name="usageLimit">
            {(field) => (
              <FormInput
                label="Usage limit"
                type="number"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="e.g. 500 (0 = unlimited)"
              />
            )}
          </form.Field>
        </div>
      </div>
    </Modal>
  )
}
