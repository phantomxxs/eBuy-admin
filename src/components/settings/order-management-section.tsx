import { useEffect, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { useStore } from "@tanstack/react-store"
import { useGetOrderManagement } from "@/store/queries/settings"
import { useUpdateOrderManagement } from "@/store/mutations/settings"
import { showAlert } from "@/store/alerts"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { SectionCard, ToggleRow, SectionLoading } from "./shared"

const AUTO_REFUND_OPTIONS = [
  { label: "Original payment method", value: "original_payment_method" },
  { label: "Store credit", value: "store_credit" },
  { label: "Manual", value: "manual" },
]

type Props = {
  registerSave: (fn: () => void) => void
  registerDirty: (dirty: boolean) => void
}

export default function OrderManagementSection({ registerSave, registerDirty }: Props) {
  const { data: settings, isLoading } = useGetOrderManagement()
  const updateOrderManagement = useUpdateOrderManagement()

  const form = useForm({
    defaultValues: {
      require_cancellation_reason: false as boolean,
      customer_self_cancel_enabled: false as boolean,
      customer_self_cancel_window_minutes: 30,
      auto_refund_on_cancellation_mode: "original_payment_method",
      new_order_email_to_customer: true as boolean,
      dispatch_notification_to_customer: true as boolean,
      order_prefix: "TUL",
      order_number_start: 1,
    },
    onSubmit: async ({ value }) => {
      updateOrderManagement.mutate(value, {
        onSuccess: () => showAlert({ variant: "success", message: "Order settings saved" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      })
    },
  })

  useEffect(() => {
    if (!settings) return
    form.setFieldValue("require_cancellation_reason", settings.require_cancellation_reason)
    form.setFieldValue("customer_self_cancel_enabled", settings.customer_self_cancel_enabled)
    form.setFieldValue(
      "customer_self_cancel_window_minutes",
      settings.customer_self_cancel_window_minutes,
    )
    form.setFieldValue(
      "auto_refund_on_cancellation_mode",
      settings.auto_refund_on_cancellation_mode,
    )
    form.setFieldValue("new_order_email_to_customer", settings.new_order_email_to_customer)
    form.setFieldValue(
      "dispatch_notification_to_customer",
      settings.dispatch_notification_to_customer,
    )
    form.setFieldValue("order_prefix", settings.order_prefix)
    form.setFieldValue("order_number_start", settings.order_number_start)
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
      <SectionCard title="Cancellation Policy" subtitle="Define how customers can cancel orders">
        <form.Field name="customer_self_cancel_enabled">
          {(field) => (
            <ToggleRow
              label="Allow customers to cancel orders"
              checked={field.state.value}
              onChange={() => field.handleChange(!field.state.value)}
            />
          )}
        </form.Field>
        <div className="mt-4">
          <form.Field name="customer_self_cancel_window_minutes">
            {(field) => (
              <form.Subscribe selector={(s) => s.values.customer_self_cancel_enabled}>
                {(enabled) => (
                  <FormInput
                    label="Cancellation window (minutes)"
                    placeholder="e.g. 30"
                    value={String(field.state.value)}
                    onChange={(v) => field.handleChange(Number(v) || 0)}
                    disabled={!enabled}
                  />
                )}
              </form.Subscribe>
            )}
          </form.Field>
        </div>
        <div className="mt-4">
          <form.Field name="require_cancellation_reason">
            {(field) => (
              <ToggleRow
                label="Require reason for cancellation"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard title="Auto-Refund" subtitle="Configure automatic refund processing">
        <form.Field name="auto_refund_on_cancellation_mode">
          {(field) => (
            <Dropdown
              label="Auto-refund mode on cancellation"
              options={AUTO_REFUND_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </SectionCard>

      <SectionCard title="Order Notifications" subtitle="Control customer and admin order alerts">
        <div className="divide-borderSubtle flex flex-col divide-y">
          <form.Field name="new_order_email_to_customer">
            {(field) => (
              <ToggleRow
                label="Notify customer when order is placed"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
          <form.Field name="dispatch_notification_to_customer">
            {(field) => (
              <ToggleRow
                label="Notify customer when order ships"
                checked={field.state.value}
                onChange={() => field.handleChange(!field.state.value)}
              />
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard title="Order Numbering" subtitle="Customise how order IDs are generated">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.Field name="order_prefix">
            {(field) => (
              <FormInput
                label="Order ID prefix"
                placeholder="TUL"
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
          <form.Field name="order_number_start">
            {(field) => (
              <FormInput
                label="Start number"
                placeholder="1"
                value={String(field.state.value)}
                onChange={(v) => field.handleChange(Number(v) || 1)}
              />
            )}
          </form.Field>
        </div>
      </SectionCard>
    </div>
  )
}
