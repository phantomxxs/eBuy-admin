import { useEffect } from "react"
import { Info } from "lucide-react"
import { useForm } from "@tanstack/react-form"
import Modal from "@/components/ui/modal"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import { Button } from "@/components/ui/button"
import { useProcessRefund } from "@/store/mutations/orders"
import { showAlert } from "@/store/alerts"
import { formatCurrency, validateField } from "@/lib/utils"
import { processRefundSchema, type ProcessRefundFormValues } from "@/validations/orders"
import type { OrderDetail } from "@/types/orders"

interface ProcessRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  order: OrderDetail
}

export default function ProcessRefundModal({
  isOpen,
  onClose,
  onSuccess,
  order,
}: ProcessRefundModalProps) {
  const processRefund = useProcessRefund()

  const form = useForm({
    defaultValues: {
      refundType: "full" as ProcessRefundFormValues["refundType"],
      reason: "",
      notes: "",
    } satisfies ProcessRefundFormValues,
    onSubmit: ({ value }) => {
      processRefund.mutate(
        {
          id: String(order.order_id),
          refundType: value.refundType,
          reason: value.reason,
          notes: value.notes,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Refund initiated successfully" })
            onClose()
            onSuccess?.()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (!isOpen) form.reset()
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={processRefund.isPending}
      variant="dialog"
      title="Process refund"
      customFooter={
        <div className="w-full px-6 pb-6">
          <Button className="w-full!" loading={processRefund.isPending} onClick={form.handleSubmit}>
            Process refund
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 px-6 py-5">
        {/* Summary box */}
        <div className="border-borderSubtle space-y-1 rounded-lg border bg-gray-50 p-4">
          <div className="flex justify-between">
            <span className="font-jakarta text-brand/50 text-sm">Customer</span>
            <span className="font-jakarta text-brand text-sm font-medium">
              {order.customer?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-jakarta text-brand/50 text-sm">Original payment</span>
            <span className="font-jakarta text-brand text-sm font-medium">
              {formatCurrency(order.grand_total)}
            </span>
          </div>
        </div>

        {/* Refund type */}
        <form.Field
          name="refundType"
          validators={{
            onBlur: ({ value }) => validateField(processRefundSchema, "refundType", value),
          }}
        >
          {(field) => (
            <Dropdown
              label="Refund type"
              value={field.state.value}
              onChange={(v) => field.handleChange(v as "full" | "partial")}
              onBlur={field.handleBlur}
              placeholder="Select refund type"
              error={field.state.meta.errors[0]?.toString()}
              options={[
                { label: "Full refund", value: "full" },
                { label: "Partial refund", value: "partial" },
              ]}
            />
          )}
        </form.Field>

        {/* Refund reason */}
        <form.Field
          name="reason"
          validators={{
            onBlur: ({ value }) => validateField(processRefundSchema, "reason", value),
          }}
        >
          {(field) => (
            <Dropdown
              label="Refund reason"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select reason"
              error={field.state.meta.errors[0]?.toString()}
              options={[
                { label: "Customer request", value: "customer_request" },
                { label: "Item damaged", value: "item_damaged" },
                { label: "Out of stock", value: "out_of_stock" },
                { label: "Wrong item", value: "wrong_item" },
              ]}
            />
          )}
        </form.Field>

        {/* Refund to */}
        <FormInput label="Refund to" value="Original card (Paystack)" disabled />

        {/* Notes */}
        <form.Field name="notes">
          {(field) => (
            <FormTextarea
              label="Notes"
              rows={4}
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Include any additional context"
            />
          )}
        </form.Field>

        {/* Info banner */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="font-jakarta text-sm text-amber-800">
            Refunds are processed via Paystack and typically reflect in 3–5 business days. The
            customer will be notified by email.
          </p>
        </div>
      </div>
    </Modal>
  )
}
