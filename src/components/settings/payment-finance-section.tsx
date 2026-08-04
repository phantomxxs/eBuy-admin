import { useEffect, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { useStore } from "@tanstack/react-store"
import { useGetPaymentsFinance } from "@/store/queries/settings"
import { useUpdatePaymentsFinance } from "@/store/mutations/settings"
import { showAlert } from "@/store/alerts"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { SectionCard, ToggleRow, SectionLoading } from "./shared"

const REFUND_METHOD_OPTIONS = [
  { label: "Original payment method", value: "original_payment_method" },
  { label: "Store credit", value: "store_credit" },
  { label: "Bank transfer", value: "bank_transfer" },
]

type Props = {
  registerSave: (fn: () => void) => void
  registerDirty: (dirty: boolean) => void
}

export default function PaymentFinanceSection({ registerSave, registerDirty }: Props) {
  const { data: settings, isLoading } = useGetPaymentsFinance()
  const updatePaymentsFinance = useUpdatePaymentsFinance()

  const form = useForm({
    defaultValues: {
      tax_enabled: false as boolean,
      prices_include_tax: false as boolean,
      vat_rate: 7.5,
      show_tax_breakdown_on_receipt: false as boolean,
      refund_window_days: 14,
      refund_method: "original_payment_method",
    },
    onSubmit: async ({ value }) => {
      updatePaymentsFinance.mutate(value, {
        onSuccess: () => showAlert({ variant: "success", message: "Payment settings saved" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      })
    },
  })

  useEffect(() => {
    if (!settings) return
    form.setFieldValue("tax_enabled", settings.tax_enabled)
    form.setFieldValue("prices_include_tax", settings.prices_include_tax)
    form.setFieldValue("vat_rate", settings.vat_rate)
    form.setFieldValue("show_tax_breakdown_on_receipt", settings.show_tax_breakdown_on_receipt)
    form.setFieldValue("refund_window_days", settings.refund_window_days)
    form.setFieldValue("refund_method", settings.refund_method)
  }, [settings])

  const isDirty = useStore(form.store, (s) => s.isDirty)
  useEffect(() => {
    registerDirty(isDirty)
  }, [isDirty, registerDirty])

  const saveFnRef = useRef(() => form.handleSubmit())
  saveFnRef.current = () => form.handleSubmit()

  useEffect(() => {
    registerSave(() => saveFnRef.current())
  }, [registerSave])

  if (isLoading) return <SectionLoading />

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Tax Configuration" subtitle="Manage VAT and tax display settings">
        <div className="divide-borderSubtle flex flex-col divide-y">
          <form.Field name="tax_enabled">
            {(field) => (
              <ToggleRow
                label="Apply VAT to all orders"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(s) => s.values.tax_enabled}>
            {(taxEnabled) =>
              taxEnabled ? (
                <div className="py-4">
                  <form.Field name="vat_rate">
                    {(field) => (
                      <FormInput
                        label="VAT Rate (%)"
                        placeholder="e.g. 7.5"
                        value={String(field.state.value)}
                        onChange={(v) => field.handleChange(parseFloat(v) || 0)}
                        className="max-w-xs"
                      />
                    )}
                  </form.Field>
                </div>
              ) : null
            }
          </form.Subscribe>
          <form.Field name="prices_include_tax">
            {(field) => (
              <ToggleRow
                label="Include tax in product prices"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
          <form.Field name="show_tax_breakdown_on_receipt">
            {(field) => (
              <ToggleRow
                label="Show tax breakdown on receipts"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard title="Refund Rules" subtitle="Define how refunds are handled">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.Field name="refund_window_days">
            {(field) => (
              <FormInput
                label="Refund window (days)"
                placeholder="e.g. 14"
                value={String(field.state.value)}
                onChange={(v) => field.handleChange(Number(v) || 0)}
              />
            )}
          </form.Field>
          <form.Field name="refund_method">
            {(field) => (
              <Dropdown
                label="Preferred refund method"
                options={REFUND_METHOD_OPTIONS}
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>
      </SectionCard>
    </div>
  )
}
