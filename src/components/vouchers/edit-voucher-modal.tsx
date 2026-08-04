import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import Dropdown from "@/components/ui/dropdown"
import { DatePicker } from "@/components/ui/date-picker"
import { validateField } from "@/lib/utils"
import type { Voucher } from "@/types/vouchers"
import { editVoucherSchema, type EditVoucherFormValues } from "@/validations/vouchers"
import { useUpdateVoucher } from "@/store/mutations/vouchers"

interface Props {
  isOpen: boolean
  onClose: () => void
  voucher: Voucher | null
}

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount (₦)", value: "fixed_amount" },
]

export default function EditVoucherModal({ isOpen, onClose, voucher }: Props) {
  const updateVoucher = useUpdateVoucher()

  const form = useForm({
    defaultValues: {
      code: voucher?.code ?? "",
      discountType: voucher?.discountType ?? "",
      discountValue: voucher ? String(voucher.discountValue) : "",
      maxUsage: voucher ? String(voucher.maxUsage) : "",
      startDate: voucher?.startDate ?? "",
      endDate: voucher?.endDate ?? "",
    } satisfies EditVoucherFormValues,
    onSubmit: ({ value }) => {
      if (!voucher) return
      const endDate =
        value.endDate === value.startDate ? `${value.endDate}T23:59:59` : value.endDate
      updateVoucher.mutate(
        {
          id: voucher.id,
          payload: {
            ...(value.code && { code: value.code }),
            discountType: value.discountType as "percentage" | "fixed",
            discountValue: Number(value.discountValue),
            maximumUsage: Number(value.maxUsage),
            startDate: value.startDate,
            endDate,
          },
        },
        { onSuccess: onClose },
      )
    },
  })

  useEffect(() => {
    if (!voucher || !isOpen) return
    form.setFieldValue("code", voucher.code)
    form.setFieldValue("discountType", voucher.discountType)
    form.setFieldValue("discountValue", String(voucher.discountValue))
    form.setFieldValue("maxUsage", String(voucher.maxUsage))
    form.setFieldValue("startDate", voucher.startDate)
    form.setFieldValue("endDate", voucher.endDate)
  }, [voucher, isOpen])

  if (!voucher) return null

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Edit voucher
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {voucher.code}
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
          disabled={updateVoucher.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => void form.handleSubmit()}
          loading={updateVoucher.isPending}
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
      preventClose={updateVoucher.isPending}
      width="560px"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <SectionLabel title="VOUCHER DETAILS" />

        <form.Field
          name="code"
          validators={{ onBlur: ({ value }) => validateField(editVoucherSchema, "code", value) }}
        >
          {(field) => (
            <FormInput
              label="Voucher code"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. SAVE20"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="discountType"
            validators={{
              onBlur: ({ value }) => validateField(editVoucherSchema, "discountType", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Discount type"
                options={DISCOUNT_TYPE_OPTIONS}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Select type"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>

          <form.Field
            name="discountValue"
            validators={{
              onBlur: ({ value }) => validateField(editVoucherSchema, "discountValue", value),
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

          <form.Field
            name="maxUsage"
            validators={{
              onBlur: ({ value }) => validateField(editVoucherSchema, "maxUsage", value),
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
              onBlur: ({ value }) => {
                if (!value) return "End date is required"
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
      </div>
    </Modal>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wide uppercase">
    {title}
  </p>
)
