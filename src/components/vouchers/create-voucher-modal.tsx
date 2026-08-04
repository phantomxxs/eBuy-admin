import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { DatePicker } from "@/components/ui/date-picker"
import { useForm } from "@tanstack/react-form"
import { useCreateVoucher } from "@/store/mutations/vouchers"
import { useGenerateVoucherCode } from "@/store/mutations/vouchers"
import { validateField } from "@/lib/utils"
import { createVoucherSchema, type CreateVoucherFormValues } from "@/validations/vouchers"
import type { CreateVoucherPayload } from "@/types/vouchers"
import { useState } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount (₦)", value: "fixed_amount" },
]

export default function CreateVoucherModal({ isOpen, onClose }: Props) {
  const createVoucher = useCreateVoucher()
  const generateCode = useGenerateVoucherCode()
  const [saveMode, setSaveMode] = useState<"inactive" | "activate">("activate")

  const form = useForm({
    defaultValues: {
      code: "",
      discountType: "",
      discountValue: "",
      maxUsage: "",
      startDate: "",
      endDate: "",
    } satisfies CreateVoucherFormValues,
    onSubmit: ({ value }) => {
      const payload: CreateVoucherPayload = {
        ...(value.code && { code: value.code }),
        discountType: value.discountType as "percentage" | "fixed_amount",
        discountValue: Number(value.discountValue),
        maximumUsage: Number(value.maxUsage),
        startDate: value.startDate,
        endDate: value.endDate,
        saveMode,
      }
      createVoucher.mutate(payload, { onSuccess: onClose })
    },
  })

  const handleAutoGenerate = () => {
    generateCode.mutate(undefined, {
      onSuccess: (data) => form.setFieldValue("code", data.code),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title="Create voucher"
      className="p-0"
      width="560px"
      preventClose={createVoucher.isPending}
      customFooter={
        <div className="border-borderSubtle flex gap-2 border-t px-6 py-4">
          <Button
            variant="subtle"
            onClick={() => {
              setSaveMode("inactive")
              void form.handleSubmit()
            }}
            disabled={createVoucher.isPending}
            className="flex-1"
          >
            Save as draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSaveMode("activate")
              void form.handleSubmit()
            }}
            loading={createVoucher.isPending}
            className="flex-1"
          >
            Create voucher
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Code field with auto-generate */}
        <form.Field
          name="code"
          validators={{
            onBlur: ({ value }) => validateField(createVoucherSchema, "code", value),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="font-jakarta text-brand text-xs font-semibold">Voucher code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <FormInput
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="e.g. SAVE20"
                    error={field.state.meta.errors[0]?.toString()}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoGenerate}
                  loading={generateCode.isPending}
                  className="mt-0"
                >
                  Auto-generate
                </Button>
              </div>
              <p className="font-jakarta text-brand/50 text-xs">
                Leave blank to auto-generate on creation
              </p>
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="discountType"
            validators={{
              onBlur: ({ value }) => validateField(createVoucherSchema, "discountType", value),
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
              onBlur: ({ value }) => validateField(createVoucherSchema, "discountValue", value),
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

        <form.Field
          name="maxUsage"
          validators={{
            onBlur: ({ value }) => validateField(createVoucherSchema, "maxUsage", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Maximum usage"
              type="number"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. 500"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="startDate"
            validators={{
              onBlur: ({ value }) => validateField(createVoucherSchema, "startDate", value),
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
              onBlur: ({ value }) => {
                if (!value) return "End date is required"
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
      </div>
    </Modal>
  )
}
